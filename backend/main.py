import os
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError
from starlette.concurrency import run_in_threadpool
from gemini_service import analyze_image
from search_service import search_garment
from models import Report, UserProfile

app = FastAPI(title="Thrift Fit Scanner API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze", response_model=Report)
async def analyze(image: UploadFile = File(...), profile: str = Form(...)):
    if image.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(status_code=400, detail="Use JPEG, PNG, or WebP")
    try:
        user = UserProfile.model_validate_json(profile)
    except ValidationError as exc:
        raise HTTPException(status_code=400, detail="Invalid user profile") from exc

    image_bytes = await image.read(10 * 1024 * 1024 + 1)
    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image exceeds 10 MB")
    if not image_bytes:
        raise HTTPException(status_code=400, detail="Image is empty")

    try:
        garment = await run_in_threadpool(analyze_image, image_bytes, image.content_type)
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Image analysis failed; check Gemini key/model") from exc

    sources = []
    search_error = None
    if garment.brand or garment.product_name:
        if os.getenv("SERPAPI_KEY"):
            try:
                sources = await run_in_threadpool(search_garment, garment)
            except Exception:
                search_error = "Product search unavailable"
        else:
            search_error = "SERPAPI_KEY not configured"

    alerts = [trigger for trigger in user.triggers
              if any(trigger.casefold() == material.casefold() and percentage > 0
                     for material, percentage in garment.materials.items())]
    return Report(
        garment=garment,
        sensory_alerts=alerts,
        material_status="label_read" if garment.materials else "unknown",
        fit_status="unknown",  # Measurements from the garment are not yet verified.
        condition=garment.visible_defects,
        sources=sources,
        search_error=search_error,
    )
