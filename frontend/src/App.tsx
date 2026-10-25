
import { useEffect, useRef, useState, type FormEvent } from "react";

function Mark() {
  return (
    <span className="brand">
      <svg aria-hidden="true" className="brand-icon" viewBox="0 0 40 40">
        <path d="M8 11h24M8 20h24M8 29h24" />
        <path d="m11 7 5 26M20 7l-4 26M29 7l-5 26" />
        <path d="m8 11 24 18M32 11 8 29" />
      </svg>
      <b>Wolfweave</b>
    </span>
  );
}

type GarmentMeasurements = {
  pit_to_pit_inches: number | null;
  length_inches: number | null;
};

type PreferredFit = "slim" | "regular" | "relaxed";

type Profile = {
  chest: number | null;
  waist: number | null;
  triggers: string[];
  preferred_fit: PreferredFit;
};

const PROFILE_KEY = "wolfweave-profile";

const OPTIONS = [
  "Wool",
  "Acrylic",
  "Polyester",
  "Nylon",
  "Spandex",
  "Rough seams",
  "Scratchy fabric",
  "Stiff fabric"
];

function ProfilePage({
  initial,
  save,
  cancel
}: {
  initial: Profile;
  save: (profile: Profile) => void;
  cancel?: () => void;
}) {
  const [preferredFit, setPreferredFit] = useState<PreferredFit>(
    initial.preferred_fit ?? "regular"
  );

  const [chest, setChest] = useState(
    initial.chest?.toString() ?? ""
  );

  const [waist, setWaist] = useState(
    initial.waist?.toString() ?? ""
  );

  const [selected, setSelected] = useState<string[]>(
    initial.triggers.filter(x => OPTIONS.includes(x))
  );

  const [custom, setCustom] = useState(
    initial.triggers
      .filter(x => !OPTIONS.includes(x))
      .join(", ")
  );

  const valid = [chest, waist].every(
    v => v === "" || (Number.isFinite(Number(v)) && Number(v) > 0)
  );

  function submit(event: FormEvent) {
    event.preventDefault();

    if (!valid) return;

    const extra = custom
      .split(",")
      .map(x => x.trim())
      .filter(Boolean);

    save({
      chest: chest ? Number(chest) : null,
      waist: waist ? Number(waist) : null,
      triggers: [...new Set([...selected, ...extra])],
      preferred_fit: preferredFit
    });
  }

  function toggle(item: string) {
    setSelected(current =>
      current.includes(item)
        ? current.filter(x => x !== item)
        : [...current, item]
    );
  }

  return (
    <main className="onboard page">
      <header>
        <Mark />
        <span>YOUR COMFORT PROFILE</span>
        {cancel && (
          <button onClick={cancel}>BACK</button>
        )}
      </header>

      <section>
        <div className="landing-intro">
          <p className="kicker">PERSONALIZE YOUR FINDS</p>

          <h1>
            Made for<br />
            <i>your feel.</i>
          </h1>

          <p className="dek">
            Add your measurements and textures you dislike.
            Your preferences stay saved in this browser.
          </p>
        </div>

        <form className="profile-setup" onSubmit={submit}>
          <div className="setup-heading">
            <span>COMFORT PROFILE</span>
            <b>EDIT ANYTIME</b>
          </div>

          <h2>Your measurements</h2>

          <p>
            Body circumference in inches.
            Leave blank if unknown.
          </p>

          <div className="profile-measurements">
            <label>
              Chest (in)
              <input
                type="number"
                min="0.1"
                step="0.1"
                placeholder="e.g. 38"
                value={chest}
                onChange={e => setChest(e.target.value)}
              />
            </label>

            <label>
              Waist (in)
              <input
                type="number"
                min="0.1"
                step="0.1"
                placeholder="e.g. 31"
                value={waist}
                onChange={e => setWaist(e.target.value)}
              />
            </label>
          </div>

          <label className="custom-trigger">
            Preferred fit

            <select
              value={preferredFit}
              onChange={event =>
                setPreferredFit(event.target.value as PreferredFit)
              }
              style={{
                display: "block",
                width: "100%",
                marginTop: 8,
                marginBottom: 24,
                padding: 12,
                background: "#252326",
                color: "#f2efeb",
                border: "1px solid #7e7070",
                borderRadius: 2,
                fontSize: 14
              }}
            >
              <option value="slim">Slim</option>
              <option value="regular">Regular</option>
              <option value="relaxed">Relaxed</option>
            </select>
          </label>

          <h2>Textures & materials to avoid</h2>

          <p>
            Select anything that makes clothing uncomfortable.
            Texture preferences are saved, although not every
            texture can be identified from a photo.
          </p>

          <div className="material-list">
            {OPTIONS.map((item, index) => (
              <button
                type="button"
                key={item}
                className={
                  selected.includes(item) ? "chosen" : ""
                }
                onClick={() => toggle(item)}
              >
                <span>
                  {String(index + 1).padStart(2, "0")}
                </span>

                {item}

                <b>
                  {selected.includes(item) ? "✓" : "+"}
                </b>
              </button>
            ))}
          </div>

          <label className="custom-trigger">
            Other dislikes (comma separated)

            <input
              value={custom}
              onChange={e => setCustom(e.target.value)}
              placeholder="e.g. itchy tags, velvet"
            />
          </label>

          {!valid && (
            <p role="alert">
              Measurements must be positive numbers.
            </p>
          )}

          <button
            className="text-action"
            type="submit"
            disabled={!valid}
          >
            Save & start scanning <span>→</span>
          </button>

          <small>
            Stored in this browser. No account needed.
          </small>
        </form>
      </section>

      <footer>
        WOLFWEAVE / YOUR PERSONAL COMFORT PROFILE
      </footer>
    </main>
  );
}

