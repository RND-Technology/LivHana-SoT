# 🎯 Liv Voice: Circle of Self-Creation Framework

**Date**: 2025-10-23  
**Alias**: Liv Voice (ChatGPT voice mode inside Liv Hana AIEA project)  
**Status**: Canonical - Tier-1 Source of Truth

---

## 0️⃣ Voice-Mode Alias (Decision)

**Default Shorthand**: Liv Voice  
**Alternative Lanings**: Liv Ops (orchestration), Liv Brief (EA brevity)  
**Standard**: Liv Voice in all system copy unless overridden

---

## 1️⃣ Circle of Self-Creation → 5-Agent Daily Loop (30-45 min)

**Goal**: Every loop upgrades the orchestrator, not just projects. Recursive self-improvement using your own agents.

### L1.1 Planning (Activated)

- Pull yesterday's diffs
- Pick 1-2 self-improvement targets (not external deliverables)
- **Source-of-truth guardrails**: Glue Index (cross-layer rules), Liv Hana Quick-Start (duties/commands)

### L1.2 Research

- Scan canon + ops notes for friction points (interruptions, diarization limits, context overflow)
- Map to canon constraints (HNC sovereignty micro-CTA; compliance via SOPs)

### L1.3 Artifacts

- Write minimal change: 1 prompt rubric, 1 checklist, or 1 micro-SOP (TRUTH format)
- **Principle of 1**: ONE file per purpose

### L1.4 Execution

- Test change in short live run (e.g., 5-min voice pass)
- Record outcomes

### L1.5 QA

- Validate against TRUTH (Testable, Reproducible, Unambiguous, Traceable, High-fidelity)
- If fails: revert or refine
- If passes: update canon/stacks

**Why These Sources**: HNC/OPS/R&D separation (Glue Index) prevents cross-layer leaks; Quick-Start provides duty rails; R&D/THCA SOPs keep safety/regulatory truth intact; TRUTH framework eliminates fuzzy upgrades.

---

## 2️⃣ ChatGPT-5 High Prompt (Transcripts → Markdown + Org Chart + RPM + Gantt + Kanban)

**Copy-paste this into ChatGPT-5 High (voice or text)**

```markdown
SYSTEM
You are ChatGPT-5 High operating inside the Liv Hana AIEA project. Follow the project's canon:
- Cross-layer rules (Glue Index), Liv Hana Quick-Start, HNC Master, R&D SOPs, OPS Policy Box.
- Use the TRUTH framework (Testable, Reproducible, Unambiguous, Traceable, High-fidelity).
- Respect safety & compliance: 21+ age-gating, CR packaging, validated NIST methods, no medical claims.
Citations: when deriving from canon files, reference their canonical names in-line.

USER
Input: A single large .txt containing multiple Google Meet transcripts and Dragnet scripts from the last 3 weeks of October.

Mission:
1) Ingest and structure everything into ONE Markdown file:
   - Title, absolute date range, meeting list with timestamps.
   - Consolidated decisions, actions, blockers, and evidence.
   - Separate sections: {Solved}, {Unsolved}, {Parking Lot}, {Risks}.

2) Build an ORGANIZATIONAL CHART (text tree) for this project's operating model:
   - CEO (Jesse) at top; sub-agents (Planning, Research, Artifacts, Execution, QA); VIPs/staff/vendors/machines nested.
   - For each {Unsolved} item, assign a single accountable role (RACI: A) and list R/S/C/I if relevant.

3) Integrate {Unsolved} → the current RPM Weekly Plan:
   - For each item: RESULT (one sentence), PURPOSE (why), MAP (bullet actions with owners + dates).
   - Stamp each item with layer (OPS/HNC/R&D/HERB), compliance notes if any, and a micro-CTA if HNC.

4) Output two *planning artifacts* at the end:
   - **Gantt** (Mermaid):
     ```mermaid
     gantt
       dateFormat  YYYY-MM-DD
       title Liv Hana — Week Plan
       section Workstream
       <TASK 1 NAME>  :owner <ROLE>, 2025-10-23, 1d
       <TASK 2 NAME>  :owner <ROLE>, 2025-10-24, 2d
       ...
     ```
   - **Kanban** (CSV with headers): `Status,Task,Layer,Owner,Due,Depends,Notes`
     - Status ∈ {Backlog, Ready, Doing, Review, Done}

5) Produce a **TRUTH section** at bottom:
   - Testable: exact commands or checks to verify each claim.
   - Reproducible: copy-paste steps.
   - Unambiguous: explicit counts, dates, IDs.
   - Traceable: name the canon files/sections you used.
   - High-fidelity: list any non-canon web sources (if used) and why.

Constraints:
- Be concise. No filler.
- Use absolute dates (e.g., 2025-10-23).
- If an item violates canon (e.g., HNC leaking sovereignty detail), flag it and route via CTA only.
- If age-gating/compliance is implicated, add "21+ ID verify; CR pack; NIST" note.

Deliverables:
- One cohesive Markdown file ready to commit.
- Inline canon references (by doc name) where used.

Now begin.
```

