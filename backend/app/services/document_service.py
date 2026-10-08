import logging
import uuid
from pathlib import Path

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.config import (
    ALLOWED_EXTENSIONS,
    MAX_FILE_SIZE,
    UPLOAD_DIR,
)

from app.db.models import Document

from app.services.document_processor import extract_text
from app.services.text_chunker import chunk_text
from app.services.rag_service import add_chunks


logger = logging.getLogger(__name__)


async def save_uploaded_file(
    file: UploadFile,
    user_id: int,
    db: Session,
) -> dict:

    logger.info("Document processing started")

    # ---------------------------------
    # Validate filename
    # ---------------------------------

    if not file.filename:
        raise ValueError("Filename is required.")

    original_filename = file.filename

    # ---------------------------------
    # Prevent duplicate filenames
    # ---------------------------------

    existing_document = (
        db.query(Document)
        .filter(
            Document.user_id == user_id,
            Document.filename == original_filename,
        )
        .first()
    )

    if existing_document:
        raise ValueError(
            "A document with this filename already exists."
        )

    # ---------------------------------
    # Validate extension
    # ---------------------------------

    extension = Path(original_filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise ValueError("Unsupported file type.")

    # ---------------------------------
    # Read file
    # ---------------------------------

    content = await file.read()

    # ---------------------------------
    # Validate size
    # ---------------------------------

    if len(content) > MAX_FILE_SIZE:
        raise ValueError(
            "File is too large."
        )

    # ---------------------------------
    # Create upload directory
    # ---------------------------------

    UPLOAD_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    # ---------------------------------
    # Generate safe filename
    # ---------------------------------

    safe_filename = f"{uuid.uuid4()}{extension}"

    file_path = UPLOAD_DIR / safe_filename

    # ---------------------------------
    # Save file
    # ---------------------------------

    file_path.write_bytes(content)

    try:
        # ---------------------------------
        # Extract text
        # ---------------------------------

        extracted_text = extract_text(file_path)

        # ---------------------------------
        # Reject empty documents
        # ---------------------------------

        if not extracted_text or not extracted_text.strip():
            raise ValueError(
                "No readable text was found."
            )

        # ---------------------------------
        # Create chunks
        # ---------------------------------

        chunks = chunk_text(extracted_text)

        if not chunks:
            raise ValueError(
                "No readable text was found."
            )

        # ---------------------------------
        # Create database document
        # ---------------------------------

        document = Document(
            user_id=user_id,
            filename=original_filename,
            file_path=str(file_path),
            file_type=file.content_type,
            file_size=len(content),
            status="processing",
        )

        db.add(document)
        db.commit()
        db.refresh(document)

        # ---------------------------------
        # Index chunks in RAG
        # ---------------------------------

        indexed_chunks = add_chunks(
            chunks=chunks,
            document_name=original_filename,
            document_id=document.id,
            user_id=user_id,
        )

        # ---------------------------------
        # Mark document ready
        # ---------------------------------

        document.status = "ready"

        db.commit()
        db.refresh(document)

        logger.info(
            "Document processing completed successfully"
        )

        return {
            "document_id": document.id,
            "filename": original_filename,
            "file_path": str(file_path),
            "file_size": len(content),
            "file_type": file.content_type,
            "text_length": len(extracted_text),
            "chunk_count": len(chunks),
            "indexed_chunks": indexed_chunks,
        }

    except Exception:
        logger.exception(
            "Document processing failed"
        )

        if file_path.exists():
            file_path.unlink()

        db.rollback()

        raise