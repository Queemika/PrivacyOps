## Goal

Bring your PRADAR workbook into the app so consultants can **perform the assessment in a streamlined UI (not Excel-like)**, while exporting back to the **exact Excel template** so all formulas (`#DIV/0!` rollups → real values), styles, and cross-sheet links are preserved.

No Cloud needed for this phase. Browser-only, using `exceljs`.

---

## What I extracted from your template

- **5 sheets:** `Rating Guide`, `Scoreboard`, `PRADAR`, `DRL`, `Reference`
- **PRADAR sheet** = 24 control questions across 10 privacy domains (Organizational Commitment → Oversight & Continuous Improvement)
- **20 columns per question:** PMP Component, Sub-domain, Privacy Domain, Control Question, DRL No., Proof of Compliance, Document Link, **DRL Status**, Basis/Min Req, **Assessor**, **Assessment**, **Assessment Status**, **Reviewer's Status**, Rating Guide, **Rating**, Gaps, Client's Comments, **Client's Status**, Action Plan
- **Dropdowns (data validations) detected:**
  - DRL Status → Not Applicable / Pending / Provided / Closed
  - Assessment Status → Not started / Ongoing / Not Applicable / Completed
  - Reviewer's Status → Not started / Ongoing / Reviewed
  - Rating → 1 / 2 / 3 / 4
  - Client's Status → Not Started / In Progress / Accepted / Rejected
  - Assessor & Reviewer → name lists from your template
- **Tooltip content** lives in the long text in `Basis/Minimum Req` (col J) and `Rating Guide` (col O) — these become hover tooltips in the UI.

---

## SYSTEM DESIGN CHANGE 

### Introduce 3-layer architecture:

### 1. Template Layer (Excel)

- Original file (unchanged)
- Used ONLY during export/import

### 2. Data Model Layer

- Clean JSON structure optimized for the app
- NOT 1:1 with Excel columns

Example structure:  
{

  id,

  domain,

  subDomain,

  component,

  controlQuestion,

  drlNo,

  


  // Evidence

  documents: [],

  documentLinks: "",

  


  // Assessment

  rating,

  gap,

  actionPlan,

  


  // Internal tracking (hidden by default)

  assessor,

  reviewer,

  assessmentStatus,

  reviewerStatus,

  drlStatus,

  


  // Optional client-facing

  clientComment,

  clientStatus,

  


  // AI

  aiSummary,

  aiSuggestedGap,

  aiSuggestedRating,

  aiEvidenceHighlights: []

}

### 3. UI Layer

- Clean, minimal interface
- Uses toggles for additional fields

---

## Plan

### 1. Bundle the template

- Copy your file to `public/templates/pradar_template.xlsx` so the app can fetch it at export time and write into the original (preserves formulas, conditional formatting, Scoreboard rollups, branding).

### 2. Seed the PRADAR data model

- Replace `mockData.ts` with:
  - 24 real control questions
  - Domain grouping
  - Tooltip content
  - Dropdown values
- Store in:
  - `localStorage (pa_pradar_state)`
- Key improvement:
  - Store **only necessary fields**
  - Do NOT mirror Excel columns directly

### 3. Rebuild  UI (`PradarChecklist.tsx` )

## 3.1 Layout structure

- Group by **Privacy Domain (10 sections)**
- Each section = collapsible

---

## 3.2 Row UI (SIMPLIFIED)

Each control question shows:

### Core (always visible)

- Control Question
- DRL badge
- Rating (1–4 selector w/ popover)
- Gap (1-liner input)
- Action Plan (structured input)
- Evidence upload / document link

---

### Tooltip (on-demand)

- Basis / Minimum Requirement
- Rating Guide (popover per rating)

---

### Optional fields (toggle-based)

####  Internal Mode

- Assessor (initials + color tags)
- Reviewer
- Assessment Status
- Reviewer Status
- DRL Status

#### Client Mode

- Client Comments
- Client Status

Hidden by default but:

- Data still stored
- Included in export

---

## 3.3 Evidence-first workflow 

Flow per control:

```
Upload document → AI assist → User review → Rating → Gap → Action

```

## 3.4 AI Assistance

When user uploads document:

AI generates:

- Summary (editable)
- Suggested rating (editable)
- Suggested 1-line gap (editable)
- Highlighted evidence mapping

Key feature:

> Clicking AI claim → highlights source in document

Always:

- User reviews
- User can edit/delete AI output

---

## 3.5 Gap & Action Plan Standardization

Enforce:

- **Gap:**
  - 1–2 lines only
  - Direct statement of issue
- **Action Plan:** Structured:

```
Action:
Responsible:
Timeline:

```

---

## 3.6 Timeline Logic

- Add **global submission date (footer setting)**
- Suggest timeline (e.g., +3 months)

BUT:

- Always editable
- Not auto-final

---

## 3.7 Role visualization 

Instead of dropdown-heavy UI:

- Show:
  - Initials (e.g., MC, JD)
  - Color-coded roles:
    - Preparer (blue)
    - Reviewer (purple)
    - Approver (green)

Hover → full name

---

## 3.8 DRL Integration

- Each control → linked DRL item

Behavior:

- DRL Status syncs with DRL module
- Evidence uploaded → auto-link to DRL
- “Missing evidence” flag auto-triggered

---

## 3.9 Filtering

Add filters:

- By Domain
- By Rating (e.g., 1–2 only)
- By Status
- By Assignee

## 3.10 Live Scoreboard

Compute in-app:

- Average per domain
- Overall maturity level

Display:

- Mini dashboard (top)
- Optional expanded view (modal)

### 4. Export back to the original template (formula-preserving)

- Add `src/lib/pradarExport.ts` using `exceljs`:
  1. `fetch('/templates/pradar_template.xlsx')` → load as workbook.
  2. Map app data → exact Excel cells
  3. Populate only:
    - Rating
    - Gap
    - Action Plan
    - Status fields
    - Document link(s)
  4. Keep:
    - Scoreboard formulas
    - DRL formulas
    - formatting intact
  5. Trigger download as `PRADAR_<client>_<date>.xlsx`.
- Add **"Export"** button in the page header alongside the existing actions.

### 5. Optional (same phase, low cost)

- **Import existing PRADAR**: drag-drop a previously-filled file → parse rows 4–27 → Map back to data model → Resume assessment in app

---

## Out of scope for this phase

- Cloud / shared storage (still localStorage — flip later as agreed).
- Editing the Scoreboard or Rating Guide sheets in-app (they remain template-owned, recalculated on open).
- Word/PowerPoint templates — handle separately when you upload them.

---

## Files to add / edit

### Add

- `public/templates/pradar_template.xlsx`
- `src/lib/pradarTemplate.ts`
- `src/lib/pradarExport.ts`

### New (important)

- `src/lib/pradarModel.ts` ✅ (data layer)

### Edit

- `src/pages/PradarChecklist.tsx`
- `src/lib/mockData.ts`

### Dependency

- `exceljs`

Confirm and I'll implement. If you also want me to wire the same template-preserving export pattern for RoPA / NPC-RS / Exec Summary, send those template files next and I'll repeat the pattern.