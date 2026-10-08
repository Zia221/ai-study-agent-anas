from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.tests import router as tests_router
from app.db.database import Base, engine
from app.api.documents import router as documents_router
from app.api.settings import router as settings_router
from app.core.logging_config import configure_logging
from app.db import models
from fastapi import Request
from fastapi.responses import JSONResponse
from app.api.rag import router as rag_router
from app.api.learning_agent import router as learning_agent_router
from app.api.auth import router as auth_router
from app.api.notes import router as notes_router
from app.api.upload import router as upload_router
from app.api.progress import router as progress_router
from app.api.tutor import router as tutor_router
from app.api.flashcards import router as flashcards_router

configure_logging()
app = FastAPI(
    title="AI Study Agent API",
    version="1.0.0",
)
Base.metadata.create_all(bind=engine)


# Allow the React frontend to communicate with FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://ai-study-agent-anas.vercel.app",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(upload_router)
app.include_router(rag_router)
app.include_router(tutor_router)
app.include_router(settings_router)
app.include_router(tests_router)
app.include_router(flashcards_router)
app.include_router(notes_router)
app.include_router(progress_router)
app.include_router(auth_router)
app.include_router(documents_router)
app.include_router(learning_agent_router)


@app.get("/")
async def root():
    return {
        "message": "AI Study Agent Backend is running!"
    }
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "AI Study Agent",
    }
@app.exception_handler(Exception)
async def global_exception_handler(
    request: Request,
    exc: Exception,
):
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An unexpected server error occurred."
        },
    )