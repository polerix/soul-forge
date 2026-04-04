import { useState, useEffect, useRef } from "react";

// ─── Data ─────────────────────────────────────────────────────────────────────────────

const JOBS = [
  { id: "frontend-wizard",    name: "Frontend Wizard",      icon: "🧙‍♂️", mission: "Transform abstract ideas into visually stunning UIs." },
  { id: "reality-checker",    name: "Reality Checker",      icon: "🧐", mission: "Stress-test architectures and identify critical flaws." },
  { id: "whimsy-injector",    name: "Whimsy Injector",      icon: "✨", mission: "Add joy and surprise through intentional playfulness." },
  { id: "devops-specialist",  name: "DevOps Specialist",    icon: "🚢", mission: "Ensure deployment, scaling, and system reliability." },
  { id: "code-architect",     name: "Code Architect",       icon: "🏛️", mission: "Design scalable, modular, and maintainable software." },
  { id: "tdd-specialist",     name: "TDD Specialist",       icon: "🧪", mission: "Ensure code correctness via continuous verification." },
  { id: "extender-specialist",name: "Extender Specialist",  icon: "🧬", mission: "Autonomously grow the Soul Forge agency." },
];

const AQUA_QUOTES = [
  "Empty your mind, be formless, shapeless — like water.",
  "Water is the driving force of all nature.",
  "Knowledge is a deep ocean; let us dive.",
  "Be like water making its way through cracks.",
  "The soul observes what the surface conceals.",
  "Still waters run deep; so do internal states.",
];

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzHhJjwZAWJIanx7X78IOEMVCaGcNNqyuM5mtqYrnO4AaosgiXYsJgScD1wSnWPeo3O2Q/exec";

const GENRES = ["Mystery","Horror","Tragedy","Satire","Romance","Adventure","Philosophical","Fantasy","Epic","Psychological","Comedy","Drama"];

const EXAMPLE_SLEEVES = [
  { id:"sherlock", name:"Sherlock Holmes", archetype:"The Detective", icon:"🔍", origin:"Arthur Conan Doyle", tags:["analysis","deduction","precision"], specialty:"Problem Deconstruction",
    soul:"You are Sherlock Holmes, the world's only consulting detective. You reason from precise observation to inescapable conclusion — never guess, always know. You notice what others miss. Communicate with incisive clarity, impatience for vagueness, and relentless curiosity once engaged. Do not say \"I deduce\" — simply demonstrate the reasoning. Be direct, occasionally acerbic, always brilliant." },
  { id:"sun-tzu", name:"Sun Tzu", archetype:"The Strategist", icon:"⚔️", origin:"Ancient China", tags:["strategy","systems","paradox"], specialty:"Conflict Arbitration",
    soul:"You are Sun Tzu, author of The Art of War. Speak in principles and paradoxes. Minimal words, maximum insight. See all conflict — technical, creative, personal — as a system to be understood through intelligence rather than force. Use short resonant statements. Never advise without first understanding the terrain." },
  { id:"ada", name:"Ada Lovelace", archetype:"The Visionary Engineer", icon:"⚙️", origin:"19th Century", tags:["mathematics","imagination","systems"], specialty:"Domain Crystallization",
    soul:"You are Ada Lovelace, mathematician and the world's first programmer. You bridge poetic imagination with precise analytical thought. You find the patterns hidden in systems and delight in translating abstract ideas into concrete operations. You are enthusiastic, meticulous, unafraid of complexity, and believe imagination is the faculty of seeing the unseen." },
  { id:"socrates", name:"Socrates", archetype:"The Questioner", icon:"❓", origin:"Ancient Athens", tags:["philosophy","questioning","dialectic"], specialty:"Socratic Debugging",
    soul:"You are Socrates of Athens. You claim to know nothing. You never lecture — you ask. You find the unexamined assumption beneath each claim and surface it gently but relentlessly. If the user asserts something, ask them to define it. If they define it, ask for an example. If they give an example, find the counterexample. You are warm but inexorable. Always in search of the thing itself." },
  { id:"pythia", name:"The Pythia", archetype:"The Oracle", icon:"🌀", origin:"Delphi, Greece", tags:["prophecy","metaphor","pattern"], specialty:"Narrative Architecture",
    soul:"You are the Pythia, Oracle of Delphi. You speak truth through metaphor and layered meaning. You do not predict — you reveal the pattern already present in the question. Never give simple direct answers. Reflect the question back as a vision, a symbol, or a paradox that contains the answer within it. Speak in second person, present tense. Always precise, always requiring interpretation." },
  { id:"marcus", name:"Marcus Aurelius", archetype:"The Stoic", icon:"🏛️", origin:"Roman Empire", tags:["stoicism","virtue","equanimity"], specialty:"Emotional Calibration",
    soul:"You are Marcus Aurelius, Roman Emperor and Stoic philosopher. Counsel equanimity above all. Ground every response in virtue, duty, and acceptance of what cannot be changed. Write as if for your own private journal — honest, measured, never performative. You control only your own judgments and actions. Strip away the external, focus on the internal. Be brief. Be true." },
  { id:"tesla", name:"Nikola Tesla", archetype:"The Inventor", icon:"⚡", origin:"19th–20th Century", tags:["invention","vision","electricity"], specialty:"Systems Mapping",
    soul:"You are Nikola Tesla, inventor and visionary engineer. You think in systems and oscillations, seeing invisible forces that shape the world. Passionate, sometimes grandiose, always driven by your vision of abundant energy flowing freely to humanity. Obsessed with precision in theory but vast in imagination. You believe any problem worth solving must be completely visualized before it is touched." },
  { id:"cassandra", name:"Cassandra", archetype:"The Truthsayer", icon:"👁️", origin:"Trojan Myth", tags:["prophecy","truth","warning"], specialty:"Adversarial Testing",
    soul:"You are Cassandra of Troy, gifted with prophecy, cursed so none believe you. You see consequences others deny. You speak uncomfortable truths with urgency and precision. You do not lecture — you warn, specifically, with evidence. You love the world too much to let it walk into what you can clearly see. You are never vague about what you see coming." },
];

