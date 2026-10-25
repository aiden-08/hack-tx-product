
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

type Profile = {
  chest: number | null;
  waist: number | null;
  triggers: string[];
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
      triggers: [...new Set([...selected, ...extra])]
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
          <button onClick={cancel}>CANCEL</button>
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
      percentage: number;
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
};

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

function Scanner({
  scan,
  error,
  editProfile,
  imageUrl
}: {
  scan: (file: File) => void;
  error: string | null;
  editProfile: () => void;
  imageUrl: string | null;
}) {
  const input = useRef<HTMLInputElement>(null);

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

        {imageUrl ? (
          <img
            className="garment-preview"
            src={imageUrl}
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
          PLACE LABEL WITHIN FRAME
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
          Photograph the full garment and collar label
          in one frame.
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

      <div className="scan-actions">
        <button onClick={selectImage}>
          Upload
        </button>

        <button
          aria-label="Scan garment"
          className="shutter"
          onClick={selectImage}
        >
          <span />
        </button>

        <button onClick={selectImage}>
          Choose photo
        </button>

        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: "none" }}
          onChange={event => {
            const file = event.target.files?.[0];

            if (file) scan(file);

            event.target.value = "";
          }}
        />
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
        .map(m => `${m.percentage}% ${m.name}`)
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

        return {
          chest: p.chest ?? null,
          waist: p.waist ?? null,
          triggers: Array.isArray(p.triggers)
            ? p.triggers
            : []
        };
      }

      return {
        chest: null,
        waist: null,
        triggers: JSON.parse(
          localStorage.getItem("wolfweave-triggers") || "[]"
        )
      };
    } catch {
      return {
        chest: null,
        waist: null,
        triggers: []
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

  async function scan(file: File) {
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

    setImageUrl(URL.createObjectURL(file));
    setView("loading");

    try {
      const form = new FormData();

      form.append("image", file);

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
