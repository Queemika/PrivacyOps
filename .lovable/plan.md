# Plan — PIA Refinements + ROPA/NPC-RS Generator

Applies the new spec across **all PIAs** (new and existing). Migration logic in `store.ts` will fill missing fields with safe defaults so older saved PIAs auto-upgrade on load.

## 1. Phase 1 — Project System Description (rebuild)

Replace the current "fill-in-the-paragraph" UI with a structured form. New `phase1.desc` fields with tooltips:


| Field                | Input                                            | Notes                                                          |
| -------------------- | ------------------------------------------------ | -------------------------------------------------------------- |
| System Type          | text                                             | high-level nature                                              |
| System Function      | text                                             | what it does                                                   |
| Organization / Scope | text                                             | dept/BU                                                        |
| Key Processes        | multi-line / checklist                           | lifecycle activities                                           |
| Data Collection      | multi-select + text                              | sources/methods (drives Phase 2 Lifecycle → Collection "When") |
| Data Usage           | text                                             | operational use                                                |
| Data Storage         | multi-select (Cloud / On-prem / Physical) + text | &nbsp;                                                         |
| Data Disposal        | dropdown + text                                  | (Shredding, Secure Erase, Vendor Disposal, Other)              |
| Integration          | multi-select + text                              | &nbsp;                                                         |
| Supporting Documents | file upload                                      | stored as file refs                                            |
| Purpose              | text                                             | drives Phase 2 Purpose of Processing                           |
| PIA Scope            | multi-line                                       | &nbsp;                                                         |
| Out of Scope         | multi-line                                       | &nbsp;                                                         |


Each field gets a hover tooltip via `Tooltip` component using the wording supplied.

## 2. Phase 1 — Threshold Analysis

- Remove **N/A** option (Yes/No only).
- Question #5 ("Estimated records") - If yes is selected, response becomes a **dropdown**: `Low (<250)`, `Medium (<1000)`, `High (1000+)`.
- `isPiaRequired` logic updated (Yes triggers required; all No → not required).

## 3. Phase 1 — Stakeholders (default rows)

Always seeded and non-removable rows:

- **DPO** — Present
- **MIS** — Present (label note: "if system is hybrid/purely-system based")
- **Client / Customer** — Role: Data Subject — Present

User may add more stakeholders below.

## 4. PIA Status gating

- Header `type` select: when **Phase 1 only status** is chosen, Phase 1 (except Threshold Analysis), Phase 2, and Phase 3 tabs are hidden (not just disabled), and Sign-off tab appears immediately after Phase 1/Threshold Analysis.
- **Scope = Consolidated** → new **required** field "DPS Components" appears in the workspace header (textarea / chip input listing component DPS names). Save/submit blocked until populated.

## 5. Phase 2 wiring

- **DPS Name** edits also set `pia.title` (live sync both ways).
- **Purpose of Processing** auto-populates from Phase 1 `Data Collection` (editable, with "reset to Phase 1" link).
- **Personal Data Categories** table: rename column `PIP/PIC` → `PIC/PIP` with dropdown `[PIC, PIP]`. `amount` field uses `Intl.NumberFormat` (`0,000`).
- **Roles & Contacts**:
  - PIC block always visible.
  - PIP block only renders when any category row has `PIC/PIP = PIP` OR `outsourced = Yes`.
- **Lawful Basis & Consent** section only renders when PIP is present (same condition above).
- **Data Lifecycle — Collection**: `When collected` dropdown derived from Phase 1 `Data Collection` selections; `Who collects` dropdown `[PIC, PIP]`.
- **Data Lifecycle — Use**: `Position & Department` auto-fills from Stakeholders' Name/Role; `Purpose` auto-fills from Stakeholders' Involvement. Cells editable to override.
- **Data Lifecycle — Disclosure**: when `kind=Internal` AND recipients includes `"Inter-office Collaboration"`, the `agreement`, `pic`, `crossBorder` cells become disabled & blank.
- **Retention & Disposal — Information Repositories**:
  - Rename column `Repository Name` → `List of Information`, auto-fills from Phase 2 Use `fileName`.
  - New column `Hosting` dropdown `[In-house, Outsourced]`; `Location` display becomes `"<location> | <hosting>"`.

