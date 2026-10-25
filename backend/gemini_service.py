import os
import random
from google import genai
from google.genai import types
from google.genai.errors import ServerError
from models import GarmentInfo


def analyze_image(image_bytes: bytes, mime_type: str) -> GarmentInfo:
    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
    prompt = """Analyze this thrift-store garment image. Identify the brand, garment type,
size and product name if visible. Record visible defects (stains, holes, pilling).
Only extract fiber percentages when legible on an actual composition label.
Never guess composition from appearance. Use null for unknown identifying fields,
an empty materials object if the label cannot be read, and an empty defects list
when no defects can be clearly identified. Return structured data."""
    response = None

    for attempt in range(4):
        try:
            response = client.models.generate_content(
                model=os.getenv("GEMINI_MODEL", "gemini-3.8-flash"),
                contents=[
                    prompt,
                    types.Part.from_bytes(
                        data=image_bytes,
                        mime_type=mime_type
                    )
                ],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=GarmentInfo
                ),
            )
            break

        except ServerError as e:
            if e.code != 503 or attempt == 3:
                raise

            delay = min(2 ** attempt, 8) + random.uniform(0, 1)
            print(f"Gemini overloaded. Retrying in {delay:.1f}s...")
            time.sleep(delay)
    if not response.text:
        raise ValueError("Gemini returned no text")
    return GarmentInfo.model_validate_json(response.text)
