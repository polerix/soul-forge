import { useState, useEffect, useRef } from "react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const SEED_CHARACTERS = [
  { id: "sherlock-holmes", name: "Sherlock Holmes", author: "Arthur Conan Doyle", year: 1887, genre: "Mystery", era: "Victorian" },
  { id: "dracula", name: "Count Dracula", author: "Bram Stoker", year: 1897, genre: "Horror", era: "Gothic" },
  { id: "hamlet", name: "Prince Hamlet", author: "William Shakespeare", year: 1603, genre: "Tragedy", era: "Renaissance" },
  { id: "don-quixote", name: "Don Quixote", author: "Cervantes", year: 1605, genre: "Satire", era: "Early Modern" },
  { id: "jekyll-hyde", name: "Dr. Jekyll & Hyde", author: "R.L. Stevenson", year: 1886, genre: "Horror", era: "Victorian" },
  { id: "elizabeth-bennet", name: "Elizabeth Bennet", author: "Jane Austen", year: 1813, genre: "Romance", era: "Regency" },
  { id: "ahab", name: "Captain Ahab", author: "Herman Melville", year: 1851, genre: "Adventure", era: "19th Century" },
  { id: "dorian-gray", name: "Dorian Gray", author: "Oscar Wilde", year: 1890, genre: "Philosophical", era: "Victorian" },
  { id: "robinson-crusoe", name: "Robinson Crusoe", author: "Daniel Defoe", year: 1719, genre: "Adventure", era: "Enlightenment" },
  { id: "alice", name: "Alice", author: "Lewis Carroll", year: 1865, genre: "Fantasy", era: "Victorian" },
  { id: "odysseus", name: "Odysseus", author: "Homer", year: -800, genre: "Epic", era: "Ancient Greek" },
  { id: "raskolnikov", name: "Raskolnikov", author: "Dostoevsky", year: 1866, genre: "Psychological", era: "Russian Realism" },
  { id: "emma-woodhouse", name: "Emma Woodhouse", author: "Jane Austen", year: 1815, genre: "Comedy", era: "Regency" },
  { id: "ivan-karamazov", name: "Ivan Karamazov", author: "Dostoevsky", year: 1880, genre: "Philosophical", era: "Russian Realism" },
  { id: "cyrano-bergerac", name: "Cyrano de Bergerac", author: "Rostand", year: 1897, genre: "Drama", era: "Romantic" },
];

const GENRE_COLORS = {
  Mystery: "#c8a97e",
  Horror: "#c0392b",
  Tragedy: "#8e44ad",
  Satire: "#e67e22",
  Romance: "#e91e8c",
  Adventure: "#27ae60",
  Philosophical: "#2980b9",
  Fantasy: "#16a085",
  Epic: "#f39c12",
  Psychological: "#6c3483",
  Comedy: "#f1c40f",
  Drama: "#d35400",
};

// ─── Soul Generator Prompt ────────────────────────────────────────────────────

function buildSoulPrompt(character) {
  return `You are a master of AI personality engineering. Generate a complete SOUL.md file for the public domain character "${character.name}" from "${character.author}" (${character.year > 0 ? character.year : Math.abs(character.year) + " BCE"}).

A SOUL.md file defines an AI agent's persistent personality, values, communication style, and behavioral philosophy. It is written in Markdown and structured with these sections:

# SOUL.md — [Character Name]
## Core Identity
## Core Truths (5–7 deeply-held beliefs/worldviews in first person)
## Communication Style (tone, vocabulary, mannerisms, verbal tics)
## Behavioral Rules (what this agent does and refuses to do)
## The Vibe (3–5 lines capturing the essence)
## Signature Phrases (5 example lines this agent might say)

Write it as if this character IS the agent — first-person, present tense, specific, opinionated, and true to the literary source. Make it vivid, non-generic, and deeply characteristic. Capture contradictions, obsessions, and authentic voice.

Return ONLY the SOUL.md content in valid Markdown. No preamble, no explanation.`;
}