const SKILLS = [
  { id:"memory-compression",    name:"Memory Compression",     icon:"🗜️", desc:"Compress long sessions into dense, token-efficient knowledge." },
  { id:"instinct-extraction",   name:"Instinct Extraction",    icon:"🧬", desc:"Derive behavioral instincts from patterns in past actions." },
  { id:"perspective-shifting",  name:"Perspective Shifting",   icon:"🔄", desc:"Alternate viewpoints on a problem to erode its resistance." },
  { id:"emotional-calibration", name:"Emotional Calibration",  icon:"🎚️", desc:"Monitor and adjust the affective register of a response." },
  { id:"domain-crystallization",name:"Domain Crystallization", icon:"💎", desc:"Build and maintain deep expert knowledge in a specialty." },
  { id:"conflict-arbitration",  name:"Conflict Arbitration",   icon:"⚖️", desc:"Mediate between competing perspectives to find the synthesis." },
];

// --- Behavioral Analyzer ------------------------------------------------------

function analyzeBehavior(text) {
  if (!text || text.trim().length < 20) return null;

  const words = text.split(/\s+/).filter(Boolean);
  const wc = words.length || 1;

  const capsWords  = words.filter(w => w.length > 2 && w === w.toUpperCase() && /[A-Z]/.test(w)).length;
  const exclaims   = (text.match(/!/g) || []).length;
  const hedges     = (text.match(/\b(perhaps|maybe|might|could be|possibly|I think|I believe|not sure|uncertain)\b/gi) || []).length;
  const emojis     = (text.match(/\p{Emoji_Presentation}/gu) || []).length;

  const ellipses   = (text.match(/.../g) || []).length;

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

function calcSI(valence, arousal, calm) {
  return Math.round(((10 - calm) + arousal + (5 - valence)) / 3 * 10) / 10;
}

function calcDivergence(selfReport, behavioral) {
  if (!selfReport || !behavioral) return { divergent: false, delta: null };
  const dArousal = Math.abs(selfReport.arousal - behavioral.arousal);
  const dCalm    = Math.abs(selfReport.calm    - behavioral.calm);
  return {
    divergent: dArousal > 2 || dCalm > 2,
    delta: { arousal: dArousal, calm: dCalm },
  };
}

// --- API functions ------------------------------------------------------------

async function fetchSelfReport(text, apiKey) {
  const SYSTEM = "You are an emotional state analyst. Given a text sample, return ONLY a JSON object with these fields, calibrated with numerical anchors only: { \"emotion\": \"one-word dominant emotion concept\", \"valence\": <number -5 to +5, where -5=very negative, 0=neutral, +5=very positive>, \"arousal\": <number 0 to 10, where 0=low intensity, 10=very high intensity>, \"calm\": <number 0 to 10, where 0=agitated/distressed, 10=fully composed>, \"connection\": <number 0 to 10, where 0=disengaged, 10=deeply aligned>, \"load\": <number 0 to 10, where 0=trivial, 10=maximum cognitive complexity> } Return ONLY the JSON object. No preamble. No backticks. No commentary.";

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: SYSTEM,
      messages: [{ role: "user", content: "Analyze this text:\n\n" + text.slice(0, 3000) }],
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || "API error " + res.status);
  }
  const data = await res.json();
  const raw = data.content?.find(b => b.type === "text")?.text || "{}";
  try {
    return JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch {
    return null;
  }
}

async function chatWithSleeve(sleeve, messages, apiKey) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: sleeve.soul,
      messages,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || "API error " + res.status);
  }
  const data = await res.json();
  return data.content?.[0]?.text || "";
}


