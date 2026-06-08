# Progress Module

A new top-level module that aggregates completion across PIA, PRADAR, TSA, Physical Inspection, and Manuals, plus generates a presentation deck and meeting minutes.

## 1. Route & Navigation
- New route `/progress` registered in `src/App.tsx`.
- New sidebar entry "Progress" in `AppSidebar.tsx` (icon: `Gauge` or `TrendingUp`).
- Tabs inside the page (using existing `Tabs` pattern): **Dashboard**, **MOM**, **Deck**, **Config**.

## 2. Progress Calculation Layer
New file `src/lib/progress/calc.ts`:
- `getModuleProgress(moduleId)` returns `{ percent, completed, total, details[] }` for each module by reading the existing stores:
  - **PIA** — % of phase fields populated across active PIAs (`pia/store.ts`).
  - **PRADAR** — rated controls ÷ total (`pradarModel.ts` `overallMaturity` denominator) and avg rating → maturity %.
  - **TSA** — controls with non-empty `status` ÷ total (from `tsa/autofill.ts` / existing TSA store).
  - **Physical Inspection** — answered questions ÷ total (`inspections/store.ts`).
  - **Manuals** — sections completed (`templates/manualSections.ts`).
- `getOverallProgress()` applies user-configurable weights.
- Pure functions, no React, easy to unit test.

`src/lib/progress/config.ts`:
- LocalStorage-persisted `ProgressConfig { weights: Record<ModuleId, number>; rules: Record<ModuleId, "fields"|"status"|"hybrid"> }`.
- Default weights 20% each, normalized when saving.

## 3. Progress Dashboard (`src/pages/Progress.tsx`)
- 5 module cards using `StatTile`-style layout — each shows percent, mini progress bar (`Progress` component), completed/total, link to module.
- Overall progress hero card at top with large progress bar + weighted overall %.
- Lightweight refresh button (recomputes from stores).

## 4. Dashboard Page Integration
- Add a compact "Overall Progress" bar to `pages/Dashboard.tsx` (one row, calls `getOverallProgress()`), linking to `/progress`.

## 5. MOM (Minutes of Meeting)
`src/lib/mom/store.ts` — `MomRecord { id, transcriptId, title, date, attendees[], agenda[], decisions[], actionItems[], notes, createdAt }`, localStorage.

`src/lib/mom/generate.ts` — `generateMomFromTranscript(text)` heuristic extractor:
- Title from first non-empty line.
- Attendees from speaker labels (reuse `relabelAsSpeakers` output).
- Action items: lines matching `/action|todo|will|assign/i`.
- Decisions: lines matching `/agreed|decided|approved/i`.
- Returns a draft `MomRecord`.

UI inside Progress tab "MOM":
- Picker of existing transcripts (from `teamUploadsStore`).
- "Generate" → editable form (Inputs for title/date/attendees; Textareas for agenda/decisions/actions/notes).
- Save / Update buttons; list of saved MOMs below.

## 6. Deck Generator
`src/lib/progress/deck.ts` — builds a structured `DeckSpec` (array of slides):
1. Cover — client, date, overall %.
2. Module progress (one slide per module, bar + key gaps).
3. DRL summary — pulled from `drl/store.ts` (open vs received counts, table of pending).
4. MOM highlights — latest MOM decisions + action items.
5. Deliverables — manuals & PIAs ready, links.
6. Next steps — top open action items.

Rendering: HTML deck (16:9 slides in a printable container) reusing the project's existing print/export pattern. Add "Export PDF" via `window.print()` with `@media print` rules; no new heavy dependency. (Pptx export deferred unless requested.)

UI in tab "Deck":
- Options panel (toggle which sections to include, date range).
- "Generate Preview" → renders slides inline.
- "Print / Save as PDF" button.

## 7. Config Panel (tab "Config")
- Sliders (0–100) per module weight with live normalization indicator.
- Radio per module for calculation rule (`fields` / `status` / `hybrid`).
- Reset to defaults button.
- Persists via `progress/config.ts`; dashboard reactively recomputes.

## Files
**New:**
- `src/pages/Progress.tsx`
- `src/lib/progress/calc.ts`
- `src/lib/progress/config.ts`
- `src/lib/progress/deck.ts`
- `src/lib/mom/store.ts`
- `src/lib/mom/generate.ts`
- `src/components/progress/ModuleProgressCard.tsx`
- `src/components/progress/DeckPreview.tsx`
- `src/components/progress/MomEditor.tsx`

**Edited:**
- `src/App.tsx` — register `/progress`.
- `src/components/AppSidebar.tsx` — nav entry.
- `src/pages/Dashboard.tsx` — overall progress strip.

## Out of Scope
- Real PPTX export (HTML print-to-PDF for now).
- Backend persistence (everything localStorage, matching existing modules).
- Live collaborative MOM editing.

## Open Question
Do you want the deck exported as **PPTX** (requires `pptxgenjs`, ~200kb dep) or is **print-to-PDF** sufficient for v1?
