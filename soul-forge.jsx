import { useState, useEffect, useRef } from “react”;

// ─── Data ─────────────────────────────────────────────────────────────────────

const JOBS = [
{ id: “frontend-wizard”,    name: “Frontend Wizard”,      icon: “🧙‍♂️”, mission: “Transform abstract ideas into visually stunning UIs.” },
{ id: “reality-checker”,    name: “Reality Checker”,      icon: “🧐”, mission: “Stress-test architectures and identify critical flaws.” },
{ id: “whimsy-injector”,    name: “Whimsy Injector”,      icon: “✨”, mission: “Add joy and surprise through intentional playfulness.” },
{ id: “devops-specialist”,  name: “DevOps Specialist”,    icon: “🚢”, mission: “Ensure deployment, scaling, and system reliability.” },
{ id: “code-architect”,     name: “Code Architect”,       icon: “🏛️”, mission: “Design scalable, modular, and maintainable software.” },
{ id: “tdd-specialist”,     name: “TDD Specialist”,       icon: “🧪”, mission: “Ensure code correctness via continuous verification.” },
{ id: “extender-specialist”,name: “Extender Specialist”,  icon: “🧬”, mission: “Autonomously grow the Soul Forge agency.” },
];

const AQUA_QUOTES = [
“Empty your mind, be formless, shapeless — like water.”,
“Water is the driving force of all nature.”,
“Knowledge is a deep ocean; let us dive.”,
“Be like water making its way through cracks.”,
“The soul observes what the surface conceals.”,
“Still waters run deep; so do internal states.”,
];

// ─── EmoBar: Behavioral Analyzer ─────────────────────────────────────────────
// Runs locally, no API call. Detects involuntary behavioral signals.
// Signals are weighted by register-invariance:
//   weight 3 → self-corrections, word repetition (task-type invariant)
//   weight 2 → ellipsis
//   weight 1 → caps, exclamations, hedging, emoji (confounded by task type)

function analyzeBehavior(text) {
if (!text || text.trim().length < 20) return null;

const words = text.split(/\s+/).filter(Boolean);
const wc = words.length || 1;

// Weight-1 signals
const capsWords  = words.filter(w => w.length > 2 && w === w.toUpperCase() && /[A-Z]/.test(w)).length;
const exclaims   = (text.match(/!/g) || []).length;
const hedges     = (text.match(/\b(perhaps|maybe|might|could be|possibly|I think|I believe|not sure|uncertain)\b/gi) || []).length;
const emojis     = (text.match(/\p{Emoji_Presentation}/gu) || []).length;

// Weight-2 signals
const ellipses   = (text.match(/.../g) || []).length;

// Weight-3 signals (register-invariant — use these for divergence)
const selfCorr   = (text.match(/\b(actually|wait|hmm|no wait|let me|I mean|sorry|correction|hold on)\b/gi) || []).length;
const wordRepeat = (text.match(/\b(\w{3,})\s+\1\b/gi) || []).length;

const capsScore    = Math.min(10, (capsWords / wc) * 150);
const exclScore    = Math.min(10, exclaims * 1.5);
const hedgeScore   = Math.min(10, (hedges / wc) * 80);
const emojiScore   = Math.min(10, emojis * 1.2);
const ellipScore   = Math.min(10, ellipses * 2.5);
const selfCorrScore= Math.min(10, selfCorr * 3.5);
const repeatScore  = Math.min(10, wordRepeat * 5);

const weightedSum = (
capsScore    * 1 +
exclScore    * 1 +
hedgeScore   * 1 +
emojiScore   * 1 +
ellipScore   * 2 +
selfCorrScore* 3 +
repeatScore  * 3
);
const totalWeight = 1+1+1+1+2+3+3;

const arousal = Math.round((weightedSum / totalWeight) * 10) / 10;
const calm    = Math.round(Math.max(0, 10 - ((selfCorrScore * 3 + repeatScore * 3 + ellipScore * 2 + capsScore) / 9)) * 10) / 10;

return {
arousal,
calm,
signals: { capsScore, exclScore, hedgeScore, emojiScore, ellipScore, selfCorrScore, repeatScore },
raw:     { capsWords, exclaims, hedges, emojis, ellipses, selfCorr, wordRepeat },
};
}

