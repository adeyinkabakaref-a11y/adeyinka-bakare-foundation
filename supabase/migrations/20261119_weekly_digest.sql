-- Weekly digest: idempotent run tracker for the public cron endpoint.
-- Safe to re-run. The endpoint also falls back to email_logs when this table
-- has not been applied yet, so deploying code before this migration is fine.

create table if not exists public.weekly_digest_runs (
  week_key text primary key,
  week_start timestamptz not null,
  week_end timestamptz not null,
  status text not null default 'running'
    check (status in ('running', 'sent', 'failed', 'skipped')),
  member_recipients integer not null default 0,
  admin_recipients integer not null default 0,
  emails_sent integer not null default 0,
  emails_failed integer not null default 0,
  error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists weekly_digest_runs_created_at_idx
  on public.weekly_digest_runs (created_at desc);

alter table public.weekly_digest_runs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where policyname = 'Admins can read weekly digest runs'
  ) then
    create policy "Admins can read weekly digest runs"
      on public.weekly_digest_runs for select
      using (
        exists (
          select 1 from public.profiles p
          where p.id = auth.uid() and p.role in ('super_admin', 'admin')
        )
      );
  end if;
end $$;
