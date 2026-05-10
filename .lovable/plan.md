# Data Privacy Engagement Management System — Build Plan

This is a large scope. I'll deliver it in phased, shippable increments so you can review each stage. Everything stays frontend (TypeScript + React + Tailwind + shadcn) with `localStorage` persistence keyed by engagement, matching the existing pattern. Lovable Cloud can be wired in later if you want multi-user persistence.

## Data Model (shared)

A single `Engagement` aggregate stored under `pa_engagements`:

```text
Engagement
├─ id, clientName, status, createdAt
├─ transcripts[]   { id, raw, anonymized, mode: off|standard|strict, actions[], dpsMentions[] }
├─ pias[]          { id, type: "Phase1"|"Full", dpsStatus: "New"|"Existing",
│                    scope: "Individual"|"Consolidated", consolidatedGroupId?,
│                    phase1, phase2, phase3, drlLinks[] }
├─ drlItems[]      { id, kind, title, file?, status, linkedFields[] }
└─ riskMitigation[] (rows from Risk Mitigation table)
```

Each PIA phase mirrors the Excel template exactly (field IDs match column anchors so export round-trips cleanly).

## Phase A — Engagement + Kickoff (Transcript → Actions)

1. **Engagement Manager** becomes functional: create / select / switch engagement (sidebar shows active engagement).
2. **Upload Transcript** page extended:
   - Anonymization selector: Off / Standard / Strict (extends existing `anonymize.ts`).
   - Stub extractor produces: action items, key discussion points, DPS mentions.
   - Buttons: "Send via Email Generator" (prefills template) and "Create PIA from this transcript".

## Phase B — PIA Engine (the big one)

New route `/pia/:id` with phase tabs. Each phase is its own component.

### Phase 1 — Project Context
- **Project-System Description** form (sentence-style fill-ins matching your template).
- **Threshold Analysis** — 12 questions, Yes/No + Response, auto-computes "IS PIA REQUIRED?" (Yes if any Yes, except specific exclusions per template logic).
- **Stakeholder Engagement** dynamic table.

### Phase 2 — Data Mapping
- DPS Details block (manual/electronic/both, PIC/PIP, DPO, lawful basis dropdowns, consent, retention, automated decisioning, security measures O/P/T).
- Data Lifecycle blocks: Collection, Use, Disclosure (Internal/External), Retention & Disposal repositories.
- All dropdowns + tooltips ported from the Excel (lawful-basis enum, media types, etc.).

### Phase 3 — Assessment
Five sub-sections, each a structured checklist with Response, Threats/Vulnerabilities, Risk, Legal Basis, Impact (1–5), Probability (1–5), auto-computed Risk Rating (Low/Medium/High/Critical):
1. General Data Privacy Principles (Transparency, Legitimate Purpose, Proportionality, Fairness, Accuracy, Purpose Limitation, Storage Limitation)
2. Data Subject Rights
3. Data Security Measures (Organizational, Physical, Technical)
4. Cross-Border Transfers (optional toggle)
5. Risk Mitigation table (Observation, Inherent Risk, Treatment, Mitigation, Status, Residual, Control Ref, dates, owner)

Inherent-risk seed values come from the template; user can override per your DPO note.

### Cross-cutting
- **Auto-save** to localStorage with completion %.
- **PIA Type toggle** (Phase 1 only / Full).
- **DPS Status** (New / Existing) and **Scope** (Individual / Consolidated + group picker).
- **Privacy Risk Map** info card.
- **Excel export** updated to write all new fields back into the existing PRADAR-style workbook.

## Phase C — DRL Integration
- DRL panel inside each PIA: add items (System Design Doc, Consent Form, Full Privacy Notice, JIT Notice, CCTV Notice, DPO Contact Details, custom).
- Each DRL item can be linked to one or many PIA fields ("Used for fairness evaluation", etc.).
- Status: Requested / Received / N/A. Surfaced in DRL Generator page.

## Phase D — Executive Summary Generator
New route `/executive-summary` (replaces the current stub) with the nine sections you listed:

1. Overview KPIs (DPS count, Full PIA count, Phase 1 count)
2. DPS Breakdown (Existing/New, Full/Phase 1, Consolidated/Individual + group sizes)
3. Purpose (editable templated paragraph)
4. Scope — Data Lifecycle aggregations:
   - Collection (PI/SPI/Privileged totals, internal/external/both, legal-basis breakdown for PI and SPI separately)
   - Use & Storage (defined vs undefined repos, retention availability, electronic/physical/unspecified)
   - Sharing (with/without sharing, with/without agreement, cross-border)
   - Retention distribution + averages
   - Disposal coverage by media type
5. Key Risks — risk matrices for each Phase 3 sub-section + Top 5 risks per category
6. Mitigation Measures — Top 5 recommended actions
7. Conclusion (editable standard text)
8. Annexes — full tables backing the analytics
9. Export to PDF / Excel

All charts use existing `recharts`/shadcn `chart` components. Styling stays in the indigo dashboard theme.

## Suggested ship order

1. Phase A (Engagement + Transcript with anonymization modes)
2. Phase B.1 (Phase 1 form — Description, Threshold, Stakeholders)
3. Phase B.2 (Phase 2 Data Mapping)
4. Phase B.3 (Phase 3 Assessment + Risk Mitigation)
5. Phase C (DRL linking)
6. Phase D (Executive Summary)
7. Updated Excel export covering everything

Each step is independently usable and reviewable.

## Technical notes

- New files under `src/lib/pia/` (`schema.ts`, `store.ts`, `risk.ts`, `analytics.ts`).
- New components under `src/components/pia/` per phase, plus reusable `RiskRatingCell`, `ChecklistRow`, `LegalBasisSelect`.
- Existing `pradarTemplate.ts` / `pradarExport.ts` extended, not replaced — your current PRADAR Checklist keeps working.
- No backend yet; if you want collaboration / audit trail across users, we enable Lovable Cloud after Phase B.

## Open questions

1. **Persistence**: stick with localStorage for now, or enable Lovable Cloud up front so multiple consultants share data?
2. **Risk Rating formula**: use the 5×5 matrix (Impact × Probability → Low ≤6, Medium 7–14, High 15–19, Critical 20–25) or your firm's existing scale?
3. **Consolidated PIAs**: should one consolidated PIA's Phase 2 hold many DPS rows, or do member PIAs stay separate and just reference a group ID?
4. **Export format priority**: keep XLSX as primary, or also need PDF for the Executive Summary now?

Confirm (or adjust) and tell me which phase to start with — I'd suggest A → B.1 in the next turn.