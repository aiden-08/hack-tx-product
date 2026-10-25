from pydantic import BaseModel, Field
from typing import Literal

class UserProfile(BaseModel):
    chest: float | None = Field(default=None, gt=0, description="Chest circumference in inches")
    waist: float | None = Field(default=None, gt=0, description="Waist circumference in inches")
    triggers: list[str] = Field(default_factory=list)
    preferred_fit: Literal["slim", "regular", "relaxed"] = "regular"


class GarmentMeasurements(BaseModel):
    pit_to_pit_inches: float | None = Field(default=None, gt=0, le=60)
    length_inches: float | None = Field(default=None, gt=0, le=80)


class Material(BaseModel):
    name: str
    percentage: float | None = Field(default=None, ge=0, le=100)


class GarmentInfo(BaseModel):
    brand: str | None
    garment_type: str | None
    size: str | None
    product_name: str | None
    materials: list[Material]
    visible_defects: list[str]


class Source(BaseModel):
    title: str | None = None
    url: str | None = None
    snippet: str = ""


class ProductEvidence(BaseModel):
    exact_match: bool
    reason: str
    materials: list[Material]
    chest_inches: float | None
    length_inches: float | None
    source_urls: list[str]


class FinalAssessment(BaseModel):
    fit_status: str
    fit_message: str
    sensory_status: str
    sensory_message: str
    condition_message: str
    recommendation: str

class PriceRating(BaseModel):
    rating: str
    suggested_max_price: float | None = None
    comparable_price: float | None = None
    match_type: str
    message: str
    source_urls: list[str] = Field(default_factory=list)


class Report(BaseModel):
    garment: GarmentInfo
    sensory_alerts: list[str]
    material_status: str
    fit_status: str
    condition: list[str]
    sources: list[Source]
    search_error: str | None = None
    product_evidence: ProductEvidence | None = None
    assessment: FinalAssessment | None = None
    price_rating: PriceRating | None = None
