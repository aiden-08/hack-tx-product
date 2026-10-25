
import { useRef, useState } from "react";

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

function Onboarding({ done }: { done: (triggers: string[]) => void }) {
  const [selected, setSelected] = useState(["Wool"]);
  const materials = ["Wool", "Acrylic", "Polyester", "Rough seams"];
  return (
    <main className="onboard page">
      <header><Mark /><span>COMFORT PROFILE / 01</span></header>
      <section>
        <div className="landing-intro">
          <p className="kicker">THRIFT WITH MORE CONFIDENCE.</p>
          <h1>Know before<br />you <i>wear.</i></h1>
          <p className="dek">Scan any garment to understand its fit, feel and condition—in seconds.</p>
          <div className="how-it-works">
            <span><b>01</b> Set your preferences</span>
            <span><b>02</b> Photograph the label</span>
            <span><b>03</b> Get your verdict</span>
          </div>
        </div>
        <div className="profile-setup">
          <div className="setup-heading">
            <span>QUICK SETUP</span>
            <b>{selected.length} selected</b>
          </div>
          <h2>What should we flag?</h2>
          <p>Choose materials or details you prefer to avoid.</p>
          <div className="material-list">
            {materials.map((item, index) => (
              <button
                className={selected.includes(item) ? "chosen" : ""}
                key={item}
                onClick={() => setSelected((all) => all.includes(item) ? all.filter((x) => x !== item) : [...all, item])}
              >
                <span>0{index + 1}</span>{item}<b>{selected.includes(item) ? "✓" : "+"}</b>
              </button>
            ))}
          </div>
          <button className="text-action" onClick={() => done(selected)}>Start scanning <span>→</span></button>
          <small>No account needed. Change this anytime.</small>
        </div>
      </section>
      <footer>WOLFWEAVE / PRIVATE BY DESIGN — STORED ON THIS DEVICE</footer>
    </main>
  );
}

type Analysis = {
  garment: {
    brand: string | null;
    garment_type: string | null;
    size: string | null;
    product_name: string | null;
    materials: { name: string; percentage: number }[];
    visible_defects: string[];
  };
  sensory_alerts: string[];
  material_status: string;
  fit_status: string;
  condition: string[];
  sources: { title: string | null; url: string | null; snippet: string }[];
  search_error: string | null;
  product_evidence: { exact_match: boolean; reason: string } | null;
  assessment: {
    fit_status: string;
    fit_message: string;
    sensory_status: string;
    sensory_message: string;
    condition_message: string;
    recommendation: string;
  } | null;
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function Scanner({ scan, error, editProfile }: {
  scan: (file: File) => void;
  error: string | null;
  editProfile: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <main className="scanner page">
      <header><Mark /><span>GARMENT STUDY / 001</span><button onClick={editProfile}>PROFILE</button></header>
      <section className="viewfinder">
        <div className="issue">ISSUE 01<br />LIVE ANALYSIS</div>
        <div className="hanger" />
        <div className="sweater"><span /><b>YOUR<br />FIND</b></div>
        <div className="scan-line">PLACE LABEL WITHIN FRAME</div>
        <div className="frame tl" /><div className="frame tr" /><div className="frame bl" /><div className="frame br" />
      </section>
      <section className="scan-copy">
        <div><p>FIT / FEEL / CONDITION</p><h1>Find out if<br />it’s <i>the one.</i></h1></div>
        <p>Photograph the full garment and collar label in one frame.</p>
      </section>
      {error && <p role="alert" style={{ color: "#b33", padding: "0 24px" }}>{error}</p>}
      <div className="scan-actions">
        <button onClick={() => input.current?.click()}>Upload</button>
        <button aria-label="Scan garment" className="shutter" onClick={() => input.current?.click()}><span /></button>
        <button onClick={() => input.current?.click()}>Choose photo</button>
        <input accept="image/jpeg,image/png,image/webp" onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) scan(file);
          event.target.value = "";
        }} ref={input} type="file" style={{ display: "none" }} />
      </div>
    </main>
  );
}

function Loading() {
  return (
    <main className="loading page">
      <header><Mark /><span>READING GARMENT</span></header>
      <div className="loading-art"><span>01</span><div className="mini-garment" /><i /></div>
      <div className="loading-copy"><p>FIT / FIBRE / FLAWS</p><h1>Looking<br /><i>closer.</i></h1><span>Comparing label, condition and your profile</span></div>
    </main>
  );
}

