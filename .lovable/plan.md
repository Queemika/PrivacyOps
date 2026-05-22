# Plan — Full UI + Feature Overhaul (Phases A → B → C)

Implements all outstanding work in one pass. Each phase is committed sequentially; nothing waits between phases.

---

## Phase A — Visual Refresh

Goal: lighter aesthetic, consistent module chrome, finalized sidebar/back/Pixie.

- **Tokens (`src/index.css`, `tailwind.config.ts`)**
  - Light app surface `--background: 210 20% 98%` (slate-50 feel), card `0 0% 100%`, border softened.
  - New tile accents: `tile-blue`, `tile-green`, `tile-amber`, `tile-violet`, `tile-rose` (HSL pairs for bg + fg).
- **Shared components (new)**
  - `src/components/ui/StatTile.tsx` — colored KPI card (icon, label, value, delta, accent prop).
  - `src/components/ui/SectionTabs.tsx` — underline tab bar (active = accent underline + bold), used across modules.
  - `src/components/ui/PageShell.tsx` — title, subtitle, actions slot, optional tabs.
  - `src/components/BackButton.tsx` — ghost chevron, consistent placement.
- **AppLayout / AppSidebar**
  - Replace ad-hoc back link with `BackButton`.
  - Sidebar: logo = home link (already), active state = left accent bar + tinted bg, settings/profile pinned bottom (already), tighten spacing.
- **Login / Engagement Manager**
  - Reuse new tokens; engagement cards adopt `StatTile` accent palette.

## Phase B — Module Content & Templates

Goal: every module matches the screenshots, all uploaded templates digitized as seed data.

- **Templates (`src/lib/templates/`)** — new folder
  - `privacyManual.ts` — sections, default clauses (editable).
  - `cctvNotice.ts` — fields (location, purpose, retention, contact).
  - `techStack.ts` — categories/rows for Tech Security baseline.
  - `privacyNotice.ts` — already partly modeled; consolidate here.
  - `ropaTemplate.ts` / `npcRsTemplate.ts` — header maps (already in `ropaMap.ts`, re-export).
- **Module pages rebuilt with `PageShell` + `SectionTabs` + `StatTile`**
  - `Dashboard.tsx` — KPI tiles (PIAs, Open Risks, Action Items, Compliance %) + recent activity + quick links.
  - `CompilationBuilder.tsx` — left checklist of deliverables, right preview pane.
  - `AnalyticsHub.tsx` — tiles + simple charts (recharts) on PIA risk distribution, status, lifecycle.
  - `DrlGenerator.tsx` — tabs: Requests · Action Items · Templates.
  - `PradarChecklist.tsx` — tabs per PRADAR section; progress bar.
  - `TechnicalSecurityAssessment.tsx` — seeded from `techStack.ts`; remarks editable.
  - `PhysicalInspection.tsx` — CCTV inventory + walkthrough checklist.
  - `PrivacyNoticeReview.tsx` — template diff view (seed vs current).
  - `ManualsDeliverables.tsx` — Privacy Manual sections from `privacyManual.ts` with section editor.
  - `EmailGenerator.tsx` — source switch (Transcript/DRL/PIA) + template picker.

## Phase C — Feature Wiring

Goal: connect modules, deliver admin tools, upgrade Pixie.

- **Transcript pipeline (`UploadTranscript.tsx` + `actionsStore.ts`)**
  - Replace single "Process PIA" button with checklist:
    - [ ] Generate / link PIA(s)
    - [ ] Push Tech Security remarks
    - [ ] Create DRL items
    - [ ] Extract action items
  - Each step writes to its store and links back via `engagementId` / `piaId`.
- **PIA Library (`PIALibrary.tsx`)**
  - Status pipeline column: Draft → In Review → Approved → Final (color chips).
  - `.xlsx` upload (parses Phase 1/2 rows via `xlsx` lib, creates PIA draft).
  - Rows: PIA name is the link (no separate "Open" button).
- **Admin tools (new pages)**
  - `src/pages/admin/TooltipConfigurator.tsx` — edit tooltip text for Phase 1/2/3 fields; overrides stored in `localStorage` under `pa_tooltip_overrides`; consumed via new `useTooltip(key)` hook.
  - `src/pages/admin/ResetData.tsx` — reset by module / engagement / system; confirmation dialogs.
  - `ConsistencyChecker.tsx` — already a page; finish wiring to flag mismatches between Phase 1 ↔ Phase 2 ↔ ROPA.
- **Pixie (`Pixie.tsx`)**
  - Header toggles: Language (EN / FIL / Taglish) and Source (PH DPA / GDPR / CCPA).
  - Wired to Lovable AI Gateway (`google/gemini-2.5-flash`) via new edge function `supabase/functions/pixie-chat/index.ts` (verify_jwt = false). Prompt injects selected language + regulatory source.
- **Help / FAQ (`src/pages/Help.tsx`, new)**
  - Static FAQ accordion + "Email admin" form + Pixie launch CTA. Add sidebar link.
- **Settings (`src/pages/Settings.tsx`, refresh)**
  - Theme switch (light/dark via `next-themes` already wired through `index.css`).
  - Admin section gated by role flag (demo: localStorage `pa_role=admin`).

## Technical details

- **Persistence**: continues on `localStorage` for PIA/engagement/actions/tooltips; Pixie chat is stateless. No schema migrations required for this round.
- **New deps**: `xlsx` (PIA import), `recharts` (already present).
- **Edge function**: `pixie-chat` — POST `{ messages, language, source }` → streams Gemini response. Uses `LOVABLE_API_KEY` (already set).
- **Routing (`src/App.tsx`)**: add `/help`, `/admin/tooltips`, `/admin/reset`.
- **Out of scope**: multi-user role enforcement, audit log viewer rebuild, real-time DB sync.

Implementation order: A → B → C, committed in that sequence; final pass verifies all routes render and back/home navigation works.
