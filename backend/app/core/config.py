import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent.parent

UPLOAD_DIR = BASE_DIR / "uploads"

MAX_FILE_SIZE = 10 * 1024 * 1024

ALLOWED_EXTENSIONS = {
    ".pdf",
    ".png",
    ".jpg",
    ".jpeg",
    ".docx",
    ".txt",
}

ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

DEBUG = os.getenv("DEBUG", "false").lower() == "true"

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

JWT_ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 60

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")


if ENVIRONMENT == "production" and not JWT_SECRET_KEY:
    raise RuntimeError(
        "JWT_SECRET_KEY must be configured in production."
    )