import os
import requests
from models import GarmentInfo, Source


def search_garment(garment: GarmentInfo) -> list[Source]:
    """Search for product identity and composition, deduplicating results."""
    if not garment.brand and not garment.product_name:
        return []

    brand = f'"{garment.brand}"' if garment.brand else ""
    product = f'"{garment.product_name}"' if garment.product_name else ""
    kind = garment.garment_type or "clothing"
    queries = [
        f"{brand} {product} {kind} official clothing".strip(),
        f"{brand} {product} {kind} fabric composition size chart".strip(),
    ]
    results = []
    seen = set()
    for query in queries:
        response = requests.get(
            "https://serpapi.com/search.json",
            params={"engine": "google", "q": query,
                    "api_key": os.environ["SERPAPI_KEY"], "num": 5},
            timeout=12,
        )
        response.raise_for_status()
        payload = response.json()
        if payload.get("error"):
            raise RuntimeError(payload["error"])
        for item in payload.get("organic_results", []):
            url = item.get("link")
            if not url or url in seen:
                continue
            seen.add(url)
            results.append(Source(title=item.get("title"), url=url,
                                  snippet=item.get("snippet") or ""))
    return results[:8]
