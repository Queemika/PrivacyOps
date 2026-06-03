## Transcript Module Enhancement Plan

Scope is the Upload Transcript flow plus downstream output previews. Implementation stays client-side (mock store + existing anonymizer) to match the rest of the prototype — no new backend tables unless you ask.

### 1. Upload flow — preview before processing
Refactor `src/pages/UploadTranscript.tsx`:
- After file pick, parse file into editable text and open a new `PreProcessModal` (extends `TranscriptPreviewModal`) showing raw content.
- Modal actions: **Edit** (inline textarea), **Cancel** (discard), **Process** (run anonymize + speaker ID pipeline), **Reprocess** (visible after Edit, re-runs pipeline on edited text).
- Only after Process does the upload land in `pa_uploads` / team list.

### 2. Validation flow (review + supervisor sign-off)
Add a status field to `UploadRecord`:
```
status: "draft" | "pending_review" | "validated"
reviewedBy?: string; validatedBy?: string; validatedAt?: string
```
- New uploads default to `pending_review`.
- Add a **Validation panel** card on the upload detail/preview with two buttons: "Mark reviewed" (any user) and "Validate as supervisor" (gated by `user.role` includes `supervisor`/`manager`/`admin` — already in `roles/store`).
- The downstream "Process pipeline" card and all "Run" actions are disabled with a tooltip ("Awaiting supervisor validation") until `status === "validated"`.
- Team transcripts table gets a Status chip column.

### 3. AI enhancements
- Extend `src/lib/anonymize.ts` with `identifySpeakers()` — already maps speakers to `[PERSON_n]`; add a parallel `Speaker N` rendering and store `speakers: { id, label, lineCount }[]` on the record.
- Add `transcriptionLanguage: "EN" | "FIL" | "Taglish"` selector next to anonymization mode. Taglish mode passes a hint string and applies a light Taglish dictionary pass (mock — boosts retention of common Tagalog particles `po, opo, kasi, talaga, naman` so they aren't dropped as noise). Document this is a heuristic, not a real ASR call.
- Editable transcript state persists across the pre-process modal, the validation step, and re-opening from the team list (save back to `pa_uploads`).

### 4. Output mapping previews
The pipeline list becomes a two-pane UX: pick outputs on the left, a **Preview** panel renders on the right before committing.

| Output | Preview component |
|---|---|
| PIA | `PiaExtractionPreview` — runs existing PIA seed/extraction logic and shows auto-filled Phase 1 fields (purpose, data categories, retention) with field-level source quotes |
| Tech Security | `TsaImpactPreview` — uses `lib/tsa/autofill.ts` `suggestFromTranscript()` and lists affected controls + suggested status |
| DRL | `DrlExtractionPreview` — extracts action items as a DRL table (requirement, owner, due) |
| Email | `EmailDraftPreview` — composes subject + body with transcript summary + DRL bullet list |

Each preview has **Confirm & Send to Module** (current behavior) and **Discard**.

### 5. Pixie data-handling answers
Add a Pixie quick-reply / hint in `src/lib/pixieHints.ts` and wire a "Data handling" chip on the Upload page that opens Pixie with a pre-filled question. Pixie response (server-side prompt addition in `pixie-chat`) lists per transcript:
- Storage location: browser `localStorage` key `pa_uploads` (prototype) + scoped to your workspace user.
- Anonymization status: pulled from the record's `anonMode` and `stats` (e.g., "Strict, 3 persons, 2 emails masked").
- Retention + who can access (validators).
Implemented as a small `transcriptDataLineage(uploadId)` helper Pixie can be told to call via a system-prompt addendum.

### Files to touch
- `src/pages/UploadTranscript.tsx` (flow rewrite)
- `src/components/TranscriptPreviewModal.tsx` (add pre-process mode + actions)
- new `src/components/transcript/PreProcessModal.tsx`, `ValidationPanel.tsx`, `OutputPreviewPane.tsx` and 4 preview subcomponents
- `src/lib/anonymize.ts` (speakers + Taglish hint)
- `src/lib/teamUploadsStore.ts` + new fields on `UploadRecord` (status, validators, language, speakers)
- `src/lib/pixieHints.ts` and `supabase/functions/pixie-chat/index.ts` (data-lineage system prompt addendum)
- `src/lib/roles/store.ts` (read-only — role check helper)

### Out of scope (confirm if you want them in)
- Real ASR / Whisper integration for Taglish (currently mocked)
- Persisting transcripts to Supabase instead of localStorage
- Email actually being sent (still draft only)

Reply "go" to build, or tell me which sections to trim/expand.