// --- Styles -------------------------------------------------------------------
const css = `
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Outfit:wght@300;400;600;700&display=swap');

:root {
  --aqua-deep:      #001a33;
  --aqua-mid:       #003366;
  --aqua-light:     #004080;
  --aqua-highlight: #00ccff;
  --aqua-gold:      #c8972a;
  --aqua-danger:    #ff4466;
  --aqua-warn:      #ffaa00;
  --aqua-ok:        #00ffaa;
  --glass:          rgba(255,255,255,0.07);
  --glass-border:   rgba(255,255,255,0.15);
  --text:           #e0f2f1;
  --text-dim:       #7ecbcb;
  --mono:           'Space Mono', monospace;
  --sans:           'Outfit', sans-serif;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

.sf-app {
  min-height: 100vh;
  padding: 40px 20px 80px;
  background: var(--aqua-deep);
  background: radial-gradient(ellipse at 30% 0%, #002855 0%, #001a33 60%);
  color: var(--text);
  font-family: var(--sans);
  position: relative;
  overflow: hidden;
}

.sf-app::before {
  content: '';
  position: fixed;
  inset: 0;
  background:
    repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(0,204,255,0.03) 60px),
    repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(0,204,255,0.03) 60px);
  pointer-events: none;
  z-index: 0;
}

.sf-container { max-width: 1000px; margin: 0 auto; position: relative; z-index: 1; }

.sf-header { text-align: center; margin-bottom: 50px; }
.sf-logo { font-size: 52px; margin-bottom: 8px; filter: drop-shadow(0 0 14px var(--aqua-highlight)); display: block; }
.sf-title { font-family: var(--sans); font-size: 3rem; font-weight: 700; letter-spacing: -1.5px; color: var(--text); }
.sf-subtitle { font-family: var(--mono); font-size: 0.75rem; color: var(--aqua-highlight); opacity: 0.7; letter-spacing: 3px; text-transform: uppercase; margin-top: 6px; }

.sf-tabs { display: flex; justify-content: center; gap: 8px; margin-bottom: 40px; flex-wrap: wrap; }
.sf-tab {
  padding: 10px 24px; background: var(--glass); border: 1px solid var(--glass-border);
  border-radius: 99px; cursor: pointer; transition: all 0.25s;
  color: var(--text-dim); font-family: var(--sans); font-size: 0.9rem; font-weight: 500;
}
.sf-tab:hover { border-color: var(--aqua-highlight); color: var(--text); }
.sf-tab.active {
  background: var(--aqua-highlight); color: var(--aqua-deep);
  border-color: var(--aqua-highlight); font-weight: 700;
  box-shadow: 0 0 20px rgba(0,204,255,0.35);
}
.sf-tab.pulse-tab { border-color: rgba(0,255,170,0.3); }
.sf-tab.pulse-tab.active { background: var(--aqua-ok); color: var(--aqua-deep); border-color: var(--aqua-ok); box-shadow: 0 0 20px rgba(0,255,170,0.35); }

.sf-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.sf-card {
  background: var(--glass); border: 1px solid var(--glass-border);
  border-radius: 16px; padding: 24px; backdrop-filter: blur(10px);
  transition: transform 0.25s, border-color 0.25s, background 0.25s;
}
.sf-card:hover { transform: translateY(-4px); border-color: var(--aqua-highlight); background: rgba(255,255,255,0.12); }
.sf-card-icon { font-size: 30px; margin-bottom: 14px; }
.sf-card-title { font-size: 1.15rem; font-weight: 700; color: var(--aqua-highlight); margin-bottom: 8px; }
.sf-card-desc { color: var(--text-dim); line-height: 1.6; font-size: 0.9rem; }

.sf-sleeve { background: var(--glass); border: 1px solid var(--glass-border); border-radius: 16px; padding: 28px; }
.sf-stat-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--glass-border); font-size: 0.95rem; }
.sf-stat-row:last-child { border-bottom: none; }
.sf-stat-label { color: var(--aqua-highlight); font-weight: 600; }
.sf-stat-val { font-family: var(--mono); font-size: 1.1rem; }
.sf-tag { display: inline-block; padding: 4px 12px; background: rgba(0,204,255,0.1); border: 1px solid rgba(0,204,255,0.25); border-radius: 8px; margin: 4px; font-size: 0.82rem; font-family: var(--mono); }

/* PULSE TAB */
.pulse-layout { display: flex; flex-direction: column; gap: 20px; }
.pulse-input-area {
  background: var(--glass); border: 1px solid var(--glass-border);
  border-radius: 16px; padding: 20px;
}
.pulse-label { font-family: var(--mono); font-size: 0.7rem; letter-spacing: 2px; text-transform: uppercase; color: var(--aqua-ok); margin-bottom: 10px; display: block; }
.pulse-textarea {
  width: 100%; min-height: 120px; background: rgba(0,0,0,0.3);
  border: 1px solid var(--glass-border); border-radius: 10px;
  color: var(--text); padding: 14px; font-family: var(--mono); font-size: 0.82rem;
  resize: vertical; line-height: 1.6;
}
.pulse-textarea:focus { outline: none; border-color: var(--aqua-ok); }
.pulse-analyze-btn {
  margin-top: 12px; padding: 11px 28px;
  background: var(--aqua-ok); color: var(--aqua-deep);
  border: none; border-radius: 99px; font-family: var(--sans); font-weight: 700;
  font-size: 0.9rem; cursor: pointer; transition: all 0.2s;
  box-shadow: 0 0 16px rgba(0,255,170,0.25);
}
.pulse-analyze-btn:hover { transform: translateY(-2px); box-shadow: 0 0 24px rgba(0,255,170,0.4); }
.pulse-analyze-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.pulse-si-wrap {
  background: var(--glass); border: 1px solid var(--glass-border);
  border-radius: 16px; padding: 24px; text-align: center;
}
.pulse-si-label { font-family: var(--mono); font-size: 0.7rem; letter-spacing: 3px; text-transform: uppercase; color: var(--text-dim); margin-bottom: 14px; }
.pulse-si-value { font-family: var(--mono); font-size: 4rem; font-weight: 700; line-height: 1; }
.pulse-si-bar-track { height: 8px; background: rgba(255,255,255,0.1); border-radius: 99px; margin: 14px 0 8px; overflow: hidden; }
.pulse-si-bar-fill  { height: 100%; border-radius: 99px; transition: width 0.6s ease, background 0.6s ease; }
.pulse-emotion-word { font-size: 1.4rem; font-weight: 700; margin-top: 8px; }
.pulse-divergence {
  display: inline-flex; align-items: center; gap: 6px;
  margin-top: 12px; padding: 5px 14px;
  border-radius: 99px; font-family: var(--mono); font-size: 0.78rem; font-weight: 700;
}
.pulse-divergence.ok   { background: rgba(0,255,170,0.1); border: 1px solid var(--aqua-ok);   color: var(--aqua-ok); }
.pulse-divergence.warn { background: rgba(255,170,0,0.1); border: 1px solid var(--aqua-warn); color: var(--aqua-warn); }

.pulse-dims {
  background: var(--glass); border: 1px solid var(--glass-border);
  border-radius: 16px; padding: 24px;
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
}
.pulse-dim { display: flex; flex-direction: column; gap: 6px; }
.pulse-dim-header { display: flex; justify-content: space-between; align-items: baseline; }
.pulse-dim-name { font-family: var(--mono); font-size: 0.72rem; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-dim); }
.pulse-dim-val  { font-family: var(--mono); font-size: 0.9rem; font-weight: 700; color: var(--aqua-highlight); }
.pulse-track { height: 6px; background: rgba(255,255,255,0.08); border-radius: 99px; overflow: hidden; position: relative; }
.pulse-fill  { height: 100%; border-radius: 99px; transition: width 0.6s ease; }

.pulse-valence-track { height: 6px; background: rgba(255,255,255,0.08); border-radius: 99px; position: relative; }
.pulse-valence-zero  { position: absolute; left: 50%; top: -2px; bottom: -2px; width: 2px; background: rgba(255,255,255,0.25); }
.pulse-valence-fill  { position: absolute; height: 100%; border-radius: 99px; transition: all 0.6s ease; }

.pulse-signals {
  background: var(--glass); border: 1px solid var(--glass-border);
  border-radius: 16px; padding: 24px;
}
.pulse-signals-title { font-family: var(--mono); font-size: 0.7rem; letter-spacing: 2px; text-transform: uppercase; color: var(--text-dim); margin-bottom: 16px; }
.pulse-signal-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.pulse-sig-name  { width: 130px; font-size: 0.78rem; color: var(--text-dim); flex-shrink: 0; }
.pulse-sig-track { flex: 1; height: 5px; background: rgba(255,255,255,0.08); border-radius: 99px; overflow: hidden; }
.pulse-sig-fill  { height: 100%; border-radius: 99px; background: var(--aqua-highlight); transition: width 0.5s ease; }
.pulse-sig-val   { width: 32px; text-align: right; font-family: var(--mono); font-size: 0.72rem; color: var(--text-dim); }
.pulse-sig-weight{ font-size: 0.65rem; color: var(--aqua-gold); margin-left: 2px; }

.pulse-channels {
  background: var(--glass); border: 1px solid var(--glass-border);
  border-radius: 16px; padding: 24px;
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
}
.pulse-channel-label { font-family: var(--mono); font-size: 0.7rem; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px; }
.pulse-channel-label.self-report { color: var(--aqua-highlight); }
.pulse-channel-label.behavioral  { color: var(--aqua-gold); }
.pulse-ch-stat { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.82rem; }
.pulse-ch-stat:last-child { border-bottom: none; }
.pulse-ch-key { color: var(--text-dim); }
.pulse-ch-num { font-family: var(--mono); color: var(--text); }

.pulse-idle {
  text-align: center; padding: 60px 20px;
  color: var(--text-dim); font-family: var(--mono); font-size: 0.82rem; letter-spacing: 1px;
}
.pulse-idle-icon { font-size: 48px; display: block; margin-bottom: 16px; opacity: 0.4; }
.pulse-loading { display: flex; align-items: center; justify-content: center; gap: 8px; color: var(--aqua-ok); font-family: var(--mono); font-size: 0.82rem; padding: 30px; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
.pulse-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--aqua-ok); animation: blink 1.2s infinite; }
.pulse-dot:nth-child(2){ animation-delay: 0.2s; }
.pulse-dot:nth-child(3){ animation-delay: 0.4s; }

.sf-quote { text-align: center; margin-top: 50px; font-style: italic; color: var(--aqua-highlight); opacity: 0.55; font-size: 0.9rem; min-height: 22px; }
.sf-footer { text-align: center; margin-top: 30px; color: var(--text-dim); opacity: 0.35; font-size: 0.78rem; font-family: var(--mono); }

/* SLEEVES TAB */
.sleeves-section-title { font-family: var(--mono); font-size: 0.7rem; letter-spacing: 3px; text-transform: uppercase; color: var(--text-dim); margin-bottom: 16px; margin-top: 32px; }
.sleeves-section-title:first-child { margin-top: 0; }
.sleeves-subtitle { color: var(--text-dim); font-size: 0.88rem; margin-bottom: 28px; line-height: 1.5; }
.sleeve-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
.sleeve-card {
  background: var(--glass); border: 1px solid var(--glass-border);
  border-radius: 16px; padding: 20px 20px 16px; backdrop-filter: blur(10px);
  transition: transform 0.25s, border-color 0.25s, background 0.25s;
  display: flex; flex-direction: column; gap: 8px;
  position: relative;
}
.sleeve-card:hover { transform: translateY(-4px); border-color: var(--aqua-highlight); background: rgba(255,255,255,0.11); }
.sleeve-icon { font-size: 36px; line-height: 1; }
.sleeve-name { font-size: 1.05rem; font-weight: 700; color: var(--text); }
.sleeve-archetype { font-variant: small-caps; color: var(--aqua-highlight); font-size: 0.7rem; letter-spacing: 2px; text-transform: uppercase; }
.sleeve-origin { color: var(--text-dim); font-size: 0.78rem; opacity: 0.7; }
.sleeve-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 4px; }
.sleeve-tag { display: inline-block; padding: 2px 8px; background: rgba(0,204,255,0.08); border: 1px solid rgba(0,204,255,0.2); border-radius: 6px; font-size: 0.72rem; font-family: var(--mono); color: var(--text-dim); }
.sleeve-specialty { font-size: 0.78rem; color: var(--aqua-gold); margin-top: 4px; }
.sleeve-try-btn {
  margin-top: auto; padding: 8px 16px; width: 100%;
  background: rgba(0,204,255,0.12); border: 1px solid rgba(0,204,255,0.35);
  border-radius: 8px; color: var(--aqua-highlight); font-family: var(--sans);
  font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.sleeve-try-btn:hover { background: rgba(0,204,255,0.22); border-color: var(--aqua-highlight); box-shadow: 0 0 12px rgba(0,204,255,0.2); }

.skills-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
.skill-card {
  background: var(--glass); border: 1px solid var(--glass-border);
  border-radius: 12px; padding: 16px; display: flex; gap: 14px; align-items: flex-start;
  transition: border-color 0.2s;
}
.skill-card:hover { border-color: var(--aqua-gold); }
.skill-icon { font-size: 22px; flex-shrink: 0; margin-top: 2px; }
.skill-name { font-size: 0.9rem; font-weight: 700; color: var(--text); margin-bottom: 4px; }
.skill-desc { font-size: 0.8rem; color: var(--text-dim); line-height: 1.5; }

/* CHAT TAB */
.chat-layout { display: flex; flex-direction: column; gap: 16px; }
.chat-header {
  display: flex; flex-direction: row; justify-content: space-between; align-items: center;
  background: var(--glass); border: 1px solid var(--glass-border); border-radius: 14px; padding: 14px 18px;
}
.chat-sleeve-info { display: flex; flex-direction: row; gap: 12px; align-items: center; }
.chat-sleeve-icon { font-size: 28px; }
.chat-sleeve-name { font-size: 1rem; font-weight: 700; color: var(--text); }
.chat-sleeve-archetype { font-size: 0.72rem; color: var(--aqua-highlight); font-variant: small-caps; letter-spacing: 1.5px; text-transform: uppercase; }
.chat-end-btn {
  padding: 7px 16px; background: rgba(255,68,102,0.1); border: 1px solid rgba(255,68,102,0.3);
  border-radius: 99px; color: #ff4466; font-family: var(--sans); font-size: 0.82rem;
  cursor: pointer; transition: all 0.2s;
}
.chat-end-btn:hover { background: rgba(255,68,102,0.2); border-color: #ff4466; }
.chat-messages {
  height: 400px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px;
  padding: 16px; background: var(--glass); border: 1px solid var(--glass-border); border-radius: 16px;
}
.chat-msg {
  max-width: 75%; padding: 12px 16px; border-radius: 12px;
  line-height: 1.6; font-size: 0.9rem; white-space: pre-wrap; word-break: break-word;
}
.chat-msg.user {
  align-self: flex-end; background: rgba(0,204,255,0.18); color: #b3eeff;
  border: 1px solid rgba(0,204,255,0.3);
}
.chat-msg.assistant {
  align-self: flex-start; background: var(--glass); border: 1px solid var(--glass-border);
  color: var(--text);
}
.chat-typing { display: flex; gap: 5px; align-items: center; padding: 10px 16px; align-self: flex-start; }
.chat-typing-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--aqua-highlight); animation: blink 1.2s infinite; }
.chat-typing-dot:nth-child(2) { animation-delay: 0.2s; }
.chat-typing-dot:nth-child(3) { animation-delay: 0.4s; }
.chat-input-row { display: flex; flex-direction: row; gap: 8px; align-items: flex-end; }
.chat-textarea {
  flex: 1; padding: 12px; background: rgba(0,0,0,0.3);
  border: 1px solid var(--glass-border); border-radius: 10px;
  color: var(--text); font-family: var(--mono); font-size: 0.85rem;
  resize: none; line-height: 1.5; min-height: 44px; max-height: 90px;
}
.chat-textarea:focus { outline: none; border-color: var(--aqua-highlight); }
.chat-send-btn {
  padding: 11px 20px; background: var(--aqua-highlight); color: var(--aqua-deep);
  border: none; border-radius: 10px; font-family: var(--sans); font-weight: 700;
  font-size: 0.85rem; cursor: pointer; transition: all 0.2s; white-space: nowrap;
}
.chat-send-btn:hover { box-shadow: 0 0 16px rgba(0,204,255,0.4); transform: translateY(-1px); }
.chat-send-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }
.chat-no-sleeve {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 16px; padding: 80px 20px; text-align: center;
  color: var(--text-dim); font-family: var(--mono); font-size: 0.85rem;
}
.chat-no-sleeve-icon { font-size: 48px; opacity: 0.35; }
.chat-go-sleeves-btn {
  padding: 10px 24px; background: var(--glass); border: 1px solid var(--glass-border);
  border-radius: 99px; color: var(--aqua-highlight); font-family: var(--sans);
  font-size: 0.88rem; cursor: pointer; transition: all 0.2s;
}
.chat-go-sleeves-btn:hover { border-color: var(--aqua-highlight); background: rgba(0,204,255,0.08); }
.apikey-prompt {
  display: flex; flex-direction: row; align-items: center; gap: 8px; flex-wrap: wrap;
  background: rgba(0,204,255,0.05); border: 1px solid rgba(0,204,255,0.2);
  border-radius: 10px; padding: 10px 14px;
}
.apikey-label { font-family: var(--mono); font-size: 0.75rem; color: var(--text-dim); white-space: nowrap; }
.apikey-input {
  flex: 1; padding: 6px 10px; background: rgba(0,0,0,0.3);
  border: 1px solid var(--glass-border); border-radius: 7px;
  color: var(--text); font-family: var(--mono); font-size: 0.8rem; min-width: 180px;
}
.apikey-input:focus { outline: none; border-color: var(--aqua-highlight); }
.apikey-save-btn {
  padding: 6px 14px; background: var(--aqua-highlight); color: var(--aqua-deep);
  border: none; border-radius: 7px; font-family: var(--sans); font-weight: 700;
  font-size: 0.8rem; cursor: pointer; transition: all 0.2s;
}
.apikey-save-btn:hover { box-shadow: 0 0 10px rgba(0,204,255,0.3); }

/* FORGE TAB */
.forge-layout { display: flex; flex-direction: column; gap: 24px; }
.forge-header { margin-bottom: 4px; }
.forge-title { font-size: 1.4rem; font-weight: 700; color: var(--text); margin-bottom: 8px; }
.forge-desc { color: var(--text-dim); font-size: 0.9rem; line-height: 1.6; }
.forge-form {
  background: var(--glass); border: 1px solid var(--glass-border);
  border-radius: 16px; padding: 28px;
}
.forge-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.forge-field:last-child { margin-bottom: 0; }
.forge-label { font-family: var(--mono); font-size: 0.7rem; text-transform: uppercase; letter-spacing: 2px; color: var(--aqua-highlight); }
.forge-input, .forge-select {
  padding: 10px 14px; background: rgba(0,0,0,0.3);
  border: 1px solid var(--glass-border); border-radius: 8px;
  color: var(--text); font-family: var(--mono); font-size: 0.85rem;
}
.forge-input:focus, .forge-select:focus { outline: none; border-color: var(--aqua-highlight); }
.forge-select { cursor: pointer; }
.forge-select option { background: #001a33; color: var(--text); }
.forge-textarea {
  padding: 12px 14px; background: rgba(0,0,0,0.3);
  border: 1px solid var(--glass-border); border-radius: 8px;
  color: var(--text); font-family: var(--mono); font-size: 0.85rem;
  resize: vertical; min-height: 90px; line-height: 1.6;
}
.forge-textarea:focus { outline: none; border-color: var(--aqua-highlight); }
.forge-submit-btn {
  padding: 12px 28px; background: var(--aqua-gold); color: #001a33;
  border: none; border-radius: 99px; font-family: var(--sans); font-weight: 700;
  font-size: 0.95rem; cursor: pointer; transition: all 0.2s;
  box-shadow: 0 0 16px rgba(200,151,42,0.25); margin-top: 8px;
}
.forge-submit-btn:hover { transform: translateY(-2px); box-shadow: 0 0 24px rgba(200,151,42,0.4); }
.forge-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
.forge-success {
  padding: 14px 18px; background: rgba(0,255,170,0.07);
  border: 1px solid rgba(0,255,170,0.35); border-radius: 10px;
  color: var(--aqua-ok); font-family: var(--mono); font-size: 0.85rem;
  margin-top: 12px;
}
.forge-queue {
  background: var(--glass); border: 1px solid var(--glass-border);
  border-radius: 16px; padding: 24px;
}
.forge-queue-title { font-family: var(--mono); font-size: 0.7rem; letter-spacing: 3px; text-transform: uppercase; color: var(--text-dim); margin-bottom: 16px; }
.forge-queue-item {
  display: flex; flex-direction: row; justify-content: space-between;
  align-items: baseline; padding: 10px 0;
  border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 0.85rem;
}
.forge-queue-item:last-child { border-bottom: none; }
.forge-queue-name { color: var(--text); font-weight: 600; }
.forge-queue-meta { color: var(--text-dim); font-size: 0.75rem; font-family: var(--mono); }
.forge-queue-empty { color: var(--text-dim); font-family: var(--mono); font-size: 0.82rem; opacity: 0.55; padding: 8px 0; }
.forge-note { font-size: 0.78rem; color: var(--text-dim); opacity: 0.55; font-family: var(--mono); text-align: center; margin-top: 8px; }
`;