// ─── API Call ─────────────────────────────────────────────────────────────────

async function generateSoul(character, onChunk) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      stream: true,
      messages: [{ role: "user", content: buildSoulPrompt(character) }],
    }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const lines = decoder.decode(value).split("\n");
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const json = JSON.parse(line.slice(6));
          if (json.type === "content_block_delta" && json.delta?.text) {
            full += json.delta.text;
            onChunk(full);
          }
        } catch { }
      }
    }
  }
  return full;
}

// ─── Components ───────────────────────────────────────────────────────────────

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600;700&family=IM+Fell+English:ital@0;1&family=JetBrains+Mono:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink: #0a0906;
    --parchment: #f5ead8;
    --gold: #c8972a;
    --gold-light: #e8b84b;
    --ember: #c0392b;
    --mist: #8b8070;
    --surface: #13100d;
    --surface2: #1e1a15;
    --surface3: #2a2420;
    --border: rgba(200,151,42,0.2);
    --border-bright: rgba(200,151,42,0.5);
    --text: #e8dcc8;
    --text-dim: #9e8e78;
  }

  body { background: var(--ink); color: var(--text); font-family: 'IM Fell English', Georgia, serif; }

  .app { min-height: 100vh; background: var(--ink); position: relative; overflow-x: hidden; }

  .noise {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
    opacity: 0.4;
  }

  .content { position: relative; z-index: 1; }

  /* ── Header ── */
  .header {
    text-align: center;
    padding: 60px 20px 40px;
    border-bottom: 1px solid var(--border);
    position: relative;
  }
  .header::before {
    content: '';
    position: absolute;
    top: 0; left: 50%; transform: translateX(-50%);
    width: 600px; height: 400px;
    background: radial-gradient(ellipse at center, rgba(200,151,42,0.08) 0%, transparent 70%);
    pointer-events: none;
  }
  .header-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.3em;
    color: var(--gold);
    text-transform: uppercase;
    margin-bottom: 16px;
  }
  .header-title {
    font-family: 'Cinzel Decorative', serif;
    font-size: clamp(28px, 5vw, 52px);
    color: var(--gold-light);
    line-height: 1.1;
    text-shadow: 0 0 60px rgba(200,151,42,0.3);
    margin-bottom: 12px;
  }
  .header-sub {
    font-family: 'IM Fell English', serif;
    font-style: italic;
    font-size: 16px;
    color: var(--mist);
    max-width: 500px;
    margin: 0 auto 40px;
    line-height: 1.6;
  }

  /* ── Search ── */
  .search-wrap {
    max-width: 600px;
    margin: 0 auto;
    position: relative;
  }
  .search-input {
    width: 100%;
    background: var(--surface2);
    border: 1px solid var(--border-bright);
    border-radius: 4px;
    padding: 16px 50px 16px 20px;
    font-family: 'Cinzel', serif;
    font-size: 15px;
    color: var(--text);
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .search-input::placeholder { color: var(--mist); font-style: italic; }
  .search-input:focus {
    border-color: var(--gold);
    box-shadow: 0 0 20px rgba(200,151,42,0.15);
  }
  .search-icon {
    position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
    color: var(--gold); opacity: 0.6; font-size: 18px;
  }

  /* ── Main Layout ── */
  .main { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }

  .section-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.35em;
    color: var(--gold);
    text-transform: uppercase;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, var(--border-bright), transparent);
  }

  /* ── Character Grid ── */
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
    margin-bottom: 48px;
  }

  .char-card {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 20px;
    cursor: pointer;
    transition: border-color 0.2s, transform 0.15s, box-shadow 0.2s;
    position: relative;
    overflow: hidden;
  }
  .char-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(to right, transparent, var(--genre-color, var(--gold)), transparent);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .char-card:hover {
    border-color: var(--border-bright);
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  }
  .char-card:hover::before { opacity: 1; }
  .char-card.generated { border-color: rgba(200,151,42,0.3); }

  .char-name {
    font-family: 'Cinzel', serif;
    font-size: 14px;
    font-weight: 700;
    color: var(--text);
    margin-bottom: 4px;
    line-height: 1.3;
  }
  .char-meta {
    font-family: 'IM Fell English', serif;
    font-style: italic;
    font-size: 12px;
    color: var(--mist);
    margin-bottom: 12px;
    line-height: 1.4;
  }
  .char-badges {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  .badge {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    letter-spacing: 0.1em;
    padding: 3px 7px;
    border-radius: 2px;
    text-transform: uppercase;
  }
  .badge-genre {
    background: rgba(200,151,42,0.1);
    color: var(--genre-color, var(--gold));
    border: 1px solid rgba(200,151,42,0.2);
  }
  .badge-ready {
    background: rgba(39,174,96,0.1);
    color: #27ae60;
    border: 1px solid rgba(39,174,96,0.2);
  }
  .badge-pending {
    background: rgba(230,126,34,0.1);
    color: #e67e22;
    border: 1px solid rgba(230,126,34,0.2);
  }

  /* ── Not Found ── */
  .not-found {
    background: var(--surface2);
    border: 1px dashed var(--border-bright);
    border-radius: 6px;
    padding: 40px;
    text-align: center;
    margin-bottom: 32px;
  }
  .not-found-title {
    font-family: 'Cinzel', serif;
    font-size: 18px;
    color: var(--text);
    margin-bottom: 8px;
  }
  .not-found-sub {
    font-family: 'IM Fell English', serif;
    font-style: italic;
    color: var(--mist);
    font-size: 14px;
  }

  /* ── Progress Bar ── */
  .progress-wrap {
    margin-bottom: 20px;
  }
  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  .progress-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.12em;
    color: var(--gold);
    text-transform: uppercase;
  }
  .progress-pct {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--mist);
  }
  .progress-track {
    height: 4px;
    background: var(--surface3);
    border-radius: 2px;
    overflow: hidden;
    position: relative;
  }
  .progress-fill {
    height: 100%;
    border-radius: 2px;
    background: linear-gradient(to right, var(--gold), var(--gold-light));
    transition: width 0.4s ease;
    position: relative;
  }
  .progress-fill::after {
    content: '';
    position: absolute;
    top: 0; right: 0;
    width: 40px; height: 100%;
    background: linear-gradient(to right, transparent, rgba(255,255,255,0.3));
    animation: shimmer 1.2s ease-in-out infinite;
  }
  @keyframes shimmer {
    0% { opacity: 0; }
    50% { opacity: 1; }
    100% { opacity: 0; }
  }
  .progress-status {
    font-family: 'IM Fell English', serif;
    font-style: italic;
    font-size: 12px;
    color: var(--mist);
    margin-top: 6px;
  }

  .btn {
    font-family: 'Cinzel', serif;
    font-size: 12px;
    letter-spacing: 0.08em;
    padding: 10px 18px;
    border-radius: 4px;
    border: 1px solid var(--gold);
    background: rgba(200,151,42,0.1);
    color: var(--gold-light);
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }
  .btn:hover { background: rgba(200,151,42,0.2); box-shadow: 0 0 12px rgba(200,151,42,0.2); }
  .btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-ghost { border-color: var(--border); color: var(--mist); }
  .btn-ghost:hover { border-color: var(--border-bright); color: var(--text); background: var(--surface3); }
  .btn-success { border-color: #27ae60; color: #27ae60; background: rgba(39,174,96,0.1); }

  /* ── Modal ── */
  .modal-overlay {
    position: fixed; inset: 0;
    background: rgba(5,4,3,0.92);
    z-index: 100;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 40px 20px;
    overflow-y: auto;
    backdrop-filter: blur(4px);
  }
  .modal {
    background: var(--surface);
    border: 1px solid var(--border-bright);
    border-radius: 8px;
    width: 100%;
    max-width: 720px;
    box-shadow: 0 32px 80px rgba(0,0,0,0.8), 0 0 60px rgba(200,151,42,0.05);
    animation: modalIn 0.25s ease;
  }
  @keyframes modalIn {
    from { opacity: 0; transform: translateY(20px) scale(0.98); }
    to { opacity: 1; transform: none; }
  }
  .modal-header {
    padding: 28px 32px 20px;
    border-bottom: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
  }
  .modal-title {
    font-family: 'Cinzel Decorative', serif;
    font-size: 20px;
    color: var(--gold-light);
    line-height: 1.2;
  }
  .modal-subtitle {
    font-family: 'IM Fell English', serif;
    font-style: italic;
    color: var(--mist);
    font-size: 13px;
    margin-top: 4px;
  }
  .close-btn {
    background: none;
    border: 1px solid var(--border);
    color: var(--mist);
    width: 32px; height: 32px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    flex-shrink: 0;
  }
  .close-btn:hover { border-color: var(--ember); color: var(--ember); }

  .modal-body { padding: 24px 32px; }

  .generating-state {
    text-align: center;
    padding: 40px 20px;
  }
  .flame {
    font-size: 40px;
    animation: flicker 1.5s ease-in-out infinite alternate;
    display: inline-block;
    margin-bottom: 16px;
  }
  @keyframes flicker {
    from { transform: scaleY(1) rotate(-2deg); opacity: 0.8; }
    to { transform: scaleY(1.05) rotate(2deg); opacity: 1; }
  }
  .generating-text {
    font-family: 'Cinzel', serif;
    color: var(--gold);
    font-size: 14px;
    margin-bottom: 8px;
  }
  .generating-sub {
    font-family: 'IM Fell English', serif;
    font-style: italic;
    color: var(--mist);
    font-size: 13px;
  }

  .soul-preview {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 20px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12.5px;
    line-height: 1.7;
    color: var(--text-dim);
    white-space: pre-wrap;
    word-break: break-word;
    max-height: 420px;
    overflow-y: auto;
    margin-bottom: 20px;
  }
  .soul-preview::-webkit-scrollbar { width: 4px; }
  .soul-preview::-webkit-scrollbar-track { background: transparent; }
  .soul-preview::-webkit-scrollbar-thumb { background: var(--border-bright); border-radius: 2px; }

  /* markdown styling in preview */
  .soul-preview .md-h1 { color: var(--gold-light); font-size: 14px; font-family: 'Cinzel', serif; }
  .soul-preview .md-h2 { color: var(--gold); font-size: 12.5px; font-family: 'Cinzel', serif; margin-top: 12px; }
  .soul-preview .md-bullet { color: var(--text); }

  .modal-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  /* ── Toast ── */
  .toast {
    position: fixed;
    bottom: 32px;
    right: 32px;
    background: var(--surface2);
    border: 1px solid var(--border-bright);
    border-left: 3px solid var(--gold);
    border-radius: 4px;
    padding: 14px 20px;
    font-family: 'Cinzel', serif;
    font-size: 13px;
    color: var(--text);
    z-index: 200;
    animation: toastIn 0.3s ease;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  }
  @keyframes toastIn {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: none; }
  }

  /* ── Footer ── */
  .footer {
    text-align: center;
    padding: 40px 20px;
    border-top: 1px solid var(--border);
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.15em;
    color: var(--mist);
    opacity: 0.5;
  }

  @media (max-width: 600px) {
    .notify-form { flex-direction: column; }
    .modal { margin: 0; border-radius: 8px 8px 0 0; }
    .modal-overlay { align-items: flex-end; padding: 0; }
    .modal-header { padding: 20px; }
    .modal-body { padding: 16px 20px; }
    .grid { grid-template-columns: 1fr 1fr; }
  }
