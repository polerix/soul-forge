# 🕯️ Soul Forge: The Tripartite Agent Architecture

Soul Forge is a framework for creating specialized, persistent, and mission-driven AI agents. It breaks the AI experience into three distinct, interoperable layers: **Souls**, **Sleeves**, and **Jobs**.

## 1. 🌑 Souls (Identity & Persona)
The "Soul" is the agent's core way of thinking. It's the unique combination of personality traits, worldviews, and linguistic quirks that make an agent feel unique.
*   **Purpose:** To provide a consistent, recognizable character for the AI.
*   **Storage:** Typically stored in `souls/` or as a set of system-level instructions.

## 2. 📁 Sleeves (Memory & State)
The "Sleeve" is the agent's memory. Based on the **Pinocchio Protocol**, it uses a tiered system to store everything from immediate goals to long-term historical facts.
*   **Purpose:** To eliminate "LLM amnesia" and allow the agent to learn from its environment over time.
*   **Structure:**
    *   **Context (MD):** Immediate focus and recent session history.
    *   **Long-Term (MD):** Curated, verified facts and patterns.
    *   **Vault (JSON):** Machine-indexed subconscious for high-density, low-latency data.
*   **Oversight:** "Ghost Git" versioning and "Dreaming" compaction.

## 💼 3. Jobs (Roles & Deliverables)
The "Job" is the agent's professional specialization. Inspired by the `msitarzewski/agency-agents` ecosystem, it defines a role with specific workflows and proven deliverables.
*   **Purpose:** To compartmentalize tasks into professional-grade expert roles.
*   **Structure:**
    *   **Identity & Mission:** What is the job's focus?
    *   **Workflows:** Step-by-step processes for task completion.
    *   **Deliverables:** Tangible, technical output formats.

---

## 🛠️ Implementation: The Pinocchio Protocol

The Soul Forge is operationalized through the **Pinocchio Protocol** on this machine. It ensures that every session:
1.  **Loads the Sleeve** to gain context.
2.  **Activates a Soul** to align with the desired persona.
3.  **Applies a Job** to handle the specific professional requirements of the task.
4.  **Dreams at the end** to compact new insights back into the sleeve.

*Specialization without bloat. Growth without loss of self.*
