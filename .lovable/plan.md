# DRL — Owner & Assignment Enhancements

Five changes scoped to the DRL module + a small per-engagement settings panel and one notification email.

## 1. Rename "Assigned To" → "Owner" (codename dropdown)

`src/pages/DrlGenerator.tsx`:
- Rename `ASSIGNED_COL` label to `Owner`, key stays `assignedTo` (keeps existing data).
- Change cell to a `Select` with two options: the engagement's **Client codename** and **MyTeam codename**.
- Filter input above the table relabeled "Filter by owner…" and matches the two codename strings.

## 2. Per-engagement codenames (Settings)

Codenames are stored per engagement (per user choice):
- New helper `src/lib/engagementSettings.ts` (localStorage `engagement:settings:v1`):
  - `getEngagementCodenames(engagementId) → { client: string; myTeam: string }`
  - Defaults: client = engagement's `clientName` (from `EngagementContext` / `listEngagements`), myTeam = "MyTeam".
- New tab in `src/pages/EngagementManager.tsx` (or open in the engagement detail panel) → "Codenames" — two text inputs.
- DRL reads the active engagement id from existing context (already used to scope rows) and resolves the two codename strings for the Owner dropdown.

## 3. New "Assignment" column (free-text department tags)

Added to every category in `SPEC` after `Owner`:
- Stored in `DrlRow.fields.assignment` as a comma-separated list of department tag strings (no schema change to `store.ts` beyond a typed helper).
- Cell renders chips + a small "+ tag" popover with:
  - Autocomplete suggestions from the editable department list (see #5).
  - Free-text entry — Enter adds a new chip; chips removable with ×.
- New filter "Filter by assignment…" matches any chip substring.

## 4. Notification on assignment

When a new chip is added to `assignment`:
- **In-app**: insert into `notifications` table for users in the engagement whose profile email matches the tag (department tags without a matching user are stored as labels only, no notification).
- **Email**: new edge function `notify-drl-assignment` using **Lovable Emails** (`send-transactional-email`) — sends to those matched users with subject "You were tagged on a DRL item" and a link back to `/drl?tab={category}&row={id}`.
- Triggered from the DRL cell after `updateRow`, debounced 300ms per row.
- Suppresses duplicates by tracking `fields.notifiedFor` (chip list already notified).

Note: emails depend on a verified email domain. If none is configured, the email step is skipped silently and only the in-app bell fires; we surface a one-time toast telling the admin to set up the email domain.

## 5. Editable department list (linked to Physical Inspection)

Single source of truth for department tag suggestions:
- New helper `src/lib/departments/store.ts` (localStorage `departments:v1`) seeded from `DEFAULT_AREAS` in `src/lib/inspections/store.ts`.
- `loadDepartments()` / `saveDepartments(list)` / `addDepartment(name)` / `removeDepartment(name)`.
- `PhysicalInspection.tsx` area-name editor writes through this helper so adds/edits/removes in the inspection module update DRL suggestions, and vice versa.
- New "Departments" section in `EngagementManager.tsx` settings (admin-only) for direct editing without leaving DRL.

## Files

**New**
- `src/lib/engagementSettings.ts`
- `src/lib/departments/store.ts`
- `src/components/drl/AssignmentCell.tsx` (chips + popover)
- `supabase/functions/notify-drl-assignment/index.ts`

**Edited**
- `src/pages/DrlGenerator.tsx` (Owner select, Assignment column, filters)
- `src/lib/drl/store.ts` (typed helpers only; no shape change)
- `src/pages/EngagementManager.tsx` (Codenames + Departments tabs)
- `src/pages/PhysicalInspection.tsx` (read/write departments via shared store)

## Out of scope

- Renaming the underlying `assignedTo` field/migration.
- Per-row permission gating by owner.
- SMS / Slack notifications.