## 6. Phase 3 — Risk Map

Update `risk.ts` to the 4×4 matrix from the spec:

```
Impact \ Prob  1  2  3  4
   4          4  8 12 16
   3          3  6  9 12
   2          2  4  6  8
   1          1  2  3  4
```

Buckets: **Low 1–3, Medium 4–6, High 8–9, Critical 12–16**. `ChecklistRow` impact/probability selectors switch from 1–5 to 1–4 with tooltip describing each level (Negligible/Limited/Significant/Maximum; Unlikely/Possible/Likely/Almost Certain).

## 7. Sign-off tab

New `Phase4SignOff.tsx` + `phase4` block in schema:

```
prepared: { name, designation, date, signature }   // System/Process Owner
reviewed: { name, designation, date, signature }   // DPO / Compliance Officer
approved: { name, designation, date, signature }   // Group Head
```

Signature input = typed name + canvas pad (data URL). Tab visible for all PIA types (also when Phase 1 only and threshold says "Not Required").

## 8. Submit copy

Workspace header **Submit** button toast: `"Submitted to reviewer"` (replaces "Submitted to supervisor").

## 9. Migration / Apply across PIAs

`store.ts` gets a `migratePia(p)` helper called inside `getPia` / `loadPias` that:

- Fills new `phase1.desc` keys with values from old ones (e.g., `dataCollection`).
- Removes any `"N/A"` threshold answers → blank.
- Seeds default stakeholders if missing.
- Adds `phase4` sign-off skeleton.
- Adds `consolidatedComponents: []` field.

This ensures **existing PIAs** receive the new UI/behavior automatically.

---

## 10. ROPA & NPC-RS Generator (new page)

New route `/ropa/:piaId` (`src/pages/RopaGenerator.tsx`) replacing the current `RopaPreview` stub, plus library list at `/ropa`.

**Two tabs**: ROPA, NPC-RS. Each renders a table built from Phase 2 data using a field-mapping module `src/lib/pia/ropaMap.ts`:

- ROPA fields (per spec): 

  |                                                           |
  | --------------------------------------------------------- |
  | PIA Name                                                  |
  | Data Processing System                                    |
  | Purpose of Processing                                     |
  | Intended Future Purpose (if any)                          |
  | Data Sharing Purpose                                      |
  | Is there any Data Sharing Agreements with other parties?  |
  | Description of the category or categories of data subject |
  | Personal Information                                      |
  | Sensitive Personal Information                            |
  | Privileged Information                                    |
  | When is data collected?                                   |
  | Retention Period with Reckoning date/time                 |
  | Disposal/Destruction/Deletion Procedure                   |
  | Organizational                                            |
  | Physical                                                  |
  | Technical                                                 |
  | Name of PIC                                               |
  | Name of DPO                                               |
  | Email                                                     |
  | Contact No.                                               |
  | Timestamps (created / updated)                            |

