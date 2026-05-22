# Plan: Sample PIA Import + Module Overhaul

## 1. Import sample PIAs into the Library

Parse the 5 uploaded `.xlsx` files (University Information System, Birth/Marriage/Death, Feedback/Complaints/FOI, CHD Electronic Health Records, PWD Database) and seed them into the PIA store.

- Create `src/lib/pia/sampleSeeds.ts` containing the 5 PIAs converted to the existing `Pia` schema (Phase 1–4 fields populated from the spreadsheets).
- On `PIALibrary.tsx` first mount, if `loadPias()` is empty (or a `pia:seeded:v1` flag is unset), inject the seeds so RoPA, NPC-RS and Executive Summary have real data to aggregate.
- Add a "Load sample PIAs" button so the user can re-seed on demand.

## 2. PRADAR redesign (`PradarChecklist.tsx`)

Restructure into 4 tabs: **Scoreboard · Working File · DRL · Rating Guide & References**.

Working File becomes a 3-level collapsible (PMP Component → Sub-domain → Privacy Domain) with rows:

`Control Question | DRL No. & Proof | Attachment | DRL Status | Basis/Minimum Req (checklist) | Score | Gap | Action Item | Responsible Party | Timeline`

- Score auto-computes from checked/unchecked basis items using a configurable criteria (tooltip explains formula: `checked / total * weight`).
- Two-way link with DRL: row's DRL No./Status/Attachment read from `loadDrl()` PRADAR rows; editing here writes back via `updateRow`.
- "AI assist" button per row (stub, no backend call yet) → pre-checks basis items, fills Gap/Action/Responsible/Timeline placeholders, marks suggested status. Inline-editable afterward.
- Attachment preview: click attachment chip → opens dialog showing filename + (placeholder) highlighted region.
- Scoreboard: aggregate scores per PMP Component (existing logic, refreshed UI).
- Rating Guide tab: static markdown (criteria, score bands, NPC references).

New files: `src/lib/pradar/workingFile.ts` (groups + score calc), small `PradarRowEditor` component.

## 3. Physical Inspection (`PhysicalInspection.tsx`)

Tabs: **Summary · Working File · Album · DRL/IRL**.

- Top selector: Overall view / Per Department-Area dropdown / "Create new inspection" button.
- Working File columns: `No. | Question | Yes/No/NA | Response | Actual Observation | Attachment (photos)`.
- Upload checklist (.xlsx/.csv) → replaces/extends question list.
- Template seeded from admin config; rows fully editable; "Download" exports CSV.
- Album tab: grid of every photo attached across rows, click → opens row context.
- DRL/IRL tab embeds the existing DRL table filtered to `category = "actions"` tagged Physical Inspection.

Store: `src/lib/inspections/store.ts` (inspections keyed by department/area, photos as data-URLs in localStorage).

## 4. Technical Security Assessment

Add tabs: **Summary · Tech Stack · Working File · DRL/IRL** to existing page.

- Tech Stack tab: pre-seeded with the 24-row table provided (Domain/System/DPA Requirement/Status/Tool/Version/Managed By/Direct Access/AD Integrated/Remarks).
- Working File tab: `Domain | Component | Material (Material/Best Practice/Compensating) | Applicability | Status | Guidance | Tester | Remarks` — reflects relevant DRL rows.
- Summary tab: existing StatTiles.
- DRL/IRL tab: embedded DRL filtered to TSA category.
- Transcript autofill hook: when a transcript with `tags` includes "TSA", scan transcript text for system/component keywords → append to Remarks (stub matcher in `src/lib/tsa/autofill.ts`).

New seed file: `src/lib/templates/techStackFull.ts`.

## 5. Privacy Notice Review

Replace stub with full module. Tabs: **Summary · DRL · References**.

- Summary lists notices (CCTV / Full / Just-in-Time / Layered) per client with status chips.
- Clicking a notice opens working file editor with the four sections (Layered, Full, CCTV, DPO Contact) — each row: `Comply? checkbox | Description | Reason | Notes`.
- Type selector switches which sections are required.
- DRL tab: embedded DRL filtered to `notice` category.
- References tab: admin-configurable static list (uses `tooltipStore`-style config).

New files: `src/lib/privacyNotice/store.ts`, `src/lib/privacyNotice/template.ts` (the checklist from screenshot/text).

## 6. Manuals → "Manuals and Outputs"

Rename in sidebar + route label. Split into two sections:

- **Manuals**: existing table (`Manual/Policy | Type | Status | Last Updated | Version | Actions`).
- **Outputs**: collapsible per workable (PIA, PRADAR, TSA, Physical Inspection, DRL/IRL, RoPA/NPC-RS, Analytics) listing `File | Type | Status | Last Update | Version | Actions` with download/link actions wired to existing export functions where possible.

## 7. Audit Log

- New page `src/pages/AuditLog.tsx` already exists; flesh out with table reading from new `src/lib/auditLog.ts` (localStorage ring buffer).
- Add `logAction(event, meta)` helper; wire into key mutations (PIA save, DRL row change, PRADAR edit). Lightweight; not retrofitted everywhere.
- Route gated to Admin role (check `AuthContext`).

## 8. Settings (Admin)

Expand `Settings.tsx` with three sections:

- **Role-based look**: choose default landing/density per role (Intern, Preparer/Associate, Lead/Supervisor, Approver/Manager) — saved to `localStorage` key `pa_role_ux`.
- **Tooltips**: integrate existing `TooltipConfigurator` admin page inline — list all tooltips per module with add/remove/edit + global on/off toggle.
- **Tables & Fields**: list configurable tables (PRADAR working file, DRL columns, Physical Inspection template, Privacy Notice checklist, TSA tech stack) with "Lock" toggle per field/row. Lock state stored in `pa_table_locks`; consumed by editor components to disable inputs when locked.

## Technical notes

- All storage stays in `localStorage`; no DB migrations.
- Re-use `PageShell`, `SectionTabs`, `StatTile`, `DrlTable` patterns already established.
- Sidebar/router updates in `AppSidebar.tsx` + `App.tsx` for renamed Manuals and any new admin routes.
- Verify with `tsc --noEmit` at the end.