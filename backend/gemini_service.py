import os
import time
import random
from google import genai
from google.genai import types
from google.genai.errors import ServerError
from models import GarmentInfo


def analyze_image(
    image_bytes: bytes,
    mime_type: str,
    tag_bytes: bytes | None = None,
    tag_mime_type: str | None = None,
) -> GarmentInfo:
    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

    prompt = """Analyze the provided thrift-store garment photo.
If a second image is included, it is a close-up of the garment's tag.

Identify the brand, garment type, size and product name if visible.
Record visible defects such as stains, holes and pilling.

Prioritize readable tag information for brand, size and fiber composition.
Read the garment's material information from its label.

If the label identifies materials without percentages, include
those materials with percentage set to null.

Only assign numeric percentages when explicitly printed on the label.

Never guess percentages or materials from appearance.

For example, if a label says "Mohair/Wool Blend", return:
- Mohair: percentage null
- Wool: percentage null

Use null for unknown identifying fields, an empty materials list
when composition cannot be verified, and an empty defects list
when no defects can be clearly identified.

Do not invent product information. Return structured data."""

    contents = [
        prompt,
        types.Part.from_bytes(
            data=image_bytes,
            mime_type=mime_type
        )
    ]

    if tag_bytes is not None and tag_mime_type is not None:
        contents.append(
            types.Part.from_bytes(
                data=tag_bytes,
                mime_type=tag_mime_type
            )
        )

    response = None

    for attempt in range(4):
        try:
            response = client.models.generate_content(
                model=os.getenv("GEMINI_MODEL", "gemini-3.8-flash"),
                contents=contents,
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

    if response is None or not response.text:
        raise ValueError("Gemini returned no text")

    return GarmentInfo.model_validate_json(response.text)