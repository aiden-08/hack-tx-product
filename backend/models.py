from pydantic import BaseModel, Field


class UserProfile(BaseModel):
    chest: float | None = Field(default=None, gt=0, description="Chest circumference in inches")
    waist: float | None = Field(default=None, gt=0, description="Waist circumference in inches")
    triggers: list[str] = Field(default_factory=list)


class GarmentInfo(BaseModel):
    brand: str | None = None
    garment_type: str | None = None
    size: str | None = None
    product_name: str | None = None
    materials: dict[str, float] = Field(default_factory=dict)
    visible_defects: list[str] = Field(default_factory=list)


class Source(BaseModel):
    title: str | None = None
    url: str | None = None
    snippet: str = ""


class Report(BaseModel):
    garment: GarmentInfo
    sensory_alerts: list[str]
    material_status: str
    fit_status: str
    condition: list[str]
    sources: list[Source]
    search_error: str | None = None
