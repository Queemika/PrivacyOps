# Cowork, Review Workflow & Audit Log

Bring multi-user live editing, supervisor sign-off, and a tamper-evident audit trail to every major workable (PIA, DRL, Physical Inspection, TSA, ROPA).

## 1. Move workable storage to the database

Today most modules persist to `localStorage` (`pia/store.ts`, `drl/store.ts`, `inspections/store.ts`, etc.). Realtime needs a shared source of truth.

New tables (one migration):

- `pia_records` — `{ id, engagement_id, title, type, dps_status, scope, data jsonb, status, created_by, updated_by, version, updated_at }`
- `drl_rows` — `{ id, engagement_id, category, fields jsonb, owner, assignment text[], status, updated_by, version, updated_at }`
- `inspection_records`, `tsa_records`, `ropa_records` — same shape (`engagement_id`, `data jsonb`, `status`, `updated_by`, `version`).
- `presence` (ephemeral, in `Realtime` only — no table needed; uses `channel.track`).

Every table follows the four-step rule (CREATE → GRANT → ENABLE RLS → POLICY) and is added to `supabase_realtime` publication. RLS: row visible/editable only if `is_engagement_member(auth.uid(), engagement_id)`; approvers/admins via `has_role`.

A one-time client migrator copies existing `localStorage` records into the DB on first load (keyed by engagement) so no data is lost.

## 2. Live editing (field-level LWW + presence)

New hook `useRealtimeRecord(table, id)`:

- Loads row, subscribes to `postgres_changes` for that row.
- Exposes `patch(fieldPath, value)` → debounced `update` with `version = version + 1` and `updated_by = auth.uid()`.
- Conflict resolution: last write wins, but the hook surfaces a toast "Field updated by {name}" when an incoming change overwrites a local pending edit.

New hook `usePresence(channelKey)`:

- Tracks `{ user_id, name, color, focusedField }` via Supabase Realtime presence.
- New `<PresenceAvatars />` rendered in `PageHeader` of each workable showing who is viewing.
- `<FieldFocusRing field="..." />` wraps inputs in `Phase1Form`, `Phase3Form`, `DrlGenerator` cells, `PhysicalInspection` rows, `TechnicalSecurityAssessment` rows — shows a colored outline + avatar bubble when another user is focused on the same field.

No CRDT, no locking — explicitly chosen for simplicity.

## 3. Task assignment (reuse `module_assignments`)

- New page `/tasks` ("My Tasks") listing assignments where `assignee_id = auth.uid()`, grouped by module, with status (`open`, `in_progress`, `done`) and due date.
- "Assign" action added to PIA, DRL row, Inspection area, TSA control, ROPA row — opens a popover (user picker from `profiles` + due date + notes), inserts into `module_assignments`. Existing `handle_new_assignment` trigger already notifies the assignee.
- Sidebar badge on "My Tasks" with open count.

## 4. Supervisor review workflow

Add `status` enum on each workable: `Draft → Preparer → Lead Review → Approver Sign-off → Approved | Rejected`.

- Transitions gated by `has_role`:
  - Preparer → Lead Review: any engagement member.
  - Lead Review → Approver Sign-off: role `Lead`.
  - Approver Sign-off → Approved/Rejected: role `Approver` or `Admin`.
- `<ReviewBar />` component in each workable header showing current status, next-step button (disabled with tooltip if role lacks permission), and reviewer comment textarea.
- Rejection sends record back to `Preparer` with a required reason; reason stored in `review_history` jsonb column and notified to `updated_by` via `notifications`.

## 5. Audit log (every change, everywhere)

Single `change_log` table:

```text
id | table_name | record_id | engagement_id | user_id | user_email
   | action ('insert'|'update'|'delete'|'status_change')
   | field_path | old_value jsonb | new_value jsonb | created_at
```

