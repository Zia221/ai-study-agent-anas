from pathlib import Path
from app.services.image_processor import extract_text_from_image
from pypdf import PdfReader
from docx import Document


def extract_text_from_pdf(file_path: Path) -> str:
    reader = PdfReader(file_path)

    pages = []

    for page in reader.pages:
        text = page.extract_text()

        if text:
            pages.append(text)

    return "\n\n".join(pages)


def extract_text_from_docx(file_path: Path) -> str:
    document = Document(file_path)

    paragraphs = []

    for paragraph in document.paragraphs:
        if paragraph.text.strip():
            paragraphs.append(paragraph.text)

    return "\n\n".join(paragraphs)


def extract_text_from_txt(file_path: Path) -> str:
    return file_path.read_text(
        encoding="utf-8",
        errors="ignore",
    )


def extract_text(file_path: Path) -> str:
    extension = file_path.suffix.lower()

    if extension == ".pdf":
        return extract_text_from_pdf(file_path)

    if extension == ".docx":
        return extract_text_from_docx(file_path)

    if extension == ".txt":
        return extract_text_from_txt(file_path)

    if extension in {".png", ".jpg", ".jpeg"}:
        return extract_text_from_image(file_path)

    raise ValueError(
        f"Text extraction is not supported for {extension} yet."
    )