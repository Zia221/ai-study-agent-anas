import base64
import os
from pathlib import Path

from openai import OpenAI


client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)


def image_to_data_url(file_path: Path) -> str:
    extension = file_path.suffix.lower()

    mime_types = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
    }

    mime_type = mime_types.get(extension)

    if not mime_type:
        raise ValueError("Unsupported image format.")

    image_bytes = file_path.read_bytes()

    encoded_image = base64.b64encode(
        image_bytes
    ).decode("utf-8")

    return f"data:{mime_type};base64,{encoded_image}"


def extract_text_from_image(file_path: Path) -> str:
    image_data_url = image_to_data_url(file_path)

    response = client.responses.create(
        model="gpt-5.6-luna",
        input=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": (
                            "Read this study image carefully. "
                            "Extract all useful educational text. "
                            "Preserve headings, questions, formulas, "
                            "and important labels. "
                            "Return only the extracted content."
                        ),
                    },
                    {
                        "type": "input_image",
                        "image_url": image_data_url,
                    },
                ],
            }
        ],
    )

    return response.output_text.strip()