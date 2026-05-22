# Plan: Compilation Analytics + DRL/IRL Overhaul

## Scope
Three connected workstreams. Read-only derivations from existing PIA store; new editable headers/columns; new DRL stores per category.

---

## 1. ROPA / NPC-RS — Compilation across all PIAs

**Current:** Single-PIA editor (`RopaGenerator.tsx` keyed by `piaId`).
**New:** Always a compilation table. One row per PIA. Columns = ROPA/NPC fields.

- Remove "library picker → editor" flow. Route `/ropa` shows compiled table; `/ropa/:piaId` redirects to `/ropa` with that row scrolled into view.
- **Editable:** column header label, column width (drag or numeric input), included/excluded columns, row order. Persist to `localStorage` (`ropaCompilationConfig`).
- **Not editable inline:** cell values (derived from each PIA's Phase 2). Each cell shows value + small "Edit in PIA" link → navigates to `/pia/:id` at the relevant phase/field.
- Tabs: **ROPA** | **NPC-RS** (same compilation idea, different field set).
- Export buttons (CSV / JSON / Excel / PDF) export the full compilation matrix using current header labels/widths.
- Multi-select PIAs to include in export.

## 2. Executive Summary — derived analytics from Phase 2 & 3

Rebuild `ExecutiveSummary.tsx` to compute live aggregates from `loadPias()`.

**Controls:** PIA multi-select chips (default: all). All sections recompute on selection change.

**Sections (numbered as user spec):**
- **PIA Status** — table: PIA Type (Phase-1 only vs Full), DPS Status (New/Existing), Assessment Scope (Individual/Consolidated + member list)
- **01 Overview** — counts: # DPS, # Full PIA, # Phase-1
- **01.1 Data Processing System** — breakdown by Existing/New, Consolidated/Individual
- **02 Purpose / 03 Scope** — static template text (editable via tooltip configurator pattern)
- **03.1 Collect** — totals of PI / SPI / Privileged records (sum Phase 2 record counts)
- **03.1.1 Type of Personal Data** — split External / Internal / Both per data class
- **03.1.2 Legal Basis** — counts per PI basis & SPI basis enums
- **03.2 Use & Store** — repository completeness, retention completeness, electronic/physical/unspecified storage counts
- **03.3 Disclose** — sharing yes/no, DSA yes/no, cross-border yes/no
- **03.4 Retention** — distribution + avg days/years
- **03.5 Disposal** — disposal yes/no/N-A, electronic/physical/unspecified methods
- **06 Key Risks** — matrix from Phase 3 answers (Yes/No/N-A) across 4 domains (Gen Principles, DSR, Security, Cross-border) + top-5 per domain
- **07 Mitigation** — top-5 actions aggregated
- **08 Conclusion** — auto-fills risk band (High/Medium/Low) into template
- **09 Annexes A–G** — pivot tables, exportable

Each section: collapsible card; "Export section" button (CSV).

**Other Analytics tiles added to Analytics Hub:** PRADAR scoreboard, Privacy Notice compliance count, TSA OFI/Complied per domain, Physical Inspection OFI/Complied per area, Manuals status, DRL/IRL status. These link to their respective modules.

## 3. DRL / IRL — 5-tab module

Refactor `DrlGenerator.tsx` into tabbed workspace:

```
Tabs: [Tech Security] [PRADAR] [PIA] [Privacy Notice] [Action Items]
```

Each tab = editable table with category-specific columns. Shared row schema in `src/lib/drl/store.ts` with `category` discriminator. Auto-numbered `DRL No.` per category.

**Tab a — Tech Security:** Domain | System | Requirement | Status | Tool | Version | Managed By | Direct Access | AD Integrated | Remarks. Status drives auto-generation of:
- Guide Questions (Working File)
- DRL items (Open/Closed)
- IRL items — dedupe vs Guide Questions

**Tab b — PRADAR:** seeded with the 24 standard items from spec; columns: DRL No. | Proof of Compliance | Date Requested | Date Received (auto when Status=Completed) | Status | Remarks | Attachment. Mark items that are "co-listed" with Tech Security → if attachment uploaded in TS DRL with matching tag, auto-mirror here.

**Tab c — PIA:** DRL No. | DPS Name | Phase | Field | Request | Dates | Status | Remarks | Attachment. Field selector pulls from active PIA schema; Privacy Notice fields tagged so they co-list to Privacy Notice tab.

**Tab d — Privacy Notice:** DRL No. | DPS Name | Dept/Issuer | Dates | Status | Remarks | Attachment (auto-reflected from PIA/PRADAR when tagged).

**Tab e — Action Items & Others:** DRL No. | Tag (PIA/PRADAR/TSA/PN/Other) | Item | Dates | Status | Remarks | Attachment.

**Cross-cutting features (all tabs):**
- Inline edit on all cells (dates, status, tags, remarks)
- Date Received auto-fills when Status set to Completed
- Column configurator: show/hide columns; add custom columns (Days Outstanding [computed], Remarks by Users, etc.)
- Saved view per user in `localStorage`

---

## Technical notes

**New files:**
- `src/lib/drl/store.ts`, `src/lib/drl/seeds.ts` (PRADAR 24-row seed)
- `src/lib/analytics/executiveSummary.ts` (pure aggregator from `Pia[]`)
- `src/lib/ropaCompilation.ts` (column config persistence)
- `src/components/drl/DrlTable.tsx` (reusable editable table w/ column configurator)

**Edited files:**
- `src/pages/RopaGenerator.tsx` — replace with compilation table
- `src/pages/ExecutiveSummary.tsx` — full rewrite, derived sections
- `src/pages/AnalyticsHub.tsx` — add cross-module tiles
- `src/pages/DrlGenerator.tsx` — 5-tab refactor

**Out of scope (this iteration):**
- File attachment upload (placeholder UI only; files stored as filename string in localStorage)
- Real-time multi-user sync
- Backend persistence (still `localStorage`)

**Persistence:** All new state in `localStorage` keyed by `drl:*`, `ropa:compilation`, `execsum:selected`.

**No schema/DB changes.**