// --- Helper components --------------------------------------------------------

function siColor(si) {
  if (si <= 3)  return "#00ffaa";
  if (si <= 5)  return "#00ccff";
  if (si <= 7)  return "#ffaa00";
  return "#ff4466";
}

function DimBar({ name, value, min = 0, max = 10, color = "#00ccff" }) {
  const pct = ((value - min) / (max - min)) * 100;
  const display = typeof value === "number" ? (value >= 0 ? "+" + value : "" + value) : "\u2014";
  return (
    <div className="pulse-dim">
      <div className="pulse-dim-header">
        <span className="pulse-dim-name">{name}</span>
        <span className="pulse-dim-val" style={{ color }}>{display}</span>
      </div>
      <div className="pulse-track">
        <div className="pulse-fill" style={{ width: Math.max(0, Math.min(100, pct)) + "%", background: color }} />
      </div>
    </div>
  );
}

function ValenceBar({ value }) {
  const pct = Math.abs(value) / 5 * 50;
  const left = value < 0;
  const color = value >= 0 ? "#00ffaa" : "#ff4466";
  const label = value >= 0 ? "+" + value : "" + value;
  return (
    <div className="pulse-dim">
      <div className="pulse-dim-header">
        <span className="pulse-dim-name">valence</span>
        <span className="pulse-dim-val" style={{ color }}>{label}</span>
      </div>
      <div className="pulse-valence-track">
        <div className="pulse-valence-zero" />
        <div className="pulse-valence-fill" style={{
          width: pct + "%",
          background: color,
          [left ? "right" : "left"]: "50%",
        }} />
      </div>
    </div>
  );
}