- NPC-RS fields: 

  |                                                                                                                                                             |
  | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | PIA Name                                                                                                                                                    |
  | Data Processing Name                                                                                                                                        |
  | Is DPS Manual, Electronic, or Both?                                                                                                                         |
  | Basis for Processing Personal Information                                                                                                                   |
  | Basis for Processing Sensitive Personal Information (If applicable)                                                                                         |
  | Purpose of Processing                                                                                                                                       |
  | Description of the category or categories of data subject                                                                                                   |
  | Description of data or categories of data relating to Data Subjects                                                                                         |
  | Recipients or categories of recipients to whom the data might be disclosed                                                                                  |
  | Is processing done as PIC or PIP?                                                                                                                           |
  | Is the system outsourced or subcontracted?                                                                                                                  |
  | Name of PIP                                                                                                                                                 |
  | Email                                                                                                                                                       |
  | Contact No.                                                                                                                                                 |
  | When is data collected?                                                                                                                                     |
  | Retention Period with Reckoning date/time                                                                                                                   |
  | Disposal/Destruction/Deletion Procedure                                                                                                                     |
  | Organizational                                                                                                                                              |
  | Physical                                                                                                                                                    |
  | Technical                                                                                                                                                   |
  | Is personal data transferred outside of the Philippines?                                                                                                    |
  | Is there any Data Sharing Agreements with other parties?                                                                                                    |
  | Name of PIC                                                                                                                                                 |
  | Is the system a publicly facing online mobile or web-based application?                                                                                     |
  | Is the system External and/or Internal facing?                                                                                                              |
  | Is there any notification regarding any automated decision-making operation?                                                                                |
  | Lawful basis of processing personal data                                                                                                                    |
  | Other relevant information pertaining to specified lawful basis:                                                                                            |
  | Is consent used as the basis for processing?                                                                                                                |
  | Consent form or any other proof of obtaining consent?                                                                                                       |
  | Retention period for the data processed                                                                                                                     |
  | Methods and logic utilized for automated processing                                                                                                         |
  | Possible decisions relating to the data subject based on the processed data, particularly if they would significantly affect his or her rights and freedoms |
  | &nbsp;                                                                                                                                                      |
  | Consolidated DPS:                                                                                                                                           |
  | Status                                                                                                                                                      |
  | Date of registration:                                                                                                                                       |


**Behavior**:

- Multi-value cells join with `next line` and render as bullet list.
- Each cell editable; edits stored in `pia.ropaOverrides[fieldKey]` (does not mutate Phase 2 source). "Reset to source" link per cell.
- "Configurable export" — checkbox column toggles inclusion.
- Export options: **PDF, XLSX** (using `exceljs`, preserving a template if present) and **CSV**.

## 11. Action Items & Email Generator (lightweight wire-up)

Existing `EmailGenerator` page extended with:

- "Source" radio: Transcript / DRL / PIA.
- When PIA is selected → pull action items (from transcripts) and DRL items already linked.
- Template selector: **Action Item Email**, **DRL Request Email**.
- Generated body uses template fills with engagement/PIA/DPS IDs.

Action items list in `UploadTranscript` becomes editable + assignable (assignee dropdown from engagement stakeholders).

## 12. Linking & traceability (cross-cutting)

Every record carries `engagementId`, `dpsId` (= `pia.phase2.dpsName` slug, persisted on first save), `piaId`. ROPA / NPC-RS / Email outputs reference these IDs in a footer line so outputs trace back to source.

---

## Technical details

**Files to add**

- `src/components/pia/Phase4SignOff.tsx`
- `src/components/pia/RopaTable.tsx`, `NpcRsTable.tsx`
- `src/lib/pia/ropaMap.ts`
- `src/lib/pia/migrate.ts`
- `src/pages/RopaGenerator.tsx`

**Files to edit**

- `src/lib/pia/schema.ts` — extend `Phase1.desc` shape, add `phase4`, `consolidatedComponents`, `ropaOverrides`.
- `src/lib/pia/store.ts` — call `migratePia` on load; seed default stakeholders; default sign-off.
- `src/lib/pia/templates.ts` — drop `"N/A"`, update Q5 options; tooltip text per field.
- `src/lib/pia/risk.ts` — 4×4 matrix + bucket thresholds.
- `src/components/pia/Phase1Form.tsx` — full rebuild (structured form + tooltips).
- `src/components/pia/Phase2Form.tsx` — wiring rules (PIP visibility, dropdown derivations, disclosure gating, repositories column rename).
- `src/components/pia/Phase3Form.tsx` + `ChecklistRow.tsx` — 1–4 scales, tooltips.
- `src/pages/PiaWorkspace.tsx` — tab hide logic, consolidated-required field, submit toast, sign-off tab.
- `src/pages/EmailGenerator.tsx` — source switch + templates.
- `src/App.tsx` — add `/ropa` and `/ropa/:piaId` routes.

**Persistence**: continues to use `localStorage` (`pa_engagements`, `pa_pias`). Migration on read means no data loss.

**Out of scope (this round)**: external client portal, real-time multi-user sync, file upload backend (uploads stored as base64 in localStorage with a 1 MB guard).

Approve to implement, or tell me which sections to drop/defer.