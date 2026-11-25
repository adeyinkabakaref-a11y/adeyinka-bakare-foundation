-- Add unique constraints to prevent duplicate registrations by email

-- Members table
do $$
begin
  -- Drop existing unique constraint if it exists
  alter table public.members drop constraint if exists members_email_key;

  -- Add unique constraint on email (only for non-null emails)
  create unique index members_email_unique on public.members (lower(email)) where email is not null;
exception
  when duplicate_object then null;
end $$;

-- Volunteers table
do $$
begin
  -- Drop existing unique constraint if it exists
  alter table public.volunteers drop constraint if exists volunteers_email_key;

  -- Add unique constraint on email
  create unique index volunteers_email_unique on public.volunteers (lower(email));
exception
  when duplicate_object then null;
end $$;