function Report({ close, result }: { close: () => void; result: Analysis }) {
  const [showSources, setShowSources] = useState(false);
  const { garment, assessment } = result;
  const name = [garment.brand, garment.product_name || garment.garment_type, garment.size]
    .filter(Boolean).join(" / ") || "Unidentified garment";
  const materialSummary = garment.materials.length
    ? garment.materials.map((m) => `${m.percentage}% ${m.name}`).join(", ")
    : "Fabric composition not confirmed";
  const fit = assessment?.fit_message || "Garment measurements not verified.";
  const feel = assessment?.sensory_message || "Check the composition label before buying.";
  const condition = assessment?.condition_message ||
    (garment.visible_defects.length ? garment.visible_defects.join(", ") : "No visible defects reported.");
  const recommendation = assessment?.recommendation || "Review the garment in person before buying.";

  return (
    <main className="report page">
      <header><Mark /><span>THE VERDICT / 001</span><button onClick={close}>CLOSE</button></header>
      <section className="report-hero">
        <p>{name.toUpperCase()}</p>
        <div className="report-garment"><span /><b>{garment.size || "?"}</b></div>
        <span className="page-no">01</span>
      </section>
      <section className="verdict-copy">
        <p className="kicker">GARMENT ASSESSMENT</p>
        <h1>Take a closer look.</h1>
        <p>{recommendation}</p>
      </section>
      <section className="facts">
        <article><span>01 / FIT</span><h2>{assessment?.fit_status || result.fit_status}</h2><p>{fit}</p></article>
        <article><span>02 / FEEL</span><h2>{materialSummary}</h2><p>{feel}</p></article>
        <article><span>03 / CONDITION</span><h2>{garment.visible_defects.length ? "Review defects" : "Inspect in person"}</h2><p>{condition}</p></article>
      </section>
      {result.sensory_alerts.length > 0 && (
        <section className="price"><span>YOUR MATERIAL ALERTS</span><h2>{result.sensory_alerts.join(", ")}</h2></section>
      )}
      <button className="scan-again" onClick={close}>
        <span><b>Ready for the next find?</b><small>Your comfort profile is saved.</small></span>
        <strong>Scan another item <i>→</i></strong>
      </button>
      <button className="source-toggle" onClick={() => setShowSources(!showSources)}>
        SEARCH RESULTS ({result.sources.length}) — NOT ALL VERIFIED <span>{showSources ? "−" : "+"}</span>
      </button>
      {showSources && <div className="sources">
        {result.product_evidence && <p>{result.product_evidence.exact_match ? "Exact product match verified." : "Exact product not verified."} {result.product_evidence.reason}</p>}
        {result.search_error && <p>{result.search_error}</p>}
        {result.sources.map((source, index) => <p key={index}>
          {source.url ? <a href={source.url} target="_blank" rel="noopener noreferrer">{source.title || source.url}</a> : (source.title || "Untitled source")}
        </p>)}
      </div>}
    </main>
  );
}

export default function App() {
  const [triggers, setTriggers] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("wolfweave-triggers") || "null") || []; }
    catch { return []; }
  });
  const [onboarded, setOnboarded] = useState(localStorage.getItem("wolfweave-profile-ready") === "true");
  const [view, setView] = useState<"scan" | "loading" | "report">("scan");
  const [result, setResult] = useState<Analysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function scan(file: File) {
    setError(null);
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be 10 MB or smaller.");
      return;
    }
    setView("loading");
    try {
      const form = new FormData();
      form.append("image", file);
      form.append("profile", JSON.stringify({ chest: null, waist: null, triggers }));
      const response = await fetch(`${API_URL}/analyze`, { method: "POST", body: form });
      if (!response.ok) {
        let detail = "";
        try { detail = (await response.json()).detail || ""; } catch { /* ignore */ }
        throw new Error(detail || `Scan failed (HTTP ${response.status})`);
      }
      const data = (await response.json()) as Analysis;
      setResult(data);
      setView("report");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed. Check that the backend is running.");
      setView("scan");
    }
  }

  if (!onboarded) return <Onboarding done={(selected) => {
    setTriggers(selected);
    localStorage.setItem("wolfweave-triggers", JSON.stringify(selected));
    localStorage.setItem("wolfweave-profile-ready", "true");
    setOnboarded(true);
  }} />;
  if (view === "loading") return <Loading />;
  if (view === "report" && result) return <Report close={() => setView("scan")} result={result} />;
  return <Scanner scan={scan} error={error} editProfile={() => setOnboarded(false)} />;
}
