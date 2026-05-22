# Continuation Plan

Foundation (admin View-As, Tooltip Manager, ExportMenu, InfoTip, TranscriptPreviewModal, manualSections, deps) is done. Continuing in the original build order.

## Step 2 — PIA + PRADAR tab restructure

`**/pia` shell** (rename sidebar entry already done):

- Wrap `PIALibrary` in a tabbed shell: `Summary · Library · RoPA · NPC-RS · DRL · References`.
- Summary: pull PIA-scoped KPIs from `analytics/executiveSummary`.
- Library: existing `PIALibrary` table.
- RoPA / NPC-RS: embed existing generators.
- DRL: `DrlInlinePanel` filtered to `pia` category.
- References: NPC Circular 2022-01 + internal links.

`**/pradar` shell**: `Scoreboard · Working File · Rating Guide · DRL · References`. Move existing scoreboard + control list into tabs; add Rating Guide content (4 bands) + DRL panel + references.

## Step 3 — ROPA / NPC-RS table UX

- New `ResizableTh.tsx` (mouse + touch drag) persisting width via `ropaCompilation.ts`.
- New `ColumnFilter.tsx` (funnel popover, unique values, multi-select AND).
- Replace "Download CSV" with `<ExportMenu>` (Excel/PDF/CSV) in `RopaGenerator` + `RopaPreview`.

## Step 4 — DRL attachments + ZIP export

- Extend `drl/store.ts`: `attachments: { name, mime, dataUrl }[]` (keep `attachment` for back-compat).
- In `DrlGenerator` + `DrlInlinePanel`: paperclip cell → multi-file picker, base64 storage, badge pills with remove/download.
- Toolbar: `<ExportMenu>` with ZIP option (sheet + every file via `jszip`).

## Step 5 — Transcript deep-link + preview modal

- Extend tag schema in `teamUploadsStore.ts`: `{`
    `type,`
    `targetRoute,`
    `targetId,`
    `fieldKey?,`
    `evidenceType?: "file" | "email" | "row" | "field",`
    `evidenceId?: string,`
    `anchor?: string | number // line number / timestamp`
  `}`.
- Tag click → `navigate(targetRoute + ?highlight=...)`.
- Add a tiny `useHighlight()` hook used by PIA/ROPA/PRADAR rows to add `ring` animation for 3s.
- Wire `TranscriptPreviewModal` into `UploadTranscript`: click filename → modal with text/PDF preview + Edit (edit transcript text itself (inline editor))/ View / Delete / Download.

## Step 6 — Analytics Hub TSA tables + per-module Summary mirroring

- In `AnalyticsHub.tsx` add:
  - TSA Summary table (`Domain | High | Medium | Low`).
  - Risk Assessment table (No / Questionnaire / Overall / Org-wide¹ / Specific² with the 4 standard Qs + a–f sub-items).
- Reuse the same blocks inside each module's new **Summary** tab (PIA, PRADAR, TSA, Privacy Notice, Manuals, Physical Inspection).

## Step 7 — Manuals + Physical Inspection

**Manuals**: when a row is selected in `ManualsDeliverables`, show a Sections panel rendered from `templates/manualSections.ts` for that manual type (Privacy, Data Security, CCTV, BCP, Retention, Incident Response, etc.).

**Physical Inspection**:

- Load checklist from full template (extend `inspections/store.ts` seed).
- Generate ~6 inspection photos via `imagegen` (server room, CCTV, locked cabinet, badge reader, fire extinguisher, clean desk).
- Album tab: grid + toggle Slideshow (lightbox) or Flipbook (`react-pageflip`).

## Step 8 — Export-button sweep

Audit every "Download CSV" (PIA Library, ROPA, NPC-RS, PRADAR, DRL, TSA, Inspection, Analytics, Exec Summary) → swap for `<ExportMenu>` so Excel/PDF/CSV/ZIP each produce real files.

---

### Suggested execution this round

I'll do **Steps 2 → 5** in this turn (biggest navigation + workflow wins) and leave Steps 6–8 for the next round to keep the diff reviewable. Say the word and I'll start, or tell me to reshuffle.