-- ============================================================
-- MANAGEMENT MODULE & EXECUTIVES ENHANCEMENT
-- ============================================================

-- ============================================================
-- STORAGE BUCKETS FOR MANAGEMENT MODULE
-- ============================================================

-- Create meeting minutes bucket
insert into storage.buckets (id, name, public)
values ('meeting-minutes', 'meeting-minutes', true)
on conflict (id) do nothing;

-- Create handover documents bucket
insert into storage.buckets (id, name, public)
values ('handover-documents', 'handover-documents', true)
on conflict (id) do nothing;

-- Create proposal attachments bucket
insert into storage.buckets (id, name, public)
values ('proposal-attachments', 'proposal-attachments', true)
on conflict (id) do nothing;

-- ============================================================
-- RLS POLICIES FOR STORAGE BUCKETS
-- ============================================================

-- Meeting minutes - public read, admin write
create policy "Meeting minutes: Public can view"
on storage.objects for select
to public
using (bucket_id = 'meeting-minutes');

create policy "Meeting minutes: Admins can upload"
on storage.objects for insert
to authenticated
with check (bucket_id = 'meeting-minutes' and public.has_admin_role());

create policy "Meeting minutes: Admins can delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'meeting-minutes' and public.has_admin_role(array['super_admin', 'admin']::public.user_role[]));

-- Handover documents - public read, admin write
create policy "Handover documents: Public can view"
on storage.objects for select
to public
using (bucket_id = 'handover-documents');

create policy "Handover documents: Admins can upload"
on storage.objects for insert
to authenticated
with check (bucket_id = 'handover-documents' and public.has_admin_role());

create policy "Handover documents: Admins can delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'handover-documents' and public.has_admin_role(array['super_admin', 'admin']::public.user_role[]));

-- Proposal attachments - public read, admin write
create policy "Proposal attachments: Public can view"
on storage.objects for select
to public
using (bucket_id = 'proposal-attachments');

create policy "Proposal attachments: Admins can upload"
on storage.objects for insert
to authenticated
with check (bucket_id = 'proposal-attachments' and public.has_admin_role());

create policy "Proposal attachments: Admins can delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'proposal-attachments' and public.has_admin_role(array['super_admin', 'admin']::public.user_role[]));

-- ============================================================
-- ADD SESSION FIELDS TO EXECUTIVES TABLE
-- ============================================================
alter table public.executives
  add column if not exists session text,
  add column if not exists is_current boolean not null default true,
  add column if not exists bio text,
  add column if not exists started_at date,
  add column if not exists ended_at date;

-- Create index for session and current executives
create index if not exists idx_executives_session on public.executives(session);
create index if not exists idx_executives_current on public.executives(is_current) where is_current = true;

