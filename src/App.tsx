import { useEffect, useRef, useState } from "react";

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

function Onboarding({ done }: { done: () => void }) {
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
          <button className="text-action" onClick={done}>Start scanning <span>→</span></button>
          <small>No account needed. Change this anytime.</small>
        </div>
      </section>
      <footer>WOLFWEAVE / PRIVATE BY DESIGN — STORED ON THIS DEVICE</footer>
    </main>
  );
}

function Scanner({ scan }: { scan: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  return (
    <main className="scanner page">
      <header><Mark /><span>GARMENT STUDY / 001</span><button>PROFILE</button></header>
      <section className="viewfinder">
        <div className="issue">ISSUE 01<br />LIVE ANALYSIS</div>
        <div className="hanger" />
        <div className="sweater"><span /><b>J.CREW<br />M</b></div>
        <div className="scan-line">PLACE LABEL WITHIN FRAME</div>
        <div className="frame tl" /><div className="frame tr" /><div className="frame bl" /><div className="frame br" />
      </section>
      <section className="scan-copy">
        <div><p>FIT / FEEL / CONDITION</p><h1>Find out if<br />it’s <i>the one.</i></h1></div>
        <p>Photograph the full garment and collar label in one frame.</p>
      </section>
      <div className="scan-actions">
        <button onClick={() => input.current?.click()}>Upload</button>
        <button aria-label="Scan garment" className="shutter" onClick={scan}><span /></button>
        <button onClick={scan}>Demo</button>
        <input accept="image/*" onChange={scan} ref={input} type="file" />
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

function Report({ close }: { close: () => void }) {
  const [sources, setSources] = useState(false);
  return (
    <main className="report page">
      <header><Mark /><span>THE VERDICT / 001</span><button onClick={close}>CLOSE</button></header>
      <section className="report-hero">
        <p>J.CREW HERITAGE KNIT / WOMEN’S M</p>
        <div className="report-garment"><span /><b>M</b></div>
        <span className="page-no">01</span>
      </section>
      <section className="verdict-copy">
        <p className="kicker">A GOOD FIND</p>
        <h1>Keep it.</h1>
        <p>Relaxed through the chest, slightly cropped, and in very good condition.</p>
      </section>
      <section className="facts">
        <article><span>01 / FIT</span><h2>Boxy medium</h2><p>+2″ chest ease</p></article>
        <article><span>02 / FEEL</span><h2>Soft, slight texture</h2><p>10% wool — below your limit</p></article>
        <article><span>03 / CONDITION</span><h2>Very good</h2><p>Light pilling, no visible holes</p></article>
      </section>
      <section className="price"><span>THE EDITOR’S NOTE</span><h2>Worth it under <i>$28</i></h2></section>
      <button className="scan-again" onClick={close}>
        <span><b>Ready for the next find?</b><small>Your comfort profile is saved.</small></span>
        <strong>Scan another item <i>→</i></strong>
      </button>
      <button className="source-toggle" onClick={() => setSources(!sources)}>
        VERIFIED AGAINST 4 LIVE SOURCES <span>{sources ? "−" : "+"}</span>
      </button>
      {sources && <div className="sources">J.Crew size archive / Garment care archive<br />Two current resale listings</div>}
    </main>
  );
}

export default function App() {
  const [onboarded, setOnboarded] = useState(localStorage.getItem("thriftlens-profile") === "ready");
  const [view, setView] = useState<"scan" | "loading" | "report">("scan");

  useEffect(() => {
    if (view !== "loading") return;
    const timer = window.setTimeout(() => setView("report"), 1800);
    return () => window.clearTimeout(timer);
  }, [view]);

  if (!onboarded) return <Onboarding done={() => { localStorage.setItem("thriftlens-profile", "ready"); setOnboarded(true); }} />;
  if (view === "loading") return <Loading />;
  if (view === "report") return <Report close={() => setView("scan")} />;
  return <Scanner scan={() => setView("loading")} />;
}