- Postgres trigger `log_changes()` attached to each workable table. For `UPDATE`, walks the top-level keys of `data` jsonb and emits one row per changed field (uses `jsonb_each` diff). Captures `auth.uid()` and joins to `profiles` for email.
- Existing `audit_log` table stays for app-level events (login, export, role change). The Audit Log page merges both feeds.
- `AuditLog.tsx` upgrades:
  - Tabs: **All / Workables / System**.
  - Filters: module, engagement, user, date range, action type.
  - Each row expands to show old → new diff (rendered as a small two-column block).
  - Export CSV.
- Per-record "History" drawer in each workable header (`<RecordHistory recordId />`) showing the same data scoped to that record.

## 6. Permissions per role

Centralized in `src/lib/permissions.ts`:

```text
can(action, module, record?) → boolean
```

Reads from `useMyRoles` and the record's current `status`. Used by `<ReviewBar />`, assignment popovers, edit guards on `useRealtimeRecord.patch` (server still enforces via RLS, this is UX-only).

Matrix (summary):

| Role     | Edit Draft | Submit | Lead Approve | Final Sign-off | Assign tasks |
|----------|------------|--------|--------------|----------------|--------------|
| Intern   | view-only  | —      | —            | —              | —            |
| Preparer | yes        | yes    | —            | —              | yes          |
| Lead     | yes        | yes    | yes          | —              | yes          |
| Approver | yes        | yes    | yes          | yes            | yes          |
| Admin    | yes        | yes    | yes          | yes            | yes          |
| Client   | read-only on Approved | — | — | — | — |

## Files (high level)

**New**
- `supabase/migrations/<ts>_cowork_audit.sql` (tables, RLS, grants, realtime publication, `log_changes` trigger)
- `src/lib/realtime/useRealtimeRecord.ts`, `src/lib/realtime/usePresence.ts`
- `src/components/cowork/PresenceAvatars.tsx`, `FieldFocusRing.tsx`, `ReviewBar.tsx`, `RecordHistory.tsx`, `AssignTaskPopover.tsx`
- `src/lib/permissions.ts`
- `src/pages/MyTasks.tsx`
- `src/lib/migration/localToDb.ts` (one-time migrator)

**Edited**
- `src/pages/PiaWorkspace.tsx`, `DrlGenerator.tsx`, `PhysicalInspection.tsx`, `TechnicalSecurityAssessment.tsx`, `RopaGenerator.tsx` — swap local stores for `useRealtimeRecord`, mount presence + review bar.
- `src/pages/AuditLog.tsx` — new filters, tabs, diff view, CSV export.
- `src/components/AppSidebar.tsx` — add "My Tasks".
- `src/lib/pia/store.ts`, `drl/store.ts`, `inspections/store.ts` — thin adapters that read/write through the DB instead of localStorage.

## Out of scope

- True CRDT co-typing (Yjs) — explicitly rejected.
- Hard row locking.
- Per-section (sub-phase) review gates — workflow is per-record.
- Slack/Teams notifications (email + in-app only).

## Shipped (iteration 1)

- Schema, RLS, GRANTs, realtime publication, `change_log` + `log_workable_change` trigger.
- Realtime infra: `usePresence`, `useRealtimeRecord`, `PresenceAvatars`, `PresenceStrip`, `FieldFocusRing`.
- Workflow: `permissions.ts`, `ReviewBar`, `RecordHistory`, `AssignTaskPopover`.
- Pages: `/tasks` (My Tasks board), upgraded `/audit` (workable vs system tabs, filters, diff view, CSV export).
- PiaWorkspace shows live presence avatars via `PresenceStrip`.
- Sidebar entry for My Tasks.

## Deferred to iteration 2

- Migrating PIA/DRL/Inspection/TSA/ROPA persistence from `localStorage` to the new DB tables. Hooks (`useRealtimeRecord`) and the `ReviewBar`/`RecordHistory` components are ready to drop in once each module has a DB-backed record. The localStorage `ENG-${ts}` engagement ids do not satisfy the uuid FK on `engagements`, so the migration includes wiring local engagements to real `engagements` rows.
- Mounting `ReviewBar`/`RecordHistory`/`AssignTaskPopover` into every workable header (depends on the DB migration above).
- `FieldFocusRing` on individual form inputs (depends on `useRealtimeRecord` integration).