-- ============================================================
-- MEETINGS TABLE
-- ============================================================
create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  meeting_date date not null,
  meeting_time time,
  location text,
  meeting_type text check (meeting_type in ('general', 'executive', 'committee', 'special')),
  status text not null default 'scheduled' check (status in ('scheduled', 'held', 'cancelled', 'postponed')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_meetings_date on public.meetings(meeting_date desc);
create index if not exists idx_meetings_status on public.meetings(status);
create index if not exists idx_meetings_type on public.meetings(meeting_type);

-- ============================================================
-- MEETING MINUTES TABLE
-- ============================================================
create table if not exists public.meeting_minutes (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  content text not null,
  version integer not null default 1,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint meeting_minutes_meeting_version unique (meeting_id, version)
);

create index if not exists idx_meeting_minutes_meeting on public.meeting_minutes(meeting_id);
create index if not exists idx_meeting_minutes_version on public.meeting_minutes(meeting_id, version);

-- ============================================================
-- MEETING ACTION ITEMS TABLE
-- ============================================================
create table if not exists public.meeting_action_items (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  description text not null,
  assignee text,
  due_date date,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_meeting_action_items_meeting on public.meeting_action_items(meeting_id);
create index if not exists idx_meeting_action_items_status on public.meeting_action_items(status);
create index if not exists idx_meeting_action_items_due on public.meeting_action_items(due_date);

-- ============================================================
-- PROPOSALS TABLE
-- ============================================================
create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category text check (category in ('event', 'policy', 'programme', 'initiative', 'other')),
  proposer_name text,
  proposer_email text,
  status text not null default 'proposed' check (status in ('proposed', 'under_review', 'approved', 'rejected', 'in_progress', 'completed', 'archived')),
  meeting_id uuid references public.meetings(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_proposals_status on public.proposals(status);
create index if not exists idx_proposals_category on public.proposals(category);
create index if not exists idx_proposals_meeting on public.proposals(meeting_id);

-- ============================================================
-- PROPOSAL VOTES TABLE
-- ============================================================
create table if not exists public.proposal_votes (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id) on delete cascade,
  voter_id uuid references public.members(id) on delete cascade,
  voter_name text,
  vote text not null check (vote in ('approve', 'reject', 'abstain')),
  comment text,
  created_at timestamptz not null default now(),
  constraint proposal_vote_unique unique (proposal_id, voter_id)
);

create index if not exists idx_proposal_votes_proposal on public.proposal_votes(proposal_id);
create index if not exists idx_proposal_votes_voter on public.proposal_votes(voter_id);

-- ============================================================
-- RECORDS TABLE (Central Repository)
-- ============================================================
create table if not exists public.records (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null check (category in ('meeting', 'event', 'decision', 'policy', 'financial', 'communication', 'handover', 'other')),
  record_date date,
  file_url text,
  content text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_records_category on public.records(category);
create index if not exists idx_records_date on public.records(record_date desc);

-- ============================================================
-- HANDOVERS TABLE
-- ============================================================
create table if not exists public.handovers (
  id uuid primary key default gen_random_uuid(),
  session text not null,
  handing_over_from uuid references public.executives(id) on delete set null,
  handing_over_to uuid references public.executives(id) on delete set null,
  handover_date date,
  projects_summary text,
  financial_status text,
  contact_list jsonb,
  notes text,
  status text not null default 'draft' check (status in ('draft', 'pending', 'completed', 'archived')),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_handovers_session on public.handovers(session);
create index if not exists idx_handovers_status on public.handovers(status);
create index if not exists idx_handovers_from on public.handovers(handing_over_from);
create index if not exists idx_handovers_to on public.handovers(handing_over_to);

-- ============================================================
-- UPDATED AT TRIGGERS
-- ============================================================
create trigger meetings_set_updated_at
before update on public.meetings
for each row execute function public.set_updated_at();

create trigger meeting_action_items_set_updated_at
before update on public.meeting_action_items
for each row execute function public.set_updated_at();

create trigger proposals_set_updated_at
before update on public.proposals
for each row execute function public.set_updated_at();

create trigger records_set_updated_at
before update on public.records
for each row execute function public.set_updated_at();

create trigger handovers_set_updated_at
before update on public.handovers
for each row execute function public.set_updated_at();

-- ============================================================
-- AUDIT TRIGGERS
-- ============================================================
create trigger meetings_audit
after insert or update or delete on public.meetings
for each row execute function public.write_audit_log();

create trigger meeting_minutes_audit
after insert or update or delete on public.meeting_minutes
for each row execute function public.write_audit_log();

create trigger meeting_action_items_audit
after insert or update or delete on public.meeting_action_items
for each row execute function public.write_audit_log();

create trigger proposals_audit
after insert or update or delete on public.proposals
for each row execute function public.write_audit_log();

create trigger proposal_votes_audit
after insert or update or delete on public.proposal_votes
for each row execute function public.write_audit_log();

create trigger records_audit
after insert or update or delete on public.records
for each row execute function public.write_audit_log();

create trigger handovers_audit
after insert or update or delete on public.handovers
for each row execute function public.write_audit_log();

-- ============================================================
-- RLS POLICIES FOR NEW TABLES
-- ============================================================
do $$
declare
  t text;
begin
  foreach t in array array[
    'meetings', 'meeting_minutes', 'meeting_action_items',
    'proposals', 'proposal_votes', 'records', 'handovers'
  ]
  loop
    -- Read: authenticated admins
    execute format(
      'create policy %I on public.%I for select to authenticated using (public.has_admin_role())',
      'staff can read ' || t, t);
    
    -- Insert: authenticated admins
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (public.has_admin_role())',
      'staff can create ' || t, t);
    
    -- Update: authenticated admins
    execute format(
      'create policy %I on public.%I for update to authenticated using (public.has_admin_role()) with check (public.has_admin_role())',
      'staff can update ' || t, t);
    
    -- Delete: admin and super_admin only
    execute format(
      'create policy %I on public.%I for delete to authenticated using (public.has_admin_role(array[''super_admin'',''admin'']::public.user_role[]))',
      'admins can delete ' || t, t);
  end loop;
end
$$;

-- Enable RLS on new tables
alter table public.meetings enable row level security;
alter table public.meeting_minutes enable row level security;
alter table public.meeting_action_items enable row level security;
alter table public.proposals enable row level security;
alter table public.proposal_votes enable row level security;
alter table public.records enable row level security;
alter table public.handovers enable row level security;

-- ============================================================
-- NOTIFICATION FUNCTION FOR MANAGEMENT MODULE
-- ============================================================
create or replace function public.notify_management_update(
  notification_type text,
  notification_title text,
  notification_message text,
  notification_data jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (
    recipient_id,
    type,
    title,
    message,
    data
  )
  select
    p.id,
    notification_type,
    notification_title,
    notification_message,
    notification_data
  from public.profiles p
  where p.status = 'active'
    and p.role in ('super_admin', 'admin', 'editor');
end $$;

-- ============================================================
-- TRIGGER TO SEND NOTIFICATIONS ON MEETING CREATION
-- ============================================================
create or replace function public.on_meeting_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.notify_management_update(
    'meeting_created',
    'New Meeting Scheduled',
    'A new meeting "' || NEW.title || '" has been scheduled for ' || NEW.meeting_date,
    jsonb_build_object(
      'meeting_id', NEW.id,
      'meeting_date', NEW.meeting_date,
      'meeting_type', NEW.meeting_type
    )
  );
  return NEW;
end $$;

create trigger meeting_created_notification
after insert on public.meetings
for each row execute function public.on_meeting_created();

-- ============================================================
-- TRIGGER TO SEND NOTIFICATIONS ON PROPOSAL CREATION
-- ============================================================
create or replace function public.on_proposal_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.notify_management_update(
    'proposal_created',
    'New Proposal Submitted',
    'A new proposal "' || NEW.title || '" has been submitted',
    jsonb_build_object(
      'proposal_id', NEW.id,
      'category', NEW.category,
      'proposer', NEW.proposer_name
    )
  );
  return NEW;
end $$;

create trigger proposal_created_notification
after insert on public.proposals
for each row execute function public.on_proposal_created();

-- ============================================================
-- TRIGGER TO SEND NOTIFICATIONS ON PROPOSAL STATUS CHANGE
-- ============================================================
create or replace function public.on_proposal_status_changed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if OLD.status is distinct from NEW.status then
    perform public.notify_management_update(
      'proposal_status_changed',
      'Proposal Status Updated',
      'Proposal "' || NEW.title || '" status changed to ' || NEW.status,
      jsonb_build_object(
        'proposal_id', NEW.id,
        'old_status', OLD.status,
        'new_status', NEW.status
      )
    );
  end if;
  return NEW;
end $$;

create trigger proposal_status_notification
after update of status on public.proposals
for each row execute function public.on_proposal_status_changed();

-- ============================================================
-- TRIGGER TO SEND NOTIFICATIONS ON RECORD CREATION
-- ============================================================
create or replace function public.on_record_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.notify_management_update(
    'record_created',
    'New Record Added',
    'A new record "' || NEW.title || '" has been added to the repository',
    jsonb_build_object(
      'record_id', NEW.id,
      'category', NEW.category,
      'record_date', NEW.record_date
    )
  );
  return NEW;
end $$;

create trigger record_created_notification
after insert on public.records
for each row execute function public.on_record_created();

-- ============================================================
-- TRIGGER TO SEND NOTIFICATIONS ON HANDOVER CREATION
-- ============================================================
create or replace function public.on_handover_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.notify_management_update(
    'handover_created',
    'New Handover Document',
    'A handover document for session "' || NEW.session || '" has been created',
    jsonb_build_object(
      'handover_id', NEW.id,
      'session', NEW.session,
      'status', NEW.status
    )
  );
  return NEW;
end $$;

create trigger handover_created_notification
after insert on public.handovers
for each row execute function public.on_handover_created();

-- ============================================================
-- TRIGGER TO SEND NOTIFICATIONS ON HANDOVER COMPLETION
-- ============================================================
create or replace function public.on_handover_completed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if OLD.status is distinct from NEW.status and NEW.status = 'completed' then
    perform public.notify_management_update(
      'handover_completed',
      'Handover Completed',
      'Handover for session "' || NEW.session || '" has been completed',
      jsonb_build_object(
        'handover_id', NEW.id,
        'session', NEW.session
      )
    );
  end if;
  return NEW;
end $$;

create trigger handover_completed_notification
after update of status on public.handovers
for each row execute function public.on_handover_completed();

-- ============================================================
-- FUNCTION TO SET NEW EXECUTIVES AS CURRENT AND OLD AS NON-CURRENT
-- ============================================================
create or replace function public.set_current_executives(session text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Set all executives to non-current
  update public.executives
  set is_current = false
  where is_current = true;
  
  -- Set executives for the given session as current
  update public.executives
  set is_current = true
  where session = session;
  
  -- Notify admins about executive change
  perform public.notify_management_update(
    'executives_updated',
    'Executive Team Updated',
    'Executive team for session "' || session || '" has been set as current',
    jsonb_build_object('session', session)
  );
end $$;