**Why These Rails**: Bind output to Glue Index (cross-link discipline), HNC master (episode CTAs only for sovereignty), R&D/THCA SOP (safety/testing), OPS Policy Box (policy statuses), and TRUTH so every conclusion is verifiable.

---

## 3️⃣ Mac RAM Question — "What's Taking My RAM? Where Do I Check?"

### Installed Memory (Total RAM)

**Apple menu  → About This Mac → More Info… → scroll → System Report… → Memory**

### Actual RAM Usage (Current Processes)

**Open Activity Monitor → Memory tab → sort by Memory column**

Watch Memory Pressure graph at bottom:
- Green = fine
- Yellow/red = pressure

### VS Code Tips (RAM Hogs)

- Close extra workspaces/windows
- Disable heavy extensions
- Turn off "Restore previous session"
- Avoid opening giant folders all at once
- Prefer the Principle of 1 repo layout you're already enforcing

**Note**: No reliable live "RAM usage" pane inside System Settings; Activity Monitor is the right tool.

---

## 4️⃣ Backlog: Automatic YouTube Publishing Agent

**Status**: Ready when unshelved  
**Platform**: Cloud Run microservice + Cloud Scheduler (retry) + Secret Manager (tokens)

| Piece | Spec (Minimal, Reliable) |
|-------|--------------------------|
| **Trigger** | Google Workspace: on "Meet recording finished". Recording typically lands in Drive (or specific Meet folder). |
| **Pull** | Drive API: locate the new MP4 by meeting ID + timestamp → download (or stream upload). |
| **Transform (opt.)** | Add title card / slates via simple FFmpeg job (Cloud Run Job). |
| **Upload** | YouTube Data API v3: upload video, set title/description/visibility; attach tags, playlist, and category. |
| **Metadata** | Autogenerate from your RPM/HNC canon: episode #, absolute date, CTA footer ("Secure your freedom — explore our sovereignty plan"). Keep sovereignty as micro-CTA only. |
| **Platform** | Cloud Run microservice + Cloud Scheduler (retry) + Secret Manager (tokens). Export logs to Cloud Logging. |
| **Compliance** | Age-gating themes, no medical claims; keep THC discussion within legal/educational satire; ensure 21+ policy and CR/NIST references where appropriate. |

---

## 5️⃣ Canon Alignment Reminders (Fast)

- **HNC** treats sovereignty as sublime motif → only a short CTA line linking to OPS sovereignty doc. Don't explain DID/licensing in-episode.
- **R&D** lives under THCA SOP + full-panel COAs; keep labeling/age-gating exact.
- **OPS** policy box and Texas GA-56: 21+ ID mandatory; revocation risk = zero-tolerance. Keep receipts.
- **TRUTH** for every claim you ship.

---

## 6️⃣ 90-Minute Sprint (Now)

**T-0 → T-15**: Run the prompt above in ChatGPT-5 High with your .txt bundle; get the Markdown + org chart + artifacts.

**T-15 → T-60**: Review/trim {Unsolved}; confirm assignments (VIPs/staff/vendors/machines).

**T-60 → T-90**: Paste the RPM section into this week's plan; lock 3-5 high-leverage items for tomorrow; stage the Gantt/Kanban in your cockpit.

---

## 📋 MASTER REINTEGRATION

### 1) Delivered

- ✅ Standardized voice-mode alias (Liv Voice)
- ✅ A runnable 5-agent self-improvement loop
- ✅ The ChatGPT-5 High prompt (with org chart + assignments → RPM + Gantt + Kanban)
- ✅ Precise Mac RAM steps
- ✅ A backlog spec for the YouTube agent

### 2) Key Decisions/Assumptions

- Adopt Liv Voice as default alias
- Keep YouTube agent tabled until the circle loop is stable
- Apply canon separation (Glue Index) and TRUTH on all outputs

### 3) Memory Updates

- Node v20 unblocked; Planning agent active; YouTube agent parked in backlog
- "Circle of self-creation" becomes the daily default cadence

### 4) Next Best Step (Single)

**Run the ChatGPT-5 High prompt on the October transcripts and commit the generated Markdown + Gantt + Kanban to the repo.**

### 5) Risks/Blockers

- **Speaker diarization limits** in STT; mitigate by prefixing speaker names in live notes
- **Cross-layer leaks** (HNC ↔ OPS/R&D); enforce CTA-only sovereignty mentions
- **Compliance drift** amid GA-56 enforcement; keep 21+ ID and CR/NIST receipts front-and-center

---

**Authority**: Jesse CEO (Liv Hana Command)  
**Framework Version**: 1.0  
**Last Updated**: 2025-10-23