type Analysis = {
  garment: {
    brand: string | null;
    garment_type: string | null;
    size: string | null;
    product_name: string | null;
    materials: {
      name: string;
      percentage: number | null;
    }[];
    visible_defects: string[];
  };

  sensory_alerts: string[];
  material_status: string;
  fit_status: string;
  condition: string[];

  sources: {
    title: string | null;
    url: string | null;
    snippet: string;
  }[];

  search_error: string | null;

  product_evidence: {
    exact_match: boolean;
    reason: string;
  } | null;

  assessment: {
    fit_status: string;
    fit_message: string;
    sensory_status: string;
    sensory_message: string;
    condition_message: string;
    recommendation: string;
  } | null;
  
  price_rating?: {
    rating: string;
    suggested_max_price: number | null;
    comparable_price: number | null;
    match_type: string;
    message: string;
    source_urls: string[];
  } | null;

};

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

function Scanner({
  scan,
  error,
  editProfile,
  imageUrl
}: {
  scan: (
    file: File,
    measurements: GarmentMeasurements,
    tagFile: File | null
  ) => void;
  error: string | null;
  editProfile: () => void;
  imageUrl: string | null;
}) {
  const input = useRef<HTMLInputElement>(null);

  const tagInput = useRef<HTMLInputElement>(null);

  const [garmentFile, setGarmentFile] = useState<File | null>(null);
  const [garmentPreview, setGarmentPreview] = useState<string | null>(null);
  const [tagFile, setTagFile] = useState<File | null>(null);
  const [tagPreview, setTagPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!tagFile) {
      setTagPreview(null);
      return;
    }

    const url = URL.createObjectURL(tagFile);
    setTagPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [tagFile]);

  useEffect(() => {
    if (!garmentFile) {
      setGarmentPreview(null);
      return;
    }
    const url = URL.createObjectURL(garmentFile);
    setGarmentPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [garmentFile]);

  const [pitToPit, setPitToPit] = useState("");
  const [garmentLength, setGarmentLength] = useState("");

  function positiveOrNull(value: string): number | null {
    const n = Number(value);
    return value.trim() && Number.isFinite(n) && n > 0 ? n : null;
  }

  const validMeasurements =
    (pitToPit.trim() === "" || (Number(pitToPit) > 0 && Number(pitToPit) <= 60)) &&
    (garmentLength.trim() === "" || (Number(garmentLength) > 0 && Number(garmentLength) <= 80));

  function selectImage() {
    input.current?.click();
  }

  return (
    <main className="scanner page">
      <header>
        <Mark />
        <span>GARMENT STUDY / 001</span>

        <button onClick={editProfile}>
          PROFILE
        </button>
      </header>

      <section className="viewfinder">
        <div className="issue">
          ISSUE 01<br />
          LIVE ANALYSIS
        </div>

        <div className="hanger" />

        {(garmentPreview || imageUrl) ? (
          <img
            className="garment-preview"
            src={garmentPreview || imageUrl || undefined}
            alt="Your uploaded garment"
          />
        ) : (
          <div className="sweater">
            <span />
            <b>
              YOUR<br />
              FIND
            </b>
          </div>
        )}

        <div className="scan-line">
          FULL GARMENT / FRONT VIEW
        </div>

        <div className="frame tl" />
        <div className="frame tr" />
        <div className="frame bl" />
        <div className="frame br" />
      </section>

      <section className="scan-copy">
        <div>
          <p>FIT / FEEL / CONDITION</p>

          <h1>
            Find out if<br />
            it’s <i>the one.</i>
          </h1>
        </div>

        <p>
          Add a full garment photo and an optional close-up of its tag.
        </p>
      </section>

      {error && (
        <p
          role="alert"
          style={{
            color: "#b33",
            padding: "0 24px"
          }}
        >
          {error}
        </p>
      )}

      <div className="scanner-controls">
        <div className="scan-actions">
          <button
            aria-label={garmentFile ? "Analyze garment" : "Choose garment photo"}
            title={garmentFile ? "Analyze garment" : "Choose garment photo"}
            className="shutter"
            disabled={!validMeasurements}
            onClick={() => {
              if (!garmentFile) {
                selectImage();
                return;
              }
              scan(garmentFile, {
                pit_to_pit_inches: positiveOrNull(pitToPit),
                length_inches: positiveOrNull(garmentLength),
              }, tagFile);
            }}
          >
            <span />
          </button>
        </div>
        
        <div className="photo-options">
          <p className="scan-hint">
            {garmentFile ? "READY TO ANALYZE / PRESS THE CIRCLE" : "CHOOSE A GARMENT PHOTO TO BEGIN"}
          </p>
          <input
            ref={input}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: "none" }}
            onChange={event => {
              const file = event.target.files?.[0];

              if (file) {
                setGarmentFile(file);
              }

              event.target.value = "";
            }}
          />
          <button type="button" onClick={() => tagInput.current?.click()}>
            {tagFile ? `✓ Tag: ${tagFile.name}` : "+ Add tag photo (optional)"}
          </button>
          <input
            ref={tagInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: "none" }}
            onChange={event => {
              const file = event.target.files?.[0];
              if (file) setTagFile(file);
              event.target.value = "";
            }}
          />
          {tagPreview && (
            <div className="tag-preview">
              <img src={tagPreview} alt="Clothing tag preview" />
              <button type="button" onClick={() => setTagFile(null)}>Remove tag</button>
            </div>
          )}
        </div>
        <section className="fit-inputs" style={{ padding: "20px 24px" }}>
          <p className="kicker">OPTIONAL / FIT GUIDANCE FOR TOPS</p>
          <h2>Measure your find</h2>
          <p>No tag needed. Lay the top flat. Measure across the chest from armpit to armpit, and from shoulder to hem for length.</p>
          <div className="profile-measurements">
            <label>
              Pit-to-pit width (in)
              <input type="number" min="0.1" max="60" step="0.1" placeholder="e.g. 22"
                value={pitToPit} onChange={event => setPitToPit(event.target.value)} />
            </label>
            <label>
              Garment length (in)
              <input type="number" min="0.1" max="80" step="0.1" placeholder="e.g. 27"
                value={garmentLength} onChange={event => setGarmentLength(event.target.value)} />
            </label>
          </div>
          {!validMeasurements && <p role="alert">Measurements must be positive numbers.</p>}
        </section>
      </div>
    </main>
  );
}

