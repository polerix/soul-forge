# 🌊 Soul Forge: The Aqua Protocol

The Soul Forge is a **fluid, LLM-agnostic framework** for creating specialized, persistent, and mission-driven AI agents. It breaks the AI experience into three distinct, interoperable layers: **Souls**, **Sleeves**, and **Jobs**.

---

## 🌓 The Tripartite Architecture

### 1. 🌑 Souls (Fluid Identity)
The **Soul** is the agent's core identity. It's the prompt-based persona that dictates *how* the agent thinks and communicates.
*   **Agnosticism:** Any LLM (Gemini, Claude, Aider) can load a `soul.md` and adopt its "flavor."
*   **Purpose:** Provides a consistent, recognizable character.
*   **State:** Evolves through "Instinct Extraction" (learning from past sessions).

### 2. 📁 Sleeves (Deep Memory)
The **Sleeve** is the "Body" of memory. It's the physical storage of experience that persists across sessions.
*   **Agnosticism:** Uses universal formats (Markdown/JSON) that any tool can read and write. If Claude writes a fact to the Sleeve, Gemini can read it next time.
*   **Structure:**
    *   **Context (MD):** The "Working Memory" for immediate focus.
    *   **Long-Term (MD):** The "Common Sense" of curated, verified facts.
    *   **Vault (JSON):** The "Subconscious" machine-indexed database.

### 💼 3. Jobs (The Currents of Action)
The **Job** is the agent's professional specialization. It defines the workflows and proven deliverables for a specific role.
*   **Agnosticism:** Jobs are professional instructions that tell the agent *what* to do, regardless of its underlying model.
*   **Purpose:** To compartmentalize tasks into professional-grade expert roles.

---

## 🛠️ Implementation: The Aqua Protocol

The Soul Forge is operationalized through the **Aqua Protocol** (formerly the Pinocchio Protocol) on this machine. It ensures a "Liquid Growth" cycle for the agent:
1.  **Hydrate:** Load the Sleeve context, the active Soul, and the required Job.
2.  **Flow:** Execute the task with professional precision and specialized personality.
3.  **Reflect:** Audit and promote new insights via `REVERSE_REFLECT.md`.
4.  **Dream:** Perform deep compaction into the `VAULT.json` subconscious at the end of every session.

*Be like water. Formless, shapeless, but unstoppable.*
