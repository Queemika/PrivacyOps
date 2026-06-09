# PIA Logic Enhancements

Five connected behaviors across the PIA module. All scoped to PIA UI + small helpers; no schema/migration changes.

## 1. Risk Trigger — show Risk columns only on "No"

In `src/components/pia/ChecklistRow.tsx`:
- Treat `yn === "No"` as the risk trigger. When `Yes` or `N/A`, hide / disable Impact, Probability, Rating cells (render dashes), and clear stored impact/probability/rating on transition to non-"No".
- When switching to `No`, hydrate Impact/Probability from the seed defaults (`defaultImpact`, `defaultProbability`) if present, then auto-compute `rating`.
- Update `ChecklistHeader` to keep column layout stable (cells render muted placeholder when hidden, so the grid doesn't shift).

## 2. Admin-configurable answer options

New helper `src/lib/pia/answerConfig.ts` (localStorage `pia:answerOptions:v1`):
- Default set = `["Yes", "No", "N/A"]`.
- Optional per-section overrides (e.g., principles vs. rights) and optional custom validation rule per option (regex + message) that gates the `response` text field.
- `ChecklistRow` reads options via `getAnswerOptions(sectionLabel)` instead of hard-coded items, and shows the validation message under `response` when the rule fails.

Admin UI: add a new tab in `src/pages/Settings.tsx` ("PIA Answers") to edit the option list and validation rules. No backend changes.

## 3. DRL auto-triggers

Centralize trigger rules in `src/lib/pia/drlAutoTrigger.ts`:
| Source | Condition | DRL kind |
|---|---|---|
| Phase 1 – Project Context | On first save where `phase1.desc.supportingDocs` or `systemFunction` is non-empty, or when threshold T6/T10 = Yes | `SystemDesignDoc` ("System Design / TOR") |
| Phase 3 – Transparency (GP-T1, GP-T2) | answer = `No` | `PrivacyNoticeFull` |
| Phase 3 – Right to object (DSR-1, DSR-2, DSR-3) | answer = `No` | `ConsentForm` |

Implementation:
- Helper `ensureDrlItem(piaId, kind, label)` — dedupes by `(piaId, kind)` using a tag in `fields.piaId` + `fields.kind`, calls `addRow("pia", ...)` only if missing, returns existing otherwise.
- Hook into `Phase1Form` save effect (when first becoming non-empty) and `ChecklistRow` `onChange` (when yn flips to No for the trigger IDs).
- Toast: "DRL item auto-created — Privacy Notice" (suppress if already exists).

## 4. Output — attachments as Annex on export

In the PIA export path (today `src/pages/GeneratedPIA.tsx` + `src/lib/pradarExport.ts`-style helpers — confirm and reuse the PIA export flow):
- After the main document, append an **Annexes** section listing every DRL attachment linked to the PIA (`drlLinks` + scan rows where `category === "pia"` and `fields.piaId === pia.id`).
- For each attachment: render label "Annex A — {drl no} {title}" with file name; image MIME types embed inline, other MIMEs render as a download/print placeholder block referencing the file name.
- Print/PDF path uses the existing window-print pipeline (same approach as `DeckPreview`).

## 5. Cross-linking to TSA / Physical Inspection

- `src/components/pia/Phase3Form.tsx`: add a small header CTA on the Physical Security and Technical Security cards.
  - Physical Security → link `/inspection?piaId={piaId}` with label "Open in Physical Inspection".
  - Technical Security → link `/tsa?piaId={piaId}` with label "Open in TSA".
- Two-way: on `src/pages/PhysicalInspection.tsx` and `src/pages/TechnicalSecurityAssessment.tsx`, read `piaId` from query string and show a "Linked PIA" badge with a back-link to `/pia/{id}` (tab `p3`).
- Add the two new entries to `RelatedLinks` in `PiaWorkspace.tsx`.
- No data duplication — links only; status mirror is out of scope for this pass.

## Files

**New**
- `src/lib/pia/answerConfig.ts`
- `src/lib/pia/drlAutoTrigger.ts`

**Edited**
- `src/components/pia/ChecklistRow.tsx` (risk gating, configurable options, trigger hook)
- `src/components/pia/Phase1Form.tsx` (System Design DRL trigger)
- `src/components/pia/Phase3Form.tsx` (cross-link CTAs)
- `src/pages/PiaWorkspace.tsx` (RelatedLinks additions)
- `src/pages/Settings.tsx` (Admin tab for answer options)
- `src/pages/PhysicalInspection.tsx`, `src/pages/TechnicalSecurityAssessment.tsx` (PIA back-link)
- `src/pages/GeneratedPIA.tsx` (Annex section on export)

## Out of scope

- Editing PIA `schema.ts` or storage shape.
- Server-side validation or new Supabase tables.
- Auto-syncing TSA/Inspection findings into Phase 3 answers (links only).