function Loading({
  imageUrl
}: {
  imageUrl: string | null;
}) {
  return (
    <main className="loading page">
      <header>
        <Mark />
        <span>READING GARMENT</span>
      </header>

      <div className="loading-art">
        <span>01</span>

        {imageUrl ? (
          <img
            className="loading-preview"
            src={imageUrl}
            alt="Garment being analyzed"
          />
        ) : (
          <div className="mini-garment" />
        )}

        <i />
      </div>

      <div className="loading-copy">
        <p>FIT / FIBRE / FLAWS</p>

        <h1>
          Looking<br />
          <i>closer.</i>
        </h1>

        <span>
          Comparing label, condition and your profile
        </span>
      </div>
    </main>
  );
}

function Report({
  close,
  result,
  imageUrl
}: {
  close: () => void;
  result: Analysis;
  imageUrl: string | null;
}) {
  const [showSources, setShowSources] = useState(false);

  const { garment, assessment } = result;

  const name = [
    garment.brand,
    garment.product_name || garment.garment_type,
    garment.size
  ]
    .filter(Boolean)
    .join(" / ") || "Unidentified garment";

  const materialSummary = garment.materials.length
    ? garment.materials
        .map(m =>
          m.percentage == null
            ? `${m.name} (percentage unknown)`
            : `${m.percentage}% ${m.name}`
        )
        .join(", ")
    : "Fabric composition not confirmed";

  const fit =
    assessment?.fit_message ||
    "Garment measurements not verified.";

  const feel =
    assessment?.sensory_message ||
    "Check the composition label before buying.";

  const condition =
    assessment?.condition_message ||
    (
      garment.visible_defects.length
        ? garment.visible_defects.join(", ")
        : "No visible defects reported."
    );

  const recommendation =
    assessment?.recommendation ||
    "Review the garment in person before buying.";

  return (
    <main className="report page">
      <header>
        <Mark />
        <span>THE VERDICT / 001</span>

        <button onClick={close}>
          CLOSE
        </button>
      </header>

      <section className="report-hero">
        <p>{name.toUpperCase()}</p>

        {imageUrl ? (
          <img
            className="report-preview"
            src={imageUrl}
            alt="Analyzed garment"
          />
        ) : (
          <div className="report-garment">
            <span />
            <b>{garment.size || "?"}</b>
          </div>
        )}

        <span className="page-no">01</span>
      </section>

      <section className="verdict-copy">
        <p className="kicker">
          GARMENT ASSESSMENT
        </p>

        <h1>Take a closer look.</h1>

        <p>{recommendation}</p>
      </section>

      <section className="facts">
        <article>
          <span>01 / FIT</span>

          <h2>
            {assessment?.fit_status || result.fit_status}
          </h2>

          <p>{fit}</p>
        </article>

        <article>
          <span>02 / FEEL</span>

          <h2>{materialSummary}</h2>

          <p>{feel}</p>
        </article>

        <article>
          <span>03 / CONDITION</span>

          <h2>
            {garment.visible_defects.length
              ? "Review defects"
              : "Inspect in person"}
          </h2>

          <p>{condition}</p>
        </article>
      </section>

      {result.sensory_alerts.length > 0 && (
        <section className="price">
          <span>YOUR MATERIAL ALERTS</span>

          <h2>
            {result.sensory_alerts.join(", ")}
          </h2>
        </section>
      )}
            
      <section className="thrift-rating">
        <p className="kicker">04 / THRIFT VALUE</p>

        <h2>
          {result.price_rating?.rating ||
            "Not enough pricing data"}
        </h2>

        {result.price_rating?.suggested_max_price != null && (
          <div className="thrift-price">
            ${result.price_rating.suggested_max_price}
            <span> SUGGESTED MAX PRICE</span>
          </div>
        )}

        <p>
          {result.price_rating?.message ||
            "No reliable comparable price was found."}
        </p>

        {result.price_rating?.comparable_price != null && (
          <small>
            Comparable listing price: $
            {result.price_rating.comparable_price.toFixed(2)}
          </small>
        )}

        {result.price_rating?.match_type === "similar" && (
          <small>
            Estimate based on a similar product, not an exact match.
          </small>
        )}

        {result.price_rating?.source_urls.map((url, index) => (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            View price source {index + 1}
          </a>
        ))}
      </section>


      <button
        className="scan-again"
        onClick={close}
      >
        <span>
          <b>Ready for the next find?</b>
          <small>Your comfort profile is saved.</small>
        </span>

        <strong>
          Scan another item <i>→</i>
        </strong>
      </button>

      <button
        className="source-toggle"
        onClick={() => setShowSources(!showSources)}
      >
        SEARCH RESULTS ({result.sources.length})
        {" — NOT ALL VERIFIED "}
        <span>{showSources ? "−" : "+"}</span>
      </button>

      {showSources && (
        <div className="sources">
          {result.product_evidence && (
            <p>
              {result.product_evidence.exact_match
                ? "Exact product match verified. "
                : "Exact product not verified. "}
              {result.product_evidence.reason}
            </p>
          )}

          {result.search_error && (
            <p>{result.search_error}</p>
          )}

          {result.sources.map((source, index) => (
            <p key={index}>
              {source.url ? (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {source.title || source.url}
                </a>
              ) : (
                source.title || "Untitled source"
              )}
            </p>
          ))}
        </div>
      )}
    </main>
  );
}