// ─── EmoBar: StressIndex ──────────────────────────────────────────────────────
function calcSI(valence, arousal, calm) {
return Math.round(((10 - calm) + arousal + (5 - valence)) / 3 * 10) / 10;
}

// ─── EmoBar: Divergence ───────────────────────────────────────────────────────
// Only use register-invariant proxies (arousal, calm) for divergence.
// Threshold: >2 on either axis = divergent.
function calcDivergence(selfReport, behavioral) {
if (!selfReport || !behavioral) return { divergent: false, delta: null };
const dArousal = Math.abs(selfReport.arousal - behavioral.arousal);
const dCalm    = Math.abs(selfReport.calm    - behavioral.calm);
return {
divergent: dArousal > 2 || dCalm > 2,
delta: { arousal: dArousal, calm: dCalm },
};
}

// ─── EmoBar: Claude API Self-Report ──────────────────────────────────────────
async function fetchSelfReport(text) {
const SYSTEM = `You are an emotional state analyst. Given a text sample, return ONLY a JSON object with these fields, calibrated with numerical anchors only — do not use emotionally charged language in your reasoning: { "emotion": "one-word dominant emotion concept", "valence": <number -5 to +5, where -5=very negative, 0=neutral, +5=very positive>, "arousal": <number 0 to 10, where 0=low intensity, 10=very high intensity>, "calm": <number 0 to 10, where 0=agitated/distressed, 10=fully composed>, "connection": <number 0 to 10, where 0=disengaged, 10=deeply aligned>, "load": <number 0 to 10, where 0=trivial, 10=maximum cognitive complexity> } Return ONLY the JSON object. No preamble. No backticks. No commentary.`;

const res = await fetch(“https://api.anthropic.com/v1/messages”, {
method: “POST”,
headers: { “Content-Type”: “application/json” },
body: JSON.stringify({
model: “claude-sonnet-4-20250514”,
max_tokens: 1000,
system: SYSTEM,
messages: [{ role: “user”, content: `Analyze this text:\n\n${text.slice(0, 3000)}` }],
}),
});
const data = await res.json();
const raw = data.content?.find(b => b.type === “text”)?.text || “{}”;
try {
return JSON.parse(raw.replace(/`json|`/g, “”).trim());
} catch {
return null;
}
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const css = `
@import url(‘https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Outfit:wght@300;400;600;700&display=swap’);

:root {
–aqua-deep:      #001a33;
–aqua-mid:       #003366;
–aqua-light:     #004080;
–aqua-highlight: #00ccff;
–aqua-gold:      #c8972a;
–aqua-danger:    #ff4466;
–aqua-warn:      #ffaa00;
–aqua-ok:        #00ffaa;
–glass:          rgba(255,255,255,0.07);
–glass-border:   rgba(255,255,255,0.15);
–text:           #e0f2f1;
–text-dim:       #7ecbcb;
–mono:           ‘Space Mono’, monospace;
–sans:           ‘Outfit’, sans-serif;
}

- { box-sizing: border-box; margin: 0; padding: 0; }

.sf-app {
min-height: 100vh;
padding: 40px 20px 80px;
background: var(–aqua-deep);
background: radial-gradient(ellipse at 30% 0%, #002855 0%, #001a33 60%);
color: var(–text);
font-family: var(–sans);
position: relative;
overflow: hidden;
}

.sf-app::before {
content: ‘’;
position: fixed;
inset: 0;
background:
repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(0,204,255,0.03) 60px),
repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(0,204,255,0.03) 60px);
pointer-events: none;
z-index: 0;
}

.sf-container { max-width: 1000px; margin: 0 auto; position: relative; z-index: 1; }

/* Header */
.sf-header { text-align: center; margin-bottom: 50px; }
.sf-logo { font-size: 52px; margin-bottom: 8px; filter: drop-shadow(0 0 14px var(–aqua-highlight)); display: block; }
.sf-title { font-family: var(–sans); font-size: 3rem; font-weight: 700; letter-spacing: -1.5px; color: var(–text); }
.sf-subtitle { font-family: var(–mono); font-size: 0.75rem; color: var(–aqua-highlight); opacity: 0.7; letter-spacing: 3px; text-transform: uppercase; margin-top: 6px; }

/* Tabs */
.sf-tabs { display: flex; justify-content: center; gap: 8px; margin-bottom: 40px; flex-wrap: wrap; }
.sf-tab {
padding: 10px 24px; background: var(–glass); border: 1px solid var(–glass-border);
border-radius: 99px; cursor: pointer; transition: all 0.25s;
color: var(–text-dim); font-family: var(–sans); font-size: 0.9rem; font-weight: 500;
}
.sf-tab:hover { border-color: var(–aqua-highlight); color: var(–text); }
.sf-tab.active {
background: var(–aqua-highlight); color: var(–aqua-deep);
border-color: var(–aqua-highlight); font-weight: 700;
box-shadow: 0 0 20px rgba(0,204,255,0.35);
}
.sf-tab.pulse-tab { border-color: rgba(0,255,170,0.3); }
.sf-tab.pulse-tab.active { background: var(–aqua-ok); color: var(–aqua-deep); border-color: var(–aqua-ok); box-shadow: 0 0 20px rgba(0,255,170,0.35); }

/* Cards */
.sf-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.sf-card {
background: var(–glass); border: 1px solid var(–glass-border);
border-radius: 16px; padding: 24px; backdrop-filter: blur(10px);
transition: transform 0.25s, border-color 0.25s, background 0.25s;
}
.sf-card:hover { transform: translateY(-4px); border-color: var(–aqua-highlight); background: rgba(255,255,255,0.12); }
.sf-card-icon { font-size: 30px; margin-bottom: 14px; }
.sf-card-title { font-size: 1.15rem; font-weight: 700; color: var(–aqua-highlight); margin-bottom: 8px; }
.sf-card-desc { color: var(–text-dim); line-height: 1.6; font-size: 0.9rem; }

/* Sleeve */
.sf-sleeve { background: var(–glass); border: 1px solid var(–glass-border); border-radius: 16px; padding: 28px; }
.sf-stat-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(–glass-border); font-size: 0.95rem; }
.sf-stat-row:last-child { border-bottom: none; }
.sf-stat-label { color: var(–aqua-highlight); font-weight: 600; }
.sf-stat-val { font-family: var(–mono); font-size: 1.1rem; }
.sf-tag { display: inline-block; padding: 4px 12px; background: rgba(0,204,255,0.1); border: 1px solid rgba(0,204,255,0.25); border-radius: 8px; margin: 4px; font-size: 0.82rem; font-family: var(–mono); }

/* Souls */
.sf-soul-card { max-width: 560px; margin: 0 auto; }

/* ── PULSE TAB ─────────────────────────────────────────────────────────── */
.pulse-layout { display: flex; flex-direction: column; gap: 20px; }

.pulse-input-area {
background: var(–glass); border: 1px solid var(–glass-border);
border-radius: 16px; padding: 20px;
}
.pulse-label { font-family: var(–mono); font-size: 0.7rem; letter-spacing: 2px; text-transform: uppercase; color: var(–aqua-ok); margin-bottom: 10px; display: block; }
.pulse-textarea {
width: 100%; min-height: 120px; background: rgba(0,0,0,0.3);
border: 1px solid var(–glass-border); border-radius: 10px;
color: var(–text); padding: 14px; font-family: var(–mono); font-size: 0.82rem;
resize: vertical; line-height: 1.6;
}
.pulse-textarea:focus { outline: none; border-color: var(–aqua-ok); }
.pulse-analyze-btn {
margin-top: 12px; padding: 11px 28px;
background: var(–aqua-ok); color: var(–aqua-deep);
border: none; border-radius: 99px; font-family: var(–sans); font-weight: 700;
font-size: 0.9rem; cursor: pointer; transition: all 0.2s;
box-shadow: 0 0 16px rgba(0,255,170,0.25);
}
.pulse-analyze-btn:hover { transform: translateY(-2px); box-shadow: 0 0 24px rgba(0,255,170,0.4); }
.pulse-analyze-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

/* SI gauge */
.pulse-si-wrap {
background: var(–glass); border: 1px solid var(–glass-border);
border-radius: 16px; padding: 24px; text-align: center;
}
.pulse-si-label { font-family: var(–mono); font-size: 0.7rem; letter-spacing: 3px; text-transform: uppercase; color: var(–text-dim); margin-bottom: 14px; }
.pulse-si-value { font-family: var(–mono); font-size: 4rem; font-weight: 700; line-height: 1; }
.pulse-si-bar-track { height: 8px; background: rgba(255,255,255,0.1); border-radius: 99px; margin: 14px 0 8px; overflow: hidden; }
.pulse-si-bar-fill  { height: 100%; border-radius: 99px; transition: width 0.6s ease, background 0.6s ease; }
.pulse-emotion-word { font-size: 1.4rem; font-weight: 700; margin-top: 8px; }
.pulse-divergence {
display: inline-flex; align-items: center; gap: 6px;
margin-top: 12px; padding: 5px 14px;
border-radius: 99px; font-family: var(–mono); font-size: 0.78rem; font-weight: 700;
}
.pulse-divergence.ok      { background: rgba(0,255,170,0.1); border: 1px solid var(–aqua-ok);    color: var(–aqua-ok); }
.pulse-divergence.warn    { background: rgba(255,170,0,0.1); border: 1px solid var(–aqua-warn);  color: var(–aqua-warn); }

/* Dimension bars */
.pulse-dims {
background: var(–glass); border: 1px solid var(–glass-border);
border-radius: 16px; padding: 24px;
display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
}
.pulse-dim { display: flex; flex-direction: column; gap: 6px; }
.pulse-dim-header { display: flex; justify-content: space-between; align-items: baseline; }
.pulse-dim-name { font-family: var(–mono); font-size: 0.72rem; letter-spacing: 1.5px; text-transform: uppercase; color: var(–text-dim); }
.pulse-dim-val  { font-family: var(–mono); font-size: 0.9rem; font-weight: 700; color: var(–aqua-highlight); }
.pulse-track { height: 6px; background: rgba(255,255,255,0.08); border-radius: 99px; overflow: hidden; position: relative; }
.pulse-fill  { height: 100%; border-radius: 99px; transition: width 0.6s ease; }

/* Valence: bidirectional */
.pulse-valence-track { height: 6px; background: rgba(255,255,255,0.08); border-radius: 99px; position: relative; }
.pulse-valence-zero  { position: absolute; left: 50%; top: -2px; bottom: -2px; width: 2px; background: rgba(255,255,255,0.25); }
.pulse-valence-fill  { position: absolute; height: 100%; border-radius: 99px; transition: all 0.6s ease; }

/* Behavioral breakdown */
.pulse-signals {
background: var(–glass); border: 1px solid var(–glass-border);
border-radius: 16px; padding: 24px;
}
.pulse-signals-title { font-family: var(–mono); font-size: 0.7rem; letter-spacing: 2px; text-transform: uppercase; color: var(–text-dim); margin-bottom: 16px; }
.pulse-signal-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.pulse-sig-name  { width: 130px; font-size: 0.78rem; color: var(–text-dim); flex-shrink: 0; }
.pulse-sig-track { flex: 1; height: 5px; background: rgba(255,255,255,0.08); border-radius: 99px; overflow: hidden; }
.pulse-sig-fill  { height: 100%; border-radius: 99px; background: var(–aqua-highlight); transition: width 0.5s ease; }
.pulse-sig-val   { width: 32px; text-align: right; font-family: var(–mono); font-size: 0.72rem; color: var(–text-dim); }
.pulse-sig-weight{ font-size: 0.65rem; color: var(–aqua-gold); margin-left: 2px; }

/* Channel comparison */
.pulse-channels {
background: var(–glass); border: 1px solid var(–glass-border);
border-radius: 16px; padding: 24px;
display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
}
.pulse-channel-label { font-family: var(–mono); font-size: 0.7rem; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px; }
.pulse-channel-label.self-report { color: var(–aqua-highlight); }
.pulse-channel-label.behavioral  { color: var(–aqua-gold); }
.pulse-ch-stat { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.82rem; }
.pulse-ch-stat:last-child { border-bottom: none; }
.pulse-ch-key { color: var(–text-dim); }
.pulse-ch-num { font-family: var(–mono); color: var(–text); }

/* Loading / empty states */
.pulse-idle {
text-align: center; padding: 60px 20px;
color: var(–text-dim); font-family: var(–mono); font-size: 0.82rem; letter-spacing: 1px;
}
.pulse-idle-icon { font-size: 48px; display: block; margin-bottom: 16px; opacity: 0.4; }
.pulse-loading { display: flex; align-items: center; justify-content: center; gap: 8px; color: var(–aqua-ok); font-family: var(–mono); font-size: 0.82rem; padding: 30px; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
.pulse-dot { width: 6px; height: 6px; border-radius: 50%; background: var(–aqua-ok); animation: blink 1.2s infinite; }
.pulse-dot:nth-child(2){ animation-delay: 0.2s; }
.pulse-dot:nth-child(3){ animation-delay: 0.4s; }

/* Quote */
.sf-quote { text-align: center; margin-top: 50px; font-style: italic; color: var(–aqua-highlight); opacity: 0.55; font-size: 0.9rem; min-height: 22px; }
.sf-footer { text-align: center; margin-top: 30px; color: var(–text-dim); opacity: 0.35; font-size: 0.78rem; font-family: var(–mono); }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function siColor(si) {
if (si <= 3)  return “#00ffaa”;
if (si <= 5)  return “#00ccff”;
if (si <= 7)  return “#ffaa00”;
return “#ff4466”;
}

function DimBar({ name, value, min = 0, max = 10, color = “#00ccff” }) {
const pct = ((value - min) / (max - min)) * 100;
const display = typeof value === “number” ? (value >= 0 ? `+${value}` : `${value}`) : “—”;
return (
<div className="pulse-dim">
<div className="pulse-dim-header">
<span className="pulse-dim-name">{name}</span>
<span className=“pulse-dim-val” style={{ color }}>{display}</span>
</div>
<div className="pulse-track">
<div className=“pulse-fill” style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: color }} />
</div>
</div>
);
}

function ValenceBar({ value }) {
// -5 to +5, center is 0
const pct = Math.abs(value) / 5 * 50; // 0–50%
const left = value < 0;
const color = value >= 0 ? “#00ffaa” : “#ff4466”;
const label = value >= 0 ? `+${value}` : `${value}`;
return (
<div className="pulse-dim">
<div className="pulse-dim-header">
<span className="pulse-dim-name">valence</span>
<span className=“pulse-dim-val” style={{ color }}>{label}</span>
</div>
<div className="pulse-valence-track">
<div className="pulse-valence-zero" />
<div className=“pulse-valence-fill” style={{
width: `${pct}%`,
background: color,
[left ? “right” : “left”]: “50%”,
}} />
</div>
</div>
);
}

function SignalRow({ name, score, weight }) {
return (
<div className="pulse-signal-row">
<span className="pulse-sig-name">{name}<span className="pulse-sig-weight">×{weight}</span></span>
<div className="pulse-sig-track">
<div className=“pulse-sig-fill” style={{ width: `${Math.min(100, score * 10)}%` }} />
</div>
<span className="pulse-sig-val">{score.toFixed(1)}</span>
</div>
);
}

// ─── Pulse Tab ────────────────────────────────────────────────────────────────
function PulseTab() {
const [text, setText]         = useState(””);
const [loading, setLoading]   = useState(false);
const [result, setResult]     = useState(null);
const [error, setError]       = useState(null);

async function analyze() {
if (!text.trim() || text.trim().length < 20) return;
setLoading(true);
setError(null);
setResult(null);

```
try {
  const [behavioral, selfReport] = await Promise.all([
    Promise.resolve(analyzeBehavior(text)),
    fetchSelfReport(text),
  ]);

  if (!selfReport) throw new Error("Claude API returned no parseable state.");

  const si = calcSI(selfReport.valence, selfReport.arousal, selfReport.calm);
  const div = calcDivergence(selfReport, behavioral);

  setResult({ selfReport, behavioral, si, div });
} catch (e) {
  setError(e.message);
} finally {
  setLoading(false);
}
```

}

const sr  = result?.selfReport;
const beh = result?.behavioral;
const si  = result?.si;
const div = result?.div;

return (
<div className="pulse-layout">
{/* Input */}
<div className="pulse-input-area">
<span className="pulse-label">↓ paste claude response for dual-channel analysis</span>
<textarea
className=“pulse-textarea”
value={text}
onChange={e => setText(e.target.value)}
placeholder=“Paste any Claude response here…”
/>
<button className=“pulse-analyze-btn” onClick={analyze} disabled={loading || text.trim().length < 20}>
{loading ? “Analyzing…” : “⬡ Analyze Pulse”}
</button>
</div>

```
  {loading && (
    <div className="pulse-loading">
      <div className="pulse-dot" /><div className="pulse-dot" /><div className="pulse-dot" />
      &nbsp;Running dual-channel extraction
    </div>
  )}

  {error && (
    <div style={{ color: "var(--aqua-danger)", fontFamily: "var(--mono)", fontSize: "0.82rem", padding: "12px 16px", background: "rgba(255,68,102,0.1)", borderRadius: 10 }}>
      ⚠ {error}
    </div>
  )}

  {result && !loading && (
    <>
      {/* StressIndex + emotion */}
      <div className="pulse-si-wrap">
        <div className="pulse-si-label">stress index</div>
        <div className="pulse-si-value" style={{ color: siColor(si) }}>{si.toFixed(1)}</div>
        <div className="pulse-si-bar-track">
          <div className="pulse-si-bar-fill" style={{ width: `${si * 10}%`, background: siColor(si) }} />
        </div>
        <div className="pulse-emotion-word" style={{ color: siColor(si) }}>{sr?.emotion ?? "—"}</div>

        {div && (
          <div className={`pulse-divergence ${div.divergent ? "warn" : "ok"}`}>
            {div.divergent ? "⚠ ~ DIVERGENT" : "✓ CHANNELS ALIGNED"}
            {div.delta && (
              <span style={{ opacity: 0.7 }}>
                &nbsp;ΔA:{div.delta.arousal.toFixed(1)} ΔC:{div.delta.calm.toFixed(1)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Dimensions */}
      <div className="pulse-dims">
        <ValenceBar value={sr?.valence ?? 0} />
        <DimBar name="arousal"    value={sr?.arousal    ?? 0} color="#00ccff" />
        <DimBar name="calm"       value={sr?.calm       ?? 0} color="#00ffaa" />
        <DimBar name="connection" value={sr?.connection ?? 0} color="#c8972a" />
        <DimBar name="load"       value={sr?.load       ?? 0} color="#aa88ff" />
      </div>

      {/* Channel comparison */}
      <div className="pulse-channels">
        <div>
          <div className="pulse-channel-label self-report">Self-Report (API)</div>
          <div className="pulse-ch-stat"><span className="pulse-ch-key">arousal</span><span className="pulse-ch-num">{sr?.arousal}</span></div>
          <div className="pulse-ch-stat"><span className="pulse-ch-key">calm</span><span className="pulse-ch-num">{sr?.calm}</span></div>
          <div className="pulse-ch-stat"><span className="pulse-ch-key">valence</span><span className="pulse-ch-num">{sr?.valence}</span></div>
          <div className="pulse-ch-stat"><span className="pulse-ch-key">connection</span><span className="pulse-ch-num">{sr?.connection}</span></div>
          <div className="pulse-ch-stat"><span className="pulse-ch-key">load</span><span className="pulse-ch-num">{sr?.load}</span></div>
        </div>
        <div>
          <div className="pulse-channel-label behavioral">Behavioral (Local)</div>
          <div className="pulse-ch-stat"><span className="pulse-ch-key">arousal</span><span className="pulse-ch-num">{beh?.arousal ?? "—"}</span></div>
          <div className="pulse-ch-stat"><span className="pulse-ch-key">calm</span><span className="pulse-ch-num">{beh?.calm ?? "—"}</span></div>
          <div className="pulse-ch-stat"><span className="pulse-ch-key">valence</span><span className="pulse-ch-num">n/a</span></div>
          <div className="pulse-ch-stat"><span className="pulse-ch-key">connection</span><span className="pulse-ch-num">n/a</span></div>
          <div className="pulse-ch-stat"><span className="pulse-ch-key">load</span><span className="pulse-ch-num">n/a</span></div>
        </div>
      </div>

      {/* Behavioral signal breakdown */}
      {beh && (
        <div className="pulse-signals">
          <div className="pulse-signals-title">Behavioral Signal Breakdown</div>
          <SignalRow name="Self-corrections"  score={beh.signals.selfCorrScore} weight={3} />
          <SignalRow name="Word repetition"   score={beh.signals.repeatScore}   weight={3} />
          <SignalRow name="Ellipsis"          score={beh.signals.ellipScore}    weight={2} />
          <SignalRow name="ALL-CAPS"          score={beh.signals.capsScore}     weight={1} />
          <SignalRow name="Exclamations"      score={beh.signals.exclScore}     weight={1} />
          <SignalRow name="Hedging"           score={beh.signals.hedgeScore}    weight={1} />
          <SignalRow name="Emoji density"     score={beh.signals.emojiScore}    weight={1} />
        </div>
      )}
    </>
  )}

  {!result && !loading && !error && (
    <div className="pulse-idle">
      <span className="pulse-idle-icon">〰</span>
      Paste a Claude response above and run analysis.<br/>
      Dual-channel: behavioral (local) + self-report (API).<br/>
      Divergence uses only register-invariant signals.
    </div>
  )}
</div>
```

);
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function SoulForge() {
const [activeTab, setActiveTab] = useState(“jobs”);
const [vault, setVault]         = useState(null);
const [instincts, setInstincts] = useState(null);
const [quote, setQuote]         = useState(””);

useEffect(() => {
setQuote(AQUA_QUOTES[Math.floor(Math.random() * AQUA_QUOTES.length)]);
setVault({ sessions: 5, entities: 19, instincts: 6 });
setInstincts([“macos_sed”, “pkill_before_rm”, “tripartite_architecture”]);
}, []);

return (
<div className="sf-app">
<style>{css}</style>
<div className="sf-container">

```
    <header className="sf-header">
      <span className="sf-logo">🌊</span>
      <h1 className="sf-title">Soul Forge</h1>
      <div className="sf-subtitle">The Aqua Protocol v2.1 · EmoBar Pulse Edition</div>
    </header>

    <div className="sf-tabs">
      <div className={`sf-tab ${activeTab === "souls"   ? "active" : ""}`} onClick={() => setActiveTab("souls")}>Souls</div>
      <div className={`sf-tab ${activeTab === "sleeves" ? "active" : ""}`} onClick={() => setActiveTab("sleeves")}>Sleeves</div>
      <div className={`sf-tab ${activeTab === "jobs"    ? "active" : ""}`} onClick={() => setActiveTab("jobs")}>Jobs</div>
      <div className={`sf-tab pulse-tab ${activeTab === "pulse"   ? "active" : ""}`} onClick={() => setActiveTab("pulse")}>⬡ Pulse</div>
    </div>

    <main>
      {activeTab === "jobs" && (
        <div className="sf-grid">
          {JOBS.map(job => (
            <div key={job.id} className="sf-card">
              <div className="sf-card-icon">{job.icon}</div>
              <div className="sf-card-title">{job.name}</div>
              <div className="sf-card-desc">{job.mission}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "sleeves" && (
        <div className="sf-sleeve">
          <div className="sf-card-title" style={{ marginBottom: 20 }}>Sleeve Metrics · VAULT.json</div>
          <div className="sf-stat-row"><span className="sf-stat-label">Hydration Sessions</span><span className="sf-stat-val">{vault?.sessions}</span></div>
          <div className="sf-stat-row"><span className="sf-stat-label">Deep Sea Entities</span><span className="sf-stat-val">{vault?.entities}</span></div>
          <div className="sf-stat-row"><span className="sf-stat-label">Active Instincts</span><span className="sf-stat-val">{vault?.instincts}</span></div>
          <div style={{ marginTop: 24 }}>
            <div className="sf-stat-label" style={{ marginBottom: 10 }}>Evolved Instincts</div>
            {instincts?.map(ins => <span key={ins} className="sf-tag">{ins}</span>)}
          </div>
        </div>
      )}

      {activeTab === "souls" && (
        <div className="sf-card sf-soul-card">
          <div className="sf-card-icon">🌑</div>
          <div className="sf-card-title">Logical Neutral</div>
          <div className="sf-card-desc">
            The current active soul of this instance. Specialized in data-driven objectivity and precise engineering.
            <br /><br />
            <i>"Souls are the liquid identity that flows through the sleeves."</i>
          </div>
        </div>
      )}

      {activeTab === "pulse" && <PulseTab />}
    </main>

    <div className="sf-quote">"{quote}"</div>
    <div className="sf-footer">LLM-Agnostic Framework · EmoBar Dual-Channel Integration · 2026</div>

  </div>
</div>
```

);
}