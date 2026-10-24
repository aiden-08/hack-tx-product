# Thrift Fit Scanner — FastAPI backend

This is a working starter backend for Gemini image extraction + SerpApi search.
It does **not** yet verify search snippets against exact garment listings, calculate fit,
or infer fiber percentages from search results. Unknown fit is intentionally returned as `unknown`.

## Run on Windows PowerShell

```powershell
cd thrift_backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `.env` and add your Gemini and SerpApi API keys. Then:

```powershell
uvicorn main:app --reload
```

Open http://127.0.0.1:8000/docs and test `POST /analyze`.

Form fields:
- `image`: JPEG, PNG, or WebP file (max 10 MB)
- `profile`: JSON string, e.g. `{"chest":38,"waist":31,"triggers":["wool","acrylic"]}`

## React fetch example

```javascript
const form = new FormData();
form.append("image", imageFile);
form.append("profile", JSON.stringify({ chest: 38, waist: 31, triggers: ["wool"] }));
const response = await fetch("http://localhost:8000/analyze", { method: "POST", body: form });
if (!response.ok) throw new Error(await response.text());
const report = await response.json();
console.log(report);
```

Do not commit `.env` or API keys. Search result links are leads, **not** verified garment specifications.
