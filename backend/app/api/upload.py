from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.database import get_db
from app.db.models import User
from app.services.document_service import save_uploaded_file


router = APIRouter(
    prefix="/api/upload",
    tags=["Upload"],
)


@router.post("/")
async def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        result = await save_uploaded_file(
            file=file,
            user_id=current_user.id,
            db=db,
        )

        return {
            "message": "Document uploaded successfully",
            "document": {
                "id": result["document_id"],
                "filename": result["filename"],
                "file_type": result["file_type"],
                "file_size": result["file_size"],
                "status": "ready",
            },
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )

    except Exception as error:
        print("UPLOAD ERROR:", repr(error))

        raise HTTPException(
            status_code=500,
            detail="Unable to process the document.",
        )