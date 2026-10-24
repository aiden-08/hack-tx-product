import os
from google import genai
from google.genai import types
from models import GarmentInfo


def analyze_image(image_bytes: bytes, mime_type: str) -> GarmentInfo:
    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    prompt = """Analyze this thrift-store garment image. Identify the brand, garment type,
size and product name if visible. Record visible defects (stains, holes, pilling).
Only extract fiber percentages when legible on an actual composition label.
Never guess composition from appearance. Use null for unknown identifying fields,
an empty materials object if the label cannot be read, and an empty defects list
when no defects can be clearly identified. Return structured data."""
    response = client.models.generate_content(
        model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
        contents=[prompt, types.Part.from_bytes(data=image_bytes, mime_type=mime_type)],
        config=types.GenerateContentConfig(
            response_mime_type="application/json", response_schema=GarmentInfo
        ),
    )
    if not response.text:
        raise ValueError("Gemini returned no text")
    return GarmentInfo.model_validate_json(response.text)
