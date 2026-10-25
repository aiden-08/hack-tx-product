
import os
import re
import requests
from statistics import median

from models import GarmentInfo, Source, ProductEvidence


def get_price_rating(
    garment: GarmentInfo,
    sources: list[Source],
    evidence: ProductEvidence,
) -> dict:
    """Estimate a thrift price using comparable online listings."""

    prices = []
    source_urls = []
    match_type = "none"

    brand = (garment.brand or "").strip()
    product = (garment.product_name or "").strip()
    kind = (garment.garment_type or "").strip()

    # Search Google Shopping for structured product prices.
    if os.getenv("SERPAPI_KEY") and brand:
        query = " ".join(part for part in [brand, product, kind] if part)

        try:
            response = requests.get(
                "https://serpapi.com/search.json",
                params={
                    "engine": "google_shopping",
                    "q": query,
                    "gl": "us",
                    "hl": "en",
                    "api_key": os.environ["SERPAPI_KEY"],
                },
                timeout=15,
            )
            response.raise_for_status()
            data = response.json()

            if data.get("error"):
                raise RuntimeError(data["error"])

            print(
                "SHOPPING RESULTS:",
                len(data.get("shopping_results", []))
            )

            product_words = [
                word.casefold()
                for word in product.split()
                if len(word) >= 4
            ]

            kind_words = [
                word.casefold()
                for word in kind.split()
                if len(word) >= 4
            ]

            for item in data.get("shopping_results", []):
                title = (item.get("title") or "").casefold()
                price = item.get("extracted_price")

                if not isinstance(price, (int, float)):
                    continue

                if not 5 <= price <= 2000:
                    continue

                if brand.casefold() not in title:
                    continue

                # Prefer the named product, if Gemini found one.
                if product_words:
                    if not any(word in title for word in product_words):
                        continue
                elif kind_words:
                    if not any(word in title for word in kind_words):
                        continue

                prices.append(float(price))

                url = item.get("product_link") or item.get("link")
                if url:
                    source_urls.append(url)

            if prices:
                # Shopping results alone are not verified exact matches.
                match_type = "similar"

        except Exception as exc:
            print("SHOPPING SEARCH ERROR:", repr(exc))

    # Fallback: look for explicit prices in existing sources.
    if not prices:
        exact_urls = set(evidence.source_urls) if evidence.exact_match else set()
        exact_prices = []
        similar_prices = []
        exact_source_urls = []
        similar_source_urls = []

        for source in sources:
            title = source.title or ""
            combined = f"{title} {source.snippet or ''}"

            matches = re.findall(
                r"(?<!\w)\$\s*(\d{1,4}(?:,\d{3})*(?:\.\d{2})?)\b",
                combined,
            )

            valid_prices = [
                float(value.replace(",", ""))
                for value in matches
                if 5 <= float(value.replace(",", "")) <= 2000
            ]

            if not valid_prices:
                continue

            if source.url and source.url in exact_urls:
                exact_prices.extend(valid_prices)
                exact_source_urls.append(source.url)

            elif brand and brand.casefold() in title.casefold():
                similar_prices.extend(valid_prices)
                if source.url:
                    similar_source_urls.append(source.url)

        if exact_prices:
            prices = exact_prices
            source_urls = exact_source_urls
            match_type = "exact"
        elif similar_prices:
            prices = similar_prices
            source_urls = similar_source_urls
            match_type = "similar"

    if not prices:
        return {
            "rating": "Not enough pricing data",
            "suggested_max_price": None,
            "comparable_price": None,
            "match_type": "none",
            "message": (
                "No reliable comparable price was found. "
                "Check similar listings before buying."
            ),
            "source_urls": [],
        }

    comparable = round(median(prices), 2)

    # Heuristic: recommend paying at most 40% of comparable price.
    threshold = round(comparable * 0.40)

    if garment.visible_defects:
        threshold = round(threshold * 0.75)

    threshold = max(1, threshold)

    return {
        "rating": "Good find if below threshold",
        "suggested_max_price": threshold,
        "comparable_price": comparable,
        "match_type": match_type,
        "message": (
            f"This item could be a good find if it costs "
            f"less than ${threshold}. "
            f"Comparable online listings suggest "
            f"approximately ${comparable:.2f}. "
            f"{'Exact product evidence.' if match_type == 'exact' else 'Based on similar products.'}"
        ),
        "source_urls": list(dict.fromkeys(source_urls))[:5],
    }