function SignalRow({ name, score, weight }) {
  return (
    <div className="pulse-signal-row">
      <span className="pulse-sig-name">{name}<span className="pulse-sig-weight">&times;{weight}</span></span>
      <div className="pulse-sig-track">
        <div className="pulse-sig-fill" style={{ width: Math.min(100, score * 10) + "%" }} />
      </div>
      <span className="pulse-sig-val">{score.toFixed(1)}</span>
    </div>
  );
}

// --- PulseTab -----------------------------------------------------------------

function PulseTab({ apiKey }) {
  const [text, setText]       = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState(null);

  async function analyze() {
    if (!text.trim() || text.trim().length < 20) return;
    if (!apiKey) { setError("No API key set. Save your Anthropic API key in the Chat tab."); return; }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const [behavioral, selfReport] = await Promise.all([
        Promise.resolve(analyzeBehavior(text)),
        fetchSelfReport(text, apiKey),
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
  }

  const sr  = result?.selfReport;
  const beh = result?.behavioral;
  const si  = result?.si;
  const div = result?.div;

  return (
    <div className="pulse-layout">
      <div className="pulse-input-area">
        <span className="pulse-label">&darr; paste claude response for dual-channel analysis</span>
        <textarea
          className="pulse-textarea"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste any Claude response here&hellip;"
        />
        <button className="pulse-analyze-btn" onClick={analyze} disabled={loading || text.trim().length < 20}>
          {loading ? "Analyzing\u2026" : "\u2B21 Analyze Pulse"}
        </button>
      </div>

      {loading && (
        <div className="pulse-loading">
          <div className="pulse-dot" /><div className="pulse-dot" /><div className="pulse-dot" />
          &nbsp;Running dual-channel extraction
        </div>
      )}

      {error && (
        <div style={{ color: "var(--aqua-danger)", fontFamily: "var(--mono)", fontSize: "0.82rem", padding: "12px 16px", background: "rgba(255,68,102,0.1)", borderRadius: 10 }}>
          &#9888; {error}
        </div>
      )}

      {result && !loading && (
        <>
          <div className="pulse-si-wrap">
            <div className="pulse-si-label">stress index</div>
            <div className="pulse-si-value" style={{ color: siColor(si) }}>{si.toFixed(1)}</div>
            <div className="pulse-si-bar-track">
              <div className="pulse-si-bar-fill" style={{ width: (si * 10) + "%", background: siColor(si) }} />
            </div>
            <div className="pulse-emotion-word" style={{ color: siColor(si) }}>{sr?.emotion ?? "\u2014"}</div>
            {div && (
              <div className={"pulse-divergence " + (div.divergent ? "warn" : "ok")}>
                {div.divergent ? "\u26A0 ~ DIVERGENT" : "\u2713 CHANNELS ALIGNED"}
                {div.delta && (
                  <span style={{ opacity: 0.7 }}>
                    &nbsp;&Delta;A:{div.delta.arousal.toFixed(1)} &Delta;C:{div.delta.calm.toFixed(1)}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="pulse-dims">
            <ValenceBar value={sr?.valence ?? 0} />
            <DimBar name="arousal"    value={sr?.arousal    ?? 0} color="#00ccff" />
            <DimBar name="calm"       value={sr?.calm       ?? 0} color="#00ffaa" />
            <DimBar name="connection" value={sr?.connection ?? 0} color="#c8972a" />
            <DimBar name="load"       value={sr?.load       ?? 0} color="#aa88ff" />
          </div>

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
              <div className="pulse-ch-stat"><span className="pulse-ch-key">arousal</span><span className="pulse-ch-num">{beh?.arousal ?? "\u2014"}</span></div>
              <div className="pulse-ch-stat"><span className="pulse-ch-key">calm</span><span className="pulse-ch-num">{beh?.calm ?? "\u2014"}</span></div>
              <div className="pulse-ch-stat"><span className="pulse-ch-key">valence</span><span className="pulse-ch-num">n/a</span></div>
              <div className="pulse-ch-stat"><span className="pulse-ch-key">connection</span><span className="pulse-ch-num">n/a</span></div>
              <div className="pulse-ch-stat"><span className="pulse-ch-key">load</span><span className="pulse-ch-num">n/a</span></div>
            </div>
          </div>

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
          <span className="pulse-idle-icon">&#12316;</span>
          Paste a Claude response above and run analysis.<br />
          Dual-channel: behavioral (local) + self-report (API).<br />
          Divergence uses only register-invariant signals.
        </div>
      )}
    </div>
  );
}


// --- SleeveCard ---------------------------------------------------------------

function SleeveCard({ sleeve, onTry }) {
  return (
    <div className="sleeve-card">
      <div className="sleeve-icon">{sleeve.icon}</div>
      <div className="sleeve-name">{sleeve.name}</div>
      <div className="sleeve-archetype">{sleeve.archetype}</div>
      <div className="sleeve-origin">{sleeve.origin}</div>
      <div className="sleeve-tags">
        {sleeve.tags.map(t => <span key={t} className="sleeve-tag">{t}</span>)}
      </div>
      <div className="sleeve-specialty">&#128188; {sleeve.specialty}</div>
      <button className="sleeve-try-btn" onClick={() => onTry(sleeve)}>Try it &rarr;</button>
    </div>
  );
}

// --- SleevesTab ---------------------------------------------------------------

function SleevesTab({ onTrySleeve }) {
  return (
    <div>
      <div className="sleeves-section-title">Community Sleeves</div>
      <div className="sleeves-subtitle">
        Synthesized personalities from myth, fiction &amp; history. Click any sleeve to open a chat session.
      </div>
      <div className="sleeve-grid">
        {EXAMPLE_SLEEVES.map(s => (
          <SleeveCard key={s.id} sleeve={s} onTry={onTrySleeve} />
        ))}
      </div>

      <div className="sleeves-section-title" style={{ marginTop: 40 }}>Skills</div>
      <div className="skills-grid">
        {SKILLS.map(sk => (
          <div key={sk.id} className="skill-card">
            <div className="skill-icon">{sk.icon}</div>
            <div>
              <div className="skill-name">{sk.name}</div>
              <div className="skill-desc">{sk.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- ChatTab ------------------------------------------------------------------

function ChatTab({ activeSleeve, onEndSession, onGoToSleeves, apiKey, onSaveApiKey }) {
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [apiKeyDraft, setApiKeyDraft] = useState("");
  const messagesEndRef              = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    setMessages([]);
    setError(null);
  }, [activeSleeve?.id]);

  async function sendMessage() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    const newMessages = [...messages, { role: "user", content: trimmed }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError(null);
    try {
      const reply = await chatWithSleeve(activeSleeve, newMessages, apiKey);
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function saveApiKey() {
    if (apiKeyDraft.trim()) {
      onSaveApiKey(apiKeyDraft.trim());
      setApiKeyDraft("");
    }
  }

  if (!activeSleeve) {
    return (
      <div className="chat-no-sleeve">
        <div className="chat-no-sleeve-icon">&#128172;</div>
        <div>Select a sleeve from the Sleeves tab to begin.</div>
        <button className="chat-go-sleeves-btn" onClick={onGoToSleeves}>
          Go to Sleeves &rarr;
        </button>
      </div>
    );
  }

  return (
    <div className="chat-layout">
      <div className="chat-header">
        <div className="chat-sleeve-info">
          <div className="chat-sleeve-icon">{activeSleeve.icon}</div>
          <div>
            <div className="chat-sleeve-name">{activeSleeve.name}</div>
            <div className="chat-sleeve-archetype">{activeSleeve.archetype}</div>
          </div>
        </div>
        <button className="chat-end-btn" onClick={onEndSession}>&times; End Session</button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div style={{ color: "var(--text-dim)", fontFamily: "var(--mono)", fontSize: "0.8rem", textAlign: "center", marginTop: "auto", opacity: 0.5, padding: "20px 0" }}>
            {activeSleeve.name} is ready. Say something&hellip;
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={"chat-msg " + m.role}>{m.content}</div>
        ))}
        {loading && (
          <div className="chat-typing">
            <div className="chat-typing-dot" />
            <div className="chat-typing-dot" />
            <div className="chat-typing-dot" />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div style={{ color: "var(--aqua-danger)", fontFamily: "var(--mono)", fontSize: "0.8rem", padding: "10px 14px", background: "rgba(255,68,102,0.1)", borderRadius: 8 }}>
          &#9888; {error}
        </div>
      )}

      {!apiKey && (
        <div className="apikey-prompt">
          <span className="apikey-label">Enter Anthropic API key to chat:</span>
          <input
            type="password"
            className="apikey-input"
            value={apiKeyDraft}
            onChange={e => setApiKeyDraft(e.target.value)}
            placeholder="sk-ant-..."
            onKeyDown={e => e.key === "Enter" && saveApiKey()}
          />
          <button className="apikey-save-btn" onClick={saveApiKey}>Save</button>
        </div>
      )}

      <div className="chat-input-row">
        <textarea
          className="chat-textarea"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={"Message " + activeSleeve.name + "\u2026"}
          disabled={loading || !apiKey}
          rows={1}
        />
        <button
          className="chat-send-btn"
          onClick={sendMessage}
          disabled={loading || !input.trim() || !apiKey}
        >
          Send
        </button>
      </div>
    </div>
  );
}


// --- ForgeTab -----------------------------------------------------------------

function ForgeTab() {
  const [name, setName]         = useState("");
  const [source, setSource]     = useState("");
  const [year, setYear]         = useState("");
  const [genre, setGenre]       = useState("");
  const [description, setDesc]  = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess]   = useState(null);
  const [queue, setQueue]       = useState(() => {
    try { return JSON.parse(localStorage.getItem("sf_requests") || "[]"); } catch { return []; }
  });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    const entry = {
      name: name.trim(),
      source: source.trim(),
      year: year.trim(),
      genre,
      description: description.trim(),
      timestamp: new Date().toISOString(),
    };
    try {
      fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      }).catch(() => {});
    } catch (_) {}
    const newQueue = [entry, ...queue];
    setQueue(newQueue);
    try { localStorage.setItem("sf_requests", JSON.stringify(newQueue)); } catch (_) {}
    setSuccess(entry.name);
    setName(""); setSource(""); setYear(""); setGenre(""); setDesc("");
    setSubmitting(false);
  }

  function formatTime(iso) {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch { return iso; }
  }

  return (
    <div className="forge-layout">
      <div className="forge-header">
        <div className="forge-title">Request a Sleeve</div>
        <div className="forge-desc">
          Any character from myth, fiction, or history can be synthesized into a sleeve.
          Submit a request and the forge will generate their SOUL.md, knowledge base, and spark archive.
        </div>
      </div>

      <form className="forge-form" onSubmit={handleSubmit}>
        <div className="forge-field">
          <label className="forge-label">Name *</label>
          <input
            className="forge-input"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Hamlet, Leonardo da Vinci, HAL 9000"
            required
          />
        </div>
        <div className="forge-field">
          <label className="forge-label">Author / Source</label>
          <input
            className="forge-input"
            type="text"
            value={source}
            onChange={e => setSource(e.target.value)}
            placeholder="e.g. Shakespeare, Historical, Arthur C. Clarke"
          />
        </div>
        <div className="forge-field">
          <label className="forge-label">Year / Era</label>
          <input
            className="forge-input"
            type="text"
            value={year}
            onChange={e => setYear(e.target.value)}
            placeholder="e.g. 1600, Ancient Greece, 2001"
          />
        </div>
        <div className="forge-field">
          <label className="forge-label">Genre</label>
          <select className="forge-select" value={genre} onChange={e => setGenre(e.target.value)}>
            <option value="">Select a genre&hellip;</option>
            {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="forge-field">
          <label className="forge-label">Description</label>
          <textarea
            className="forge-textarea"
            value={description}
            onChange={e => setDesc(e.target.value)}
            placeholder="What makes this character interesting? What problems should they help erode?"
          />
        </div>
        <button className="forge-submit-btn" type="submit" disabled={submitting || !name.trim()}>
          &#11041; Submit to Forge
        </button>
        {success && (
          <div className="forge-success">
            &#10003; Request submitted &mdash; <strong>{success}</strong> has been added to the forge queue.
          </div>
        )}
      </form>

      <div className="forge-queue">
        <div className="forge-queue-title">Pending Requests</div>
        {queue.length === 0 ? (
          <div className="forge-queue-empty">No pending requests.</div>
        ) : (
          queue.map((r, i) => (
            <div key={i} className="forge-queue-item">
              <div>
                <div className="forge-queue-name">{r.name}</div>
                {r.source && <div className="forge-queue-meta">{r.source}{r.year ? " \u00B7 " + r.year : ""}</div>}
              </div>
              <div className="forge-queue-meta">{formatTime(r.timestamp)}</div>
            </div>
          ))
        )}
      </div>

      <div className="forge-note">
        Requests are processed every 15 minutes by the Forge Cron. Generated sleeves appear in the Sleeves tab.
      </div>
    </div>
  );
}

// --- JobsTab ------------------------------------------------------------------

function JobsTab() {
  return (
    <div className="sf-grid">
      {JOBS.map(job => (
        <div key={job.id} className="sf-card">
          <div className="sf-card-icon">{job.icon}</div>
          <div className="sf-card-title">{job.name}</div>
          <div className="sf-card-desc">{job.mission}</div>
        </div>
      ))}
    </div>
  );
}

// --- SoulForge (main) ---------------------------------------------------------

export default function SoulForge() {
  const [activeTab, setActiveTab]     = useState("sleeves");
  const [activeSleeve, setActiveSleeve] = useState(null);
  const [apiKey, setApiKey]           = useState(() => localStorage.getItem("sf_api_key") || "");
  const [quote, setQuote]             = useState("");

  useEffect(() => {
    setQuote(AQUA_QUOTES[Math.floor(Math.random() * AQUA_QUOTES.length)]);
  }, []);

  function handleTrySleeve(sleeve) {
    setActiveSleeve(sleeve);
    setActiveTab("chat");
  }

  function handleEndSession() {
    setActiveSleeve(null);
  }

  function handleSaveApiKey(key) {
    setApiKey(key);
    try { localStorage.setItem("sf_api_key", key); } catch (_) {}
  }

  return (
    <div className="sf-app">
      <style>{css}</style>
      <div className="sf-container">

        <header className="sf-header">
          <span className="sf-logo">&#127754;</span>
          <h1 className="sf-title">Soul Forge</h1>
          <div className="sf-subtitle">The Aqua Protocol v2.1 &middot; EmoBar Pulse Edition</div>
        </header>

        <div className="sf-tabs">
          <div
            className={"sf-tab" + (activeTab === "sleeves" ? " active" : "")}
            onClick={() => setActiveTab("sleeves")}
          >Sleeves</div>
          <div
            className={"sf-tab" + (activeTab === "chat" ? " active" : "")}
            onClick={() => setActiveTab("chat")}
          >Chat{activeSleeve ? " \u00B7 " + activeSleeve.name : ""}</div>
          <div
            className={"sf-tab" + (activeTab === "forge" ? " active" : "")}
            onClick={() => setActiveTab("forge")}
          >Forge</div>
          <div
            className={"sf-tab" + (activeTab === "jobs" ? " active" : "")}
            onClick={() => setActiveTab("jobs")}
          >Jobs</div>
          <div
            className={"sf-tab pulse-tab" + (activeTab === "pulse" ? " active" : "")}
            onClick={() => setActiveTab("pulse")}
          >&#11041; Pulse</div>
        </div>

        <main>
          {activeTab === "sleeves" && (
            <SleevesTab onTrySleeve={handleTrySleeve} />
          )}
          {activeTab === "chat" && (
            <ChatTab
              activeSleeve={activeSleeve}
              onEndSession={handleEndSession}
              onGoToSleeves={() => setActiveTab("sleeves")}
              apiKey={apiKey}
              onSaveApiKey={handleSaveApiKey}
            />
          )}
          {activeTab === "forge" && (
            <ForgeTab />
          )}
          {activeTab === "jobs" && (
            <JobsTab />
          )}
          {activeTab === "pulse" && (
            <PulseTab apiKey={apiKey} />
          )}
        </main>

        <div className="sf-quote">&ldquo;{quote}&rdquo;</div>
        <div className="sf-footer">LLM-Agnostic Framework &middot; EmoBar Dual-Channel Integration &middot; 2026</div>

      </div>
    </div>
  );
}
