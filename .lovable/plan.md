## Scope

Nine focused changes across PIA, Transcripts, Library, Summary, References (admin), date fields, and Physical Inspection. Everything stays frontend/localStorage — no backend changes.

---

### 1. PIA shell — remove NPC-RS tab

`src/pages/PiaShell.tsx`: drop the `<TabsTrigger value="npc">` and its `TabsContent` (it currently renders the same `RopaGenerator` as Compilation).

### 2. Upload Transcript — hide "Team transcripts" section

`src/pages/UploadTranscript.tsx`: When a **new transcript is being uploaded or processed**, the **Team Transcripts section should:**

- Automatically **collapse OR minimize**
- OR be hidden behind a **collapsible panel/tab**

### 3. Link-to-existing-PIA uses latest template

Currently `handleLinkExisting` just navigates with `piaId=...` and does not normalize the target PIA against the latest schema (Phase 1 desc + threshold + stakeholders, Phase 2 data mapping, Phase 3 principles/rights/security/cross-border). Add a `normalizePiaToLatestTemplate(pia)` helper in `src/lib/pia/store.ts` that:

- Ensures every Phase 1 desc field exists (fills missing keys with defaults from `templates.ts`).
- Ensures threshold answers exist for every current threshold key.
- Ensures Phase 2 has all rows arrays (collection/use/disclosure/repositories/categories) and all field keys.
- Ensures Phase 3 has principles, rights, organizational, physical, technical, crossBorder records seeded with the current checklist keys (blank answers).
- Calls `upsertPia` and returns the upgraded PIA.

Call it from `handleLinkExisting` before navigation. Also call it on `getPia` reads in `PiaWorkspace` so legacy PIAs are auto-upgraded on open.

### 4. PIA Library — remove "Load samples" and "Compile" buttons

`src/pages/PIALibrary.tsx`: drop those two buttons from `actions` and remove the now-unused `loadSamples` handler + checkbox selection logic if no longer referenced (keep checkboxes if other features use them — they don't, so remove the selection column too for a cleaner table).

### 5. PIA Summary tab = full Executive Summary + link to Analytics

`src/pages/PiaShell.tsx`: replace the small `PiaSummary` inline component with `<ExecutiveSummary />` rendered inside the Summary tab, plus a prominent "Open Analytics Hub →" button at the top linking to `/analytics`.

### 6. Admin-editable References (new system)

**New store** `src/lib/references/store.ts`:

```ts
type RefBlockType = "link" | "paragraph" | "table" | "blog";
interface RefBlock { id; type; title?; body?; url?; rows?: string[][]; headers?: string[]; updatedAt }
interface ReferenceSet { moduleId: string; blocks: RefBlock[] }
```

localStorage key `pa_references`. Seed with current hardcoded refs for each module.

**New component** `src/components/ReferencesPanel.tsx`: read-only render for all users; if `role === "admin"` (from `useAuth`), show edit toolbar: Add link / Add paragraph / Add table / Add blog post / Paste content (textarea → saved as paragraph; user-side "Format &  Clean" is just a no-op formatter that trims whitespace and normalizes line breaks — clarified as a label only since no AI call exists here, and optionally add “Convert to blog blocks” parsing. If later user want true rewriting, that would require Lovable AI/backend capability.).

**Wire into modules** (replace existing References tabs/sections):

- PIA: `PiaShell` refs tab → `<ReferencesPanel moduleId="pia" />`
- PRADAR: `PradarShell` (find refs tab) → `moduleId="pradar"`
- Tech Security: `TechnicalSecurityAssessment` → add/replace refs tab `moduleId="tsa"`
- Physical Inspection: add new "References" tab `moduleId="physical"`
- Privacy Notice: add refs tab `moduleId="privacyNotice"`
- Manuals & Outputs (`ManualsDeliverables`): add new "References" tab `moduleId="manuals"`

### 7. Date Requested / Date Received → date pickers

Search all tables for these text inputs. Replace `<Input type="text">` (or untyped) with shadcn date picker using `<Popover>` + `<Calendar>` per project convention. Files likely affected:

- `src/components/DrlInlinePanel.tsx`, `src/pages/DrlGenerator.tsx`, `src/components/DrlAttachmentCell.tsx`
- Any PRADAR/Tech Sec/Physical Inspection tables containing these columns.
Create a small reusable `<DateCell value onChange />` wrapper to keep tables tidy.

### 8. Physical Inspection rework

`src/pages/PhysicalInspection.tsx` + `src/lib/inspections/store.ts`:

- Remove the "Overall view" option from the area selector.
- Replace single-area inspection model with multi-area working file. Default areas (created on first load if empty, editable/deletable):
  - Management Information Systems, Human Resources, Administration, Client-Facing Services, Records Management, Legal Compliance, Facilities and Security, Third-Party and Procurement, Accounting and Finance, Executive, DPO Oversight.
- Working File tab shows each area as a `<Collapsible>` section. Each holds its own checklist table with columns:
`No. | Items for Checking / Question | Compliance Status | Remarks | Observations | Recommendations`
(Compliance Status = Yes/No/N-A select; others are textareas.)
- Per-area controls: rename, delete, add row, remove row.
- Summary tab tiles aggregate across all areas + add a per-area breakdown table (counts of Yes/No/N-A).
- Store schema migrates: `Inspection` becomes `{ areas: InspectionArea[] }` keyed by inspection id, or simpler — flatten so each saved record IS an area, and add a separate "engagement" wrapper that lists areas. Simpler: drop the existing single-inspection picker and store one global `InspectionArea[]` list under `pa_inspection_areas`. Row schema:
`{ id, no, question, status: YNA, remarks, observation, recommendation }`.
- Migration: if old `pa_inspections` exists and `pa_inspection_areas` is empty, convert each old inspection to one area (preserve rows where possible by mapping `response→remarks`, leaving `recommendation` blank).

### 9. Verification

After edits: typecheck via build, click through PIA tabs, transcript flow, library, inspection working file, and one References panel as admin vs non-admin.

---

## Technical notes

- Auth role: `useAuth().user?.role === "admin"` (confirm field name in `auth-context-base.ts` — adjust if it uses `role`/`isAdmin`).
- "Let Lovable fix it" inside Reference editor: no AI call; just a client-side formatter (trim, collapse blank lines, smart-paragraph splitting). Labeled clearly so users know it's lightweight.
- All localStorage migrations are guarded so existing users don't lose data.

## Out of scope

- No backend, no edge functions.
- No real LLM-assisted reference rewriting (would need Lovable AI; can add later if you want).
- No changes to PRADAR / Tech Sec / Privacy Notice business logic beyond inserting a References tab.

Shall I proceed with all 9 items, or trim?