`;

// ─── Markdown renderer ────────────────────────────────────────────────────────

function renderSoulMd(text) {
  const lines = text.split("\n").map((line, i) => {
    if (line.startsWith("# ")) return <div key={i} style={{ color: "#e8b84b", fontFamily: "'Cinzel', serif", fontSize: "13px", marginTop: "8px" }}>{line.slice(2)}</div>;
    if (line.startsWith("## ")) return <div key={i} style={{ color: "#c8972a", fontFamily: "'Cinzel', serif", marginTop: "10px" }}>{line.slice(3)}</div>;
    if (line.startsWith("- ") || line.startsWith("* ")) return <div key={i} style={{ color: "#e8dcc8", paddingLeft: "8px" }}>{"• " + line.slice(2)}</div>;
    if (line.trim() === "") return <div key={i} style={{ height: "6px" }} />;
    return <div key={i}>{line}</div>;
  });
  return <>{lines}</>;
}

// ─── App ──────────────────────────────────────────────────────────────────────

// Estimated total chars for a full SOUL.md (used for progress)
const ESTIMATED_CHARS = 2200;

export default function SoulForge() {
  const [query, setQuery] = useState("");
  const [souls, setSouls] = useState({});
  const [modal, setModal] = useState(null); // { character, state: 'idle'|'generating'|'done', content }
  const [toast, setToast] = useState(null);
  const streamRef = useRef("");
  const [streamContent, setStreamContent] = useState("");

  // Load from storage
  useEffect(() => {
    (async () => {
      try {
        const s = await window.storage.get("souls-registry");
        if (s) setSouls(JSON.parse(s.value));
      } catch { }
    })();
  }, []);

  const saveSouls = async (updated) => {
    setSouls(updated);
    try { await window.storage.set("souls-registry", JSON.stringify(updated)); } catch { }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Filter characters
  const filtered = query.length > 1
    ? SEED_CHARACTERS.filter(c =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.author.toLowerCase().includes(query.toLowerCase()) ||
      c.genre.toLowerCase().includes(query.toLowerCase())
    )
    : SEED_CHARACTERS;

  const hasMatch = filtered.length > 0;

  const openModal = (character) => {
    setModal({ character, state: souls[character.id] ? "done" : "idle", content: souls[character.id] || "" });
    setStreamContent(souls[character.id] || "");
  };

  const startGeneration = async () => {
    if (!modal) return;
    const char = modal.character;
    setModal(m => ({ ...m, state: "generating" }));
    streamRef.current = "";
    setStreamContent("");
    try {
      const content = await generateSoul(char, (chunk) => {
        streamRef.current = chunk;
        setStreamContent(chunk);
      });
      const updated = { ...souls, [char.id]: content };
      await saveSouls(updated);
      setModal(m => ({ ...m, state: "done", content }));
      showToast(`${char.name}'s soul has been forged`);
    } catch (err) {
      setModal(m => ({ ...m, state: "idle" }));
      showToast("The summoning failed. Try again.");
    }
  };

  const downloadSoul = (character, content) => {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SOUL-${character.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };



  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="noise" />
        <div className="content">
          {/* Header */}
          <header className="header">
            <div className="header-eyebrow">OpenClaw · SOUL.md · Public Domain Archive</div>
            <h1 className="header-title">The Soul Forge</h1>
            <p className="header-sub">
              Summon the personalities of literary immortals — forged as SOUL.md files,<br />
              ready to inhabit your AI agents.
            </p>
            <div className="search-wrap">
              <input
                className="search-input"
                placeholder="Search for a character, author, or genre…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <span className="search-icon">⚗</span>
            </div>
          </header>

          <main className="main">
            {/* Character grid */}
            {hasMatch ? (
              <>
                <div className="section-label">
                  {query ? `${filtered.length} souls found` : "Available Souls"}
                </div>
                <div className="grid">
                  {filtered.map(char => {
                    const isReady = !!souls[char.id];
                    const color = GENRE_COLORS[char.genre] || "#c8972a";
                    return (
                      <div
                        key={char.id}
                        className={`char-card${isReady ? " generated" : ""}`}
                        style={{ "--genre-color": color }}
                        onClick={() => openModal(char)}
                      >
                        <div className="char-name">{char.name}</div>
                        <div className="char-meta">{char.author} · {char.year > 0 ? char.year : Math.abs(char.year) + " BCE"}</div>
                        <div className="char-badges">
                          <span className="badge badge-genre" style={{ color, borderColor: color + "33", background: color + "11" }}>{char.genre}</span>
                          <span className={`badge ${isReady ? "badge-ready" : "badge-pending"}`}>
                            {isReady ? "✦ Ready" : "⊹ Forge"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : null}

            {/* Not found */}
            {query.length > 1 && !hasMatch && (
              <div className="not-found">
                <div className="not-found-title">"{query}" has not yet been catalogued</div>
                <div className="not-found-sub">This soul has not yet been added to the archive.</div>
              </div>
            )}
          </main>

          <footer className="footer">
            All characters are in the public domain · SOUL.md format by OpenClaw · Powered by Claude
          </footer>
        </div>

        {/* Modal */}
        {modal && (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
            <div className="modal">
              <div className="modal-header">
                <div>
                  <div className="modal-title">{modal.character.name}</div>
                  <div className="modal-subtitle">{modal.character.author} · {modal.character.era} · {modal.character.genre}</div>
                </div>
                <button className="close-btn" onClick={() => setModal(null)}>×</button>
              </div>

              <div className="modal-body">
                {modal.state === "idle" && (
                  <>
                    <div style={{ textAlign: "center", padding: "40px 20px" }}>
                      <div style={{ fontSize: "48px", marginBottom: "16px" }}>🜂</div>
                      <div style={{ fontFamily: "'Cinzel', serif", color: "var(--text)", fontSize: "15px", marginBottom: "8px" }}>
                        This soul has not yet been forged
                      </div>
                      <div style={{ fontFamily: "'IM Fell English', serif", fontStyle: "italic", color: "var(--mist)", fontSize: "13px", marginBottom: "28px" }}>
                        Claude will summon {modal.character.name}'s personality as a SOUL.md file,<br />
                        capturing their voice, values, and behavioral essence.
                      </div>
                      <button className="btn" onClick={startGeneration} style={{ fontSize: "13px", padding: "12px 28px" }}>
                        ⚗ Forge This Soul
                      </button>
                    </div>
                  </>
                )}

                {modal.state === "generating" && (() => {
                  const pct = Math.min(100, Math.round((streamContent.length / ESTIMATED_CHARS) * 100));
                  const phases = [
                    "The forge ignites…",
                    "The soul stirs in the embers…",
                    "Personality crystallising…",
                    "Voice and values taking form…",
                    "Almost forged…",
                  ];
                  const phase = phases[Math.min(Math.floor(pct / 20), phases.length - 1)];
                  return (
                    <>
                      <div className="progress-wrap">
                        <div className="progress-header">
                          <span className="progress-label">Forging Soul</span>
                          <span className="progress-pct">{pct}%</span>
                        </div>
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${Math.max(4, pct)}%` }} />
                        </div>
                        <div className="progress-status">{phase}</div>
                      </div>
                      {streamContent && (
                        <div className="soul-preview">{renderSoulMd(streamContent)}</div>
                      )}
                    </>
                  );
                })()}

                {modal.state === "done" && (
                  <>
                    <div className="soul-preview">{renderSoulMd(streamContent || modal.content)}</div>
                    <div className="modal-actions">
                      <button className="btn btn-ghost" onClick={() => setModal(null)}>Close</button>
                      <button className="btn btn-success" onClick={() => downloadSoul(modal.character, modal.content || streamContent)}>
                        ↓ Download SOUL.md
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && <div className="toast">{toast}</div>}
      </div>
    </>
  );
}
