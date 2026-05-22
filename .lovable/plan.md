# Implementation Plan

Grouped by area so you can see scope at a glance. Everything below is frontend (localStorage-backed) unless noted — matches the current app's pattern.

---

## 1. Admin Settings — "View As" + Tooltip Manager

**Settings page (Admin only)** gets two new sections:

### a. View-As / Role Visibility

- Selector: Intern · Preparer/Associate · Lead/Supervisor · Approver/Manager · Admin
- For the selected role, show a checklist of every module/sub-tab (sourced from `AppSidebar` route list).
- Save → `pa_role_visibility` map `{ role: { routePath: boolean } }`.
- "Preview as this role" button → temporarily sets `pa_view_as` so the sidebar/routes filter accordingly until cleared.
- `AppSidebar` + `ProtectedRoute` read this map to hide nav items + 403 hidden routes.

### b. Tooltip Manager (system-wide)

- New page `/admin/tooltips` replacing the current limited PIA-only configurator.
- Tree view: Module → Screen → Field/Content key.
- Each row: toggle "Show (i) icon" + editable short description text + Apply / Cancel per row, plus global Apply/Cancel bar.
- Saves to existing `pa_tooltip_overrides` (extended schema: `{ key: { enabled, text } }`).
- Build a tiny `<InfoTip tooltipKey="..."/>` component used app-wide so any field can opt into admin-controlled tooltips. Retrofit Phase 1/2/3 PIA, PRADAR, TSA, DRL fields first.
- Add a **tooltip key registry** that covers every module at baseline (even if empty), so admin can configure anything immediately.

---

## 2. Team Transcript Improvements

- **Clickable tags → deep link with highlight**: extend tags to store `{ type, targetRoute, targetId }`. Clicking navigates to e.g. `/pia/PIA-123?highlight=phase2.dpsName`. Target screens read `?highlight=` and add a ring/box animation around the matching row/field for ~3s. Add an **Evidence Drawer** (or panel) that can open the referenced artifact and highlight the exact line/time segment.
- **Transcript preview modal**: click filename → modal with rendered text (.txt/.md) or PDF iframe; footer actions: Edit (rename/retag, Edit transcript content (inline text editor) before processing + save edited version), View (full screen), Delete (confirm), Download.

---

## 3. ROPA / NPC-RS Table UX

- **Drag-to-resize columns**: add a resize handle on each `<th>` (mouse + touch). Persist widths via existing `ropaCompilation.ts` `width` field.
- **Header filters**: each header gets a funnel icon → popover listing unique values in that column with checkboxes + search; multi-select filters AND-combined across columns.
- **Exports**: replace "Download CSV" with split button → Excel (`xlsx`) / PDF (`jspdf-autotable`) / CSV.

---

## 4. PIA Module Restructure

- Rename sidebar entry **"PIA Library" → "PIA"**.
- Convert `/pia` into a tabbed shell with tabs:
`Summary · Library · RoPA · NPC-RS · DRL · References`
  - **Summary**: pulls from `analytics/executiveSummary` (PIA-scoped KPIs).
  - **Library**: current `PIALibrary` table.
  - **RoPA / NPC-RS**: existing generators embedded.
  - **DRL**: inline `DrlInlinePanel` filtered to PIA category.
  - **References**: NPC Circular 2022-01 + internal docs list.

---

## 5. PRADAR Restructure

Tabs at top of `/pradar`:
`Scoreboard · Working File · Rating Guide · DRL · References`

- Move existing maturity scoreboard into Scoreboard tab.
- Working File = current collapsible PMP/Sub-domain/Privacy Domain control list.
- Rating Guide = the 4 compliance bands (1.0–4.0) with descriptions.
- DRL = inline DRL panel filtered to PRADAR.
- References = NPC issuances, ISO 27701, etc.

---

## 6. Analytics Hub — TSA section

Render two tables per the spec:

**Summary** — `Domain | High | Low | Medium` (counts of risk ratings).

**Risk Assessment** — `No | Questionnaire | Overall Risk Rating | Org-wide¹ | Specific/Standalone²` with the 4 standard questions + 6 sub-items under Q1 (a–f).

Then mirror each module's analytics block into that module's **Summary** tab (PIA, PRADAR, TSA, Privacy Notice, Manuals, Physical Inspection).

---

## 7. DRL / IRL

- **Attachment column**: replace text field with paperclip icon button → opens file picker (multi-file). Show pill badges per file with remove + download; store as base64 in localStorage (mock backend).
- **Export menu**: Excel / PDF / **ZIP** (zips the DRL spreadsheet + every attachment via `jszip`).

---

## 8. Manuals & Outputs

- Below the manuals table, when a row is selected, show a **Sections panel** specific to that manual:
  - Privacy Manual → existing sections
  - Data Security Policy → its own sections list
  - CCTV Policy, BCP, Retention, Incident Response, etc. → each gets a section template in `src/lib/templates/manualSections.ts`.

---

## 9. Physical Inspection

- Load checklist rows from the existing template repository (`src/lib/templates/...`) instead of the small seed.
- Generate ~6 sample inspection photos via `imagegen` (server room, CCTV, locked cabinet, badge reader, fire extinguisher, clean desk) and attach to seed items.
- **Album tab**: grid gallery + toggle for **Slideshow** (auto-advancing lightbox) or **Flipbook** (use `react-pageflip`).

---

## 10. Cross-cutting: Export buttons

Audit every "Download CSV" in the app (PIA Library, ROPA, NPC-RS, PRADAR, DRL, TSA, Inspection, Analytics, Exec Summary) and convert to a real working dropdown: Excel (`xlsx`) / PDF (`jspdf` + `jspdf-autotable`) / CSV where each format actually produces the right file.

---

## Technical Notes

- New deps: `jspdf`, `jspdf-autotable`, `jszip`, `react-pageflip`. `xlsx` already present.
- New files (high-level):
  - `src/lib/admin/roleVisibility.ts`
  - `src/lib/admin/tooltipRegistry.ts` (key catalog)
  - `src/components/InfoTip.tsx`
  - `src/components/ResizableTh.tsx`, `src/components/ColumnFilter.tsx`
  - `src/components/ExportMenu.tsx` (Excel/PDF/CSV/ZIP)
  - `src/components/TranscriptPreviewModal.tsx`
  - `src/lib/templates/manualSections.ts`
  - `src/pages/admin/ViewAsSettings.tsx`
  - `src/pages/admin/TooltipManager.tsx` (replaces current configurator)
- Modified pages: `Settings`, `AppSidebar`, `ProtectedRoute`, `PIALibrary` → `Pia` tabbed shell, `PradarChecklist`, `AnalyticsHub`, `DrlGenerator`, `ManualsDeliverables`, `PhysicalInspection`, `UploadTranscript`, `RopaGenerator`, `RopaPreview`.

---

## Suggested build order

1. Admin Settings (View-As + Tooltip Manager) — unblocks you for the rest.
2. PIA + PRADAR tab restructures (biggest navigation change).
3. ROPA/NPC-RS resize + filter + export.
4. DRL attachments + ZIP export.
5. Transcript deep-link + preview modal.
6. Analytics TSA tables + per-module Summary mirroring.
7. Manuals sections + Physical Inspection checklist/album.
8. Export-button sweep.

Want me to proceed with all of it in that order, or trim/reprioritize first?