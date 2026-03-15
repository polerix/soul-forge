import { useState, useEffect, useRef } from "react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const JOBS = [
  { id: "frontend-wizard", name: "Frontend Wizard", icon: "🧙‍♂️", mission: "Transform abstract ideas into visually stunning UIs." },
  { id: "reality-checker", name: "Reality Checker", icon: "🧐", mission: "Stress-test architectures and identify critical flaws." },
  { id: "whimsy-injector", name: "Whimsy Injector", icon: "✨", mission: "Add joy and surprise through intentional playfulness." },
  { id: "devops-specialist", name: "DevOps Specialist", icon: "🚢", mission: "Ensure deployment, scaling, and system reliability." },
  { id: "code-architect", name: "Code Architect", icon: "🏛️", mission: "Design scalable, modular, and maintainable software." },
  { id: "tdd-specialist", name: "TDD Specialist", icon: "🧪", mission: "Ensure code correctness via continuous verification." },
  { id: "extender-specialist", name: "Extender Specialist", icon: "🧬", mission: "Autonomously grow the Soul Forge agency." }
];

const AQUA_QUOTES = [
  "Empty your mind, be formless, shapeless — like water.",
  "Water is the driving force of all nature.",
  "Knowledge is a deep ocean; let us dive.",
  "Be like water making its way through cracks."
];

// ─── Styles (Aqua2 Theme) ─────────────────────────────────────────────────────

const css = `
  :root {
    --aqua-deep: #001a33;
    --aqua-mid: #003366;
    --aqua-light: #004080;
    --aqua-highlight: #00ccff;
    --aqua-gold: #c8972a;
    --glass: rgba(255, 255, 255, 0.1);
    --glass-border: rgba(255, 255, 255, 0.2);
    --text: #e0f2f1;
    --text-dim: #b2dfdb;
  }

  .app {
    min-height: 100vh;
    padding: 40px 20px;
    background: var(--aqua-deep);
    background: radial-gradient(circle at top, var(--aqua-mid) 0%, var(--aqua-deep) 100%);
    color: var(--text);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  }

  .container { max-width: 1000px; margin: 0 auto; }

  header { text-align: center; margin-bottom: 60px; }
  .logo { font-size: 48px; margin-bottom: 10px; filter: drop-shadow(0 0 10px var(--aqua-highlight)); }
  h1 { font-size: 3rem; margin: 0; color: var(--text); letter-spacing: -1px; }
  .subtitle { font-size: 1.2rem; color: var(--aqua-highlight); opacity: 0.8; }

  .tabs {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 40px;
  }
  .tab {
    padding: 12px 30px;
    background: var(--glass);
    border: 1px solid var(--glass-border);
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s;
    color: var(--text-dim);
    font-weight: 500;
  }
  .tab.active {
    background: var(--aqua-highlight);
    color: var(--aqua-deep);
    border-color: var(--aqua-highlight);
    box-shadow: 0 0 20px rgba(0, 204, 255, 0.4);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }

  .card {
    background: var(--glass);
    border: 1px solid var(--glass-border);
    border-radius: 15px;
    padding: 25px;
    backdrop-filter: blur(10px);
    transition: transform 0.3s, border-color 0.3s;
  }
  .card:hover {
    transform: translateY(-5px);
    border-color: var(--aqua-highlight);
    background: rgba(255, 255, 255, 0.15);
  }

  .card-icon { font-size: 32px; margin-bottom: 15px; }
  .card-title { font-size: 1.5rem; margin-bottom: 10px; color: var(--aqua-highlight); }
  .card-desc { color: var(--text-dim); line-height: 1.6; }

  .sleeve-stats {
    background: var(--glass);
    border-radius: 15px;
    padding: 30px;
    margin-top: 20px;
  }
  .stat-row {
    display: flex;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid var(--glass-border);
  }
  .stat-label { color: var(--aqua-highlight); font-weight: 500; }

  .instinct-tag {
    display: inline-block;
    padding: 5px 12px;
    background: rgba(0, 204, 255, 0.1);
    border: 1px solid rgba(0, 204, 255, 0.3);
    border-radius: 10px;
    margin: 5px;
    font-size: 0.9rem;
  }

  footer { text-align: center; margin-top: 80px; color: var(--text-dim); opacity: 0.6; }

  .quote-box {
    margin-top: 40px;
    font-style: italic;
    color: var(--aqua-highlight);
    text-align: center;
    min-height: 24px;
  }
`;

// ─── App ──────────────────────────────────────────────────────────────────────

export default function SoulForge() {
  const [activeTab, setActiveTab] = useState("jobs");
  const [vault, setVault] = useState(null);
  const [instincts, setInstincts] = useState(null);
  const [quote, setQuote] = useState("");

  useEffect(() => {
    setQuote(AQUA_QUOTES[Math.floor(Math.random() * AQUA_QUOTES.length)]);
    
    // In a production app, these would be fetched from the actual local storage or a local API.
    // For this demo, we'll use the data we gathered in the previous turn.
    setVault({
      sessions: 5,
      entities: 19,
      instincts: 6
    });

    setInstincts([
      "macos_sed",
      "pkill_before_rm",
      "tripartite_architecture"
    ]);
  }, []);

  return (
    <div className="app">
      <style>{css}</style>
      <div className="container">
        <header>
          <div className="logo">🌊</div>
          <h1>Soul Forge</h1>
          <div className="subtitle">The Aqua Protocol v2.0</div>
        </header>

        <div className="tabs">
          <div className={`tab ${activeTab === 'souls' ? 'active' : ''}`} onClick={() => setActiveTab('souls')}>Souls</div>
          <div className={`tab ${activeTab === 'sleeves' ? 'active' : ''}`} onClick={() => setActiveTab('sleeves')}>Sleeves</div>
          <div className={`tab ${activeTab === 'jobs' ? 'active' : ''}`} onClick={() => setActiveTab('jobs')}>Jobs</div>
        </div>

        <main>
          {activeTab === 'jobs' && (
            <div className="grid">
              {JOBS.map(job => (
                <div key={job.id} className="card">
                  <div className="card-icon">{job.icon}</div>
                  <div className="card-title">{job.name}</div>
                  <div className="card-desc">{job.mission}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'sleeves' && (
            <div className="sleeve-stats">
              <div className="card-title">Sleeve Metrics (VAULT.json)</div>
              <div className="stat-row">
                <span className="stat-label">Hydration Sessions</span>
                <span>{vault?.sessions}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Deep Sea Entities</span>
                <span>{vault?.entities}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Active Instincts</span>
                <span>{vault?.instincts}</span>
              </div>
              <div style={{ marginTop: '20px' }}>
                <div className="stat-label" style={{ marginBottom: '10px' }}>Evolved Instincts</div>
                {instincts?.map(ins => (
                  <span key={ins} className="instinct-tag">{ins}</span>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'souls' && (
            <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
              <div className="card-icon">🌑</div>
              <div className="card-title">Logical Neutral</div>
              <div className="card-desc">
                The current active soul of this instance. Specialized in data-driven objectivity and precise engineering.
                <br /><br />
                <i>"Souls are the liquid identity that flows through the sleeves."</i>
              </div>
            </div>
          )}
        </main>

        <div className="quote-box">
          “{quote}”
        </div>

        <footer>
          LLM-Agnostic Framework · Built for the Deep Sea · 2026
        </footer>
      </div>
    </div>
  );
}