export default function App() {
  const [profile, setProfile] = useState<Profile>(() => {
    try {
      const stored = localStorage.getItem(PROFILE_KEY);

      if (stored) {
        const p = JSON.parse(stored);

        const preferredFit: PreferredFit =
          p.preferred_fit === "slim" ||
          p.preferred_fit === "relaxed"
            ? p.preferred_fit
            : "regular";

        return {
          chest: p.chest ?? null,
          waist: p.waist ?? null,
          triggers: Array.isArray(p.triggers) ? p.triggers : [],
          preferred_fit: preferredFit
        };
      }

      return {
        chest: null,
        waist: null,
        triggers: JSON.parse(
          localStorage.getItem("wolfweave-triggers") || "[]"
        ),
        preferred_fit: "regular"
      };
    } catch {
      return {
        chest: null,
        waist: null,
        triggers: [],
        preferred_fit: "regular"
      };
    }
  });

  const [onboarded, setOnboarded] = useState(
    localStorage.getItem("wolfweave-profile-ready") === "true"
  );

  const [editing, setEditing] = useState(false);

  const [view, setView] = useState<
    "scan" | "loading" | "report"
  >("scan");

  const [result, setResult] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [imageUrl, setImageUrl] = useState<string | null>(
    null
  );

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  function saveProfile(next: Profile) {
    localStorage.setItem(
      PROFILE_KEY,
      JSON.stringify(next)
    );

    localStorage.setItem(
      "wolfweave-profile-ready",
      "true"
    );

    setProfile(next);
    setOnboarded(true);
    setEditing(false);
  }

  async function scan(file: File, measurements: GarmentMeasurements, tagFile: File | null) {
    setError(null);

    if (
      !["image/jpeg", "image/png", "image/webp"].includes(
        file.type
      )
    ) {
      setError("Choose a JPEG, PNG, or WebP image.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be 10 MB or smaller.");
      return;
    }

    if (tagFile && (!['image/jpeg', 'image/png', 'image/webp'].includes(tagFile.type) || tagFile.size > 10 * 1024 * 1024)) {
      setError("Tag photo must be JPEG, PNG, or WebP and 10 MB or smaller.");
      return;
    }

    setImageUrl(URL.createObjectURL(file));
    setView("loading");

    try {
      const form = new FormData();

      form.append("image", file);
      if (tagFile) form.append("tag_image", tagFile);
      form.append("measurements", JSON.stringify(measurements));

      form.append(
        "profile",
        JSON.stringify(profile)
      );

      const response = await fetch(
        `${API_URL}/analyze`,
        {
          method: "POST",
          body: form
        }
      );

      if (!response.ok) {
        let detail = "";

        try {
          detail =
            (await response.json()).detail || "";
        } catch {
          // Use HTTP status if the response isn't JSON.
        }

        throw new Error(
          detail || `Scan failed (HTTP ${response.status})`
        );
      }

      const data =
        (await response.json()) as Analysis;

      setResult(data);
      setView("report");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Scan failed. Check that the backend is running."
      );

      setView("scan");
    }
  }

  if (!onboarded || editing) {
    return (
      <ProfilePage
        initial={profile}
        save={saveProfile}
        cancel={
          onboarded
            ? () => setEditing(false)
            : undefined
        }
      />
    );
  }

  if (view === "loading") {
    return <Loading imageUrl={imageUrl} />;
  }

  if (view === "report" && result) {
    return (
      <Report
        close={() => setView("scan")}
        result={result}
        imageUrl={imageUrl}
      />
    );
  }

  return (
    <Scanner
      scan={scan}
      error={error}
      imageUrl={imageUrl}
      editProfile={() => setEditing(true)}
    />
  );
}
