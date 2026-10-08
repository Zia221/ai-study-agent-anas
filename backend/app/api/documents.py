from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi import HTTPException
from pathlib import Path

from app.services.rag_service import delete_document_chunks
from app.db.database import get_db
from app.core.security import get_current_user
from app.db.models import Document

router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"],
)


@router.get("")
async def get_documents(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    documents = (
        db.query(Document)
        .filter(Document.user_id == current_user.id)
        .order_by(Document.uploaded_at.desc())
        .all()
    )

    return {
        "documents": [
            {
                "id": document.id,
                "filename": document.filename,
                "file_type": document.file_type,
                "file_size": document.file_size,
                "status": document.status,
                "uploaded_at": document.uploaded_at,    
                  }
            for document in documents
        ]
    }

@router.delete("/{document_id}")
async def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    document = (
        db.query(Document)
        .filter(
            Document.id == document_id,
            Document.user_id == current_user.id,
        )
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found",
        )

    file_path = Path(document.file_path)

    if file_path.exists():
        file_path.unlink()

    deleted_chunks = delete_document_chunks(
    document_id=document.id,
    user_id=current_user.id,
)

    db.delete(document)
    db.commit()

    return {
        "message": "Document deleted successfully",
        "deleted_chunks": deleted_chunks,
    }