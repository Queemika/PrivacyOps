
-- ============ ENUMS ============
create type public.app_role as enum ('Intern', 'Preparer', 'Lead', 'Approver', 'Admin');
create type public.comment_status as enum ('open', 'resolved');
create type public.comment_kind as enum ('comment', 'highlight');
create type public.engagement_status as enum ('active', 'archived');

-- ============ PROFILES ============

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  email text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: self read"
on public.profiles
for select
to authenticated
using (
  auth.uid() = user_id
);

create policy "profiles: self insert"
on public.profiles
for insert
to authenticated
with check (
  auth.uid() = user_id
);

create policy "profiles: self update"
on public.profiles
for update
to authenticated
using (
  auth.uid() = user_id
)
with check (
  auth.uid() = user_id
);

-- ============ ROLES ============
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "user_roles: self read" on public.user_roles for select using (auth.uid() = user_id or public.has_role(auth.uid(), 'Admin'));
create policy "user_roles: admin write" on public.user_roles for all using (public.has_role(auth.uid(), 'Admin')) with check (public.has_role(auth.uid(), 'Admin'));

-- Allow admins to see all profiles (added after has_role exists)
create policy "profiles: admin read" on public.profiles for select using (public.has_role(auth.uid(), 'Admin'));

-- ============ ENGAGEMENTS ============
create table public.engagements (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client_name text,
  status public.engagement_status not null default 'active',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.engagements enable row level security;

create table public.engagement_members (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role_on_engagement public.app_role not null default 'Preparer',
  created_at timestamptz not null default now(),
  unique (engagement_id, user_id)
);
alter table public.engagement_members enable row level security;

create or replace function public.is_engagement_member(_user_id uuid, _engagement_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.engagement_members where user_id = _user_id and engagement_id = _engagement_id)
$$;

create policy "engagements: member read" on public.engagements for select using (
  public.is_engagement_member(auth.uid(), id) or public.has_role(auth.uid(), 'Admin')
);
create policy "engagements: admin write" on public.engagements for all using (public.has_role(auth.uid(), 'Admin')) with check (public.has_role(auth.uid(), 'Admin'));

create policy "engagement_members: read" on public.engagement_members for select using (
  user_id = auth.uid() or public.is_engagement_member(auth.uid(), engagement_id) or public.has_role(auth.uid(), 'Admin')
);
create policy "engagement_members: admin write" on public.engagement_members for all using (public.has_role(auth.uid(), 'Admin')) with check (public.has_role(auth.uid(), 'Admin'));

-- ============ MODULE ASSIGNMENTS ============
create table public.module_assignments (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid not null references public.engagements(id) on delete cascade,
  module text not null,            -- 'pia' | 'pradar' | 'tsa' | 'inspection' | 'notice' | 'drl' | 'transcript' ...
  record_id text,                  -- workable id within that module
  assignee_id uuid not null references auth.users(id) on delete cascade,
  assigned_by uuid references auth.users(id) on delete set null,
  due_date date,
  notes text,
  created_at timestamptz not null default now()
);
alter table public.module_assignments enable row level security;

create policy "assignments: read" on public.module_assignments for select using (
  assignee_id = auth.uid() or public.is_engagement_member(auth.uid(), engagement_id) or public.has_role(auth.uid(), 'Admin')
);
create policy "assignments: admin write" on public.module_assignments for all using (public.has_role(auth.uid(), 'Admin')) with check (public.has_role(auth.uid(), 'Admin'));

-- ============ COMMENTS ============
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  engagement_id uuid references public.engagements(id) on delete cascade,
  module text not null,
  record_id text,
  anchor jsonb not null default '{}'::jsonb, -- { field?, selection?: {start,end,quote}, color? }
  kind public.comment_kind not null default 'comment',
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null default '',
  mentions uuid[] not null default '{}',
  status public.comment_status not null default 'open',
  parent_id uuid references public.comments(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.comments enable row level security;

create policy "comments: read (engagement)" on public.comments for select using (
  engagement_id is null
  or public.is_engagement_member(auth.uid(), engagement_id)
  or auth.uid() = any(mentions)
  or public.has_role(auth.uid(), 'Admin')
);
create policy "comments: insert" on public.comments for insert with check (auth.uid() = author_id);
create policy "comments: author update" on public.comments for update using (auth.uid() = author_id);
create policy "comments: author or admin delete" on public.comments for delete using (auth.uid() = author_id or public.has_role(auth.uid(), 'Admin'));

create table public.comment_todos (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments(id) on delete cascade,
  assignee_id uuid not null references auth.users(id) on delete cascade,
  due_date date,
  done boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.comment_todos enable row level security;

create policy "comment_todos: read" on public.comment_todos for select using (
  assignee_id = auth.uid() or public.has_role(auth.uid(), 'Admin')
);
create policy "comment_todos: insert by author" on public.comment_todos for insert with check (
  exists (select 1 from public.comments c where c.id = comment_id and c.author_id = auth.uid())
  or public.has_role(auth.uid(), 'Admin')
);
create policy "comment_todos: assignee update" on public.comment_todos for update using (
  assignee_id = auth.uid() or public.has_role(auth.uid(), 'Admin')
);

-- ============ NOTIFICATIONS ============
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,           -- mention | todo | assignment | status_change | deadline | system
  title text not null,
  body text,
  link text,
  meta jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.notifications enable row level security;

create policy "notifications: self read" on public.notifications for select using (user_id = auth.uid());
create policy "notifications: self update" on public.notifications for update using (user_id = auth.uid());
create policy "notifications: insert (any auth or system)" on public.notifications for insert with check (true);
create policy "notifications: self delete" on public.notifications for delete using (user_id = auth.uid());

-- ============ AUDIT LOG ============

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  user_email text,
  action text not null,
  target text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_log enable row level security;

create policy "audit_log: self insert"
on public.audit_log
for insert
to authenticated
with check (
  user_id = auth.uid()
);

create policy "audit_log: self read"
on public.audit_log
for select
to authenticated
using (
  user_id = auth.uid()
  or public.has_role(auth.uid(), 'Admin')
);

-- ============ TRIGGERS ============
create or replace function public.update_updated_at_column()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger trg_profiles_updated before update on public.profiles for each row execute function public.update_updated_at_column();
create trigger trg_engagements_updated before update on public.engagements for each row execute function public.update_updated_at_column();
create trigger trg_comments_updated before update on public.comments for each row execute function public.update_updated_at_column();

-- Auto-create profile and mention-notifications
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (user_id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', split_part(coalesce(new.raw_user_meta_data->>'full_name', new.email), ' ', 1)),
    coalesce(new.raw_user_meta_data->>'last_name', '')
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Notify mentioned users + parent comment author on new comment
create or replace function public.handle_new_comment()
returns trigger language plpgsql security definer set search_path = public as $$
declare m uuid; parent_author uuid;
begin
  -- mentions
  if new.mentions is not null then
    foreach m in array new.mentions loop
      if m <> new.author_id then
        insert into public.notifications (user_id, kind, title, body, link, meta)
        values (m, 'mention', 'You were mentioned in a comment',
                left(coalesce(new.body,''), 200),
                '/' || new.module || coalesce('/' || new.record_id, ''),
                jsonb_build_object('comment_id', new.id, 'module', new.module, 'record_id', new.record_id));
      end if;
    end loop;
  end if;
  -- reply notification
  if new.parent_id is not null then
    select author_id into parent_author from public.comments where id = new.parent_id;
    if parent_author is not null and parent_author <> new.author_id then
      insert into public.notifications (user_id, kind, title, body, link, meta)
      values (parent_author, 'reply', 'New reply to your comment',
              left(coalesce(new.body,''), 200),
              '/' || new.module || coalesce('/' || new.record_id, ''),
              jsonb_build_object('comment_id', new.id, 'parent_id', new.parent_id));
    end if;
  end if;
  return new;
end;
$$;

create trigger on_comment_created
  after insert on public.comments
  for each row execute function public.handle_new_comment();

-- Notify assignee on module_assignments insert
create or replace function public.handle_new_assignment()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.assignee_id <> coalesce(new.assigned_by, '00000000-0000-0000-0000-000000000000'::uuid) then
    insert into public.notifications (user_id, kind, title, body, link, meta)
    values (new.assignee_id, 'assignment',
            'You were assigned to a ' || new.module,
            coalesce(new.notes, ''),
            '/' || new.module || coalesce('/' || new.record_id, ''),
            jsonb_build_object('assignment_id', new.id, 'module', new.module, 'record_id', new.record_id, 'due_date', new.due_date));
  end if;
  return new;
end;
$$;

create trigger on_assignment_created
  after insert on public.module_assignments
  for each row execute function public.handle_new_assignment();

-- Notify assignee on comment_todos insert
create or replace function public.handle_new_comment_todo()
returns trigger language plpgsql security definer set search_path = public as $$
declare c_module text; c_record text; c_body text;
begin
  select module, record_id, body into c_module, c_record, c_body from public.comments where id = new.comment_id;
  insert into public.notifications (user_id, kind, title, body, link, meta)
  values (new.assignee_id, 'todo', 'New to-do from a comment',
          left(coalesce(c_body,''), 200),
          '/' || c_module || coalesce('/' || c_record, ''),
          jsonb_build_object('comment_id', new.comment_id, 'todo_id', new.id, 'due_date', new.due_date));
  return new;
end;
$$;

create trigger on_comment_todo_created
  after insert on public.comment_todos
  for each row execute function public.handle_new_comment_todo();

-- ============ REALTIME ============
alter table public.comments replica identity full;
alter table public.notifications replica identity full;
alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.comment_todos;
