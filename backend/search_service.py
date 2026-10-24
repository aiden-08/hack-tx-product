import os
import requests
from models import GarmentInfo, Source


def search_garment(garment: GarmentInfo) -> list[Source]:
    terms = [garment.brand, garment.product_name, garment.garment_type, garment.size,
             "fabric composition size chart"]
    query = " ".join(str(term) for term in terms if term)
    response = requests.get(
        "https://serpapi.com/search.json",
        params={"engine": "google", "q": query, "api_key": os.environ["SERPAPI_KEY"], "num": 4},
        timeout=12,
    )
    response.raise_for_status()
    payload = response.json()
    if payload.get("error"):
        raise RuntimeError(payload["error"])
    return [Source(title=item.get("title"), url=item.get("link"),
                   snippet=item.get("snippet") or "")
            for item in payload.get("organic_results", [])[:4]]
