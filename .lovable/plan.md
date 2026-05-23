
# Phase 1 — Foundation: Roles, Comments, Notifications

The rest of your request (sign-off workflow, client view, rating-formula configurator, field locks, theming, transcript bento + AI extraction, PIA Phase 3 redesign, DRL "All" + Assigned-to, PRADAR table) will be split into Phase 2 and Phase 3 plans after this lands. They all depend on real users, roles, and a notification channel — so this comes first.

## What ships in Phase 1

### 1. Real auth on Lovable Cloud
- Replace the current `localStorage` auth in `src/context/AuthContext.tsx` with Supabase auth.
- `/login` and `/signup` use email/password + Google sign-in.
- `profiles` row auto-created on signup via trigger; existing `useAuth()` API kept (same `user`, `login`, `signup`, `logout`, `logAction` surface) so the rest of the app keeps working.
- Audit log writes move from `localStorage` to a server `audit_log` table.

### 2. Roles & assignments (admin-managed)
- New `user_roles` table using an `app_role` enum: `Intern | Preparer | Lead | Approver | Admin`. Roles live in their own table (security best practice), checked via `has_role()` SECURITY DEFINER.
- New `engagements` table and `engagement_members` join table (`user_id`, `engagement_id`, `role_on_engagement`).
- New `module_assignments` table: assign a specific workable (PIA / PRADAR / TSA / Inspection / Notice / DRL row) to a user within an engagement.
- New Admin screen `src/pages/admin/UserManagement.tsx`:
  - List signed-up users, assign role, assign to engagements, assign workables/screens.
  - Replaces the current localStorage-only `ViewAsSettings` for production use (View-As stays for dev preview).

### 3. Comments system (MS-Office style, field-anchored + highlight)
- New `comments` table: `id, engagement_id, module, record_id, anchor (jsonb: {field?, selection?: {start,end,quote}}), author_id, body, mentions uuid[], status (open|resolved), parent_id, created_at`.
- New `comment_todos` table linking a comment to an assignee with a due date.
- Reusable `<CommentableField>` and `<CommentableText>` wrappers:
  - Field-level: speech-bubble in the gutter, click to open thread.
  - Text-level: select text → floating "Comment / Highlight" button → stores selection offsets + quoted text so re-render survives content edits.
- `<CommentsPanel>` side-drawer per workable: thread list, @mention autocomplete (engagement members), reply, resolve, reopen, delete, assign-as-todo (writes to the to-do store + notifies user).
- Wired into PIA Phase 1/2/3, PRADAR Working File, TSA, Physical Inspection, Privacy Notice tabs (one panel per module, anchors carry which sub-tab/field).
- Highlight/annotate: same selection mechanism, persists as a comment with `kind: "highlight"` and a color; rendered as a `<mark>` overlay.

### 4. Notifications + bell
- New `notifications` table: `id, user_id, kind, title, body, link, read_at, created_at, meta jsonb`.
- Triggers/inserts on: comment @mention, comment-to-do assigned, workable assigned, status change submitted/reviewed/approved (stubs now; the actual sign-off flow lands in Phase 2 but the channel is ready), deadline reminder (cron edge function `notify-deadlines` runs daily).
- `<NotificationBell>` in `AppLayout` header: unread count, dropdown list, per-item "Add to to-do" / "Dismiss", "Mark all read", deep-link to the source.
- Realtime: subscribe to `notifications` + `comments` via Supabase Realtime so the bell and panels update live.

## Technical details

### Migrations (single migration, ordered)
1. `create type app_role`
2. `profiles` (auto-create via `handle_new_user` trigger on `auth.users`)
3. `user_roles` + `has_role(_user_id, _role)` SECURITY DEFINER
4. `engagements`, `engagement_members`, `module_assignments`
5. `comments`, `comment_todos`
6. `notifications`
7. `audit_log`
8. RLS on all tables:
   - profiles: self read/update; admins read all.
   - user_roles: self read; only admins insert/update/delete.
   - engagements/members/assignments: members of the engagement read; admins write.
   - comments/comment_todos/notifications: scoped to engagement membership; author can edit/delete own; mentioned users can read.
9. `ALTER PUBLICATION supabase_realtime ADD TABLE comments, notifications;`

### Frontend structure
- `src/lib/auth/` — replaces `src/context/AuthContext.tsx` internals; same hook surface.
- `src/lib/roles/` — `useRole()`, `useAssignments()`, `useEngagement()`.
- `src/lib/comments/` — store, hooks, types; `CommentableField`, `CommentableText`, `CommentsPanel`, `HighlightOverlay`.
- `src/lib/notifications/` — store, hook, `NotificationBell`.
- `src/pages/admin/UserManagement.tsx` — new.
- `AppLayout.tsx` — add bell + (admin only) link to User Management.
- Existing localStorage stores stay in place for module data; only auth/audit/comments/notifications move to Cloud now. Module data migrations happen in Phase 2 when sign-off + client view need server state.

### Edge functions
- `notify-deadlines` (scheduled) — scans assignments + due dates, inserts notifications.
- `comment-mention` — invoked on comment create; resolves @mentions and writes notifications (could be a DB trigger; using an edge function keeps the mention-parsing in TS).

## Out of scope for this plan (will be Phase 2 / 3)
- Sign-off / submit-for-review / approve workflow buttons and statuses
- Client read-only view + per-module client visibility config
- Admin rating-formula configurator
- Admin field-lock & rule editor
- Per-user theme/background customization
- Transcript preview-edit-process flow + bento outputs + real AI extraction
- PIA Phase 3 column redesign, Consistency Checker rework, per-PIA DRL tab
- DRL "All" tab + "Assigned to" column
- PRADAR table layout, sticky right-side actions, attachment preview popover

Confirm and I'll build Phase 1, then queue Phase 2.
