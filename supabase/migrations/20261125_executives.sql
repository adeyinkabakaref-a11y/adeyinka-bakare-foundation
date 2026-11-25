-- ============================================================
-- Executives
-- Powers the public /executives page and the executive showcase on Home and
-- About. Managed from the admin dashboard. Safe to re-run.
--
-- Access rules mirror lib/auth/permissions.ts:
--   public       read published rows only
--   editor       read, create, update
--   admin        read, create, update, delete
--   super_admin  everything
-- ============================================================

-- ---------- Table ----------
create table if not exists public.executives (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  position text not null,
  bio text,
  photo text,
  linkedin_url text,
  twitter_url text,
  instagram_url text,
  display_order integer not null default 0,
  featured boolean not null default false,
  status public.record_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_executives_status_order
  on public.executives(status, display_order);

create index if not exists idx_executives_featured
  on public.executives(featured)
  where featured = true;

drop trigger if exists executives_set_updated_at on public.executives;
create trigger executives_set_updated_at
before update on public.executives
for each row execute function public.set_updated_at();

drop trigger if exists executives_audit on public.executives;
create trigger executives_audit
after insert or update or delete on public.executives
for each row execute function public.write_audit_log();

-- ---------- Row-level security ----------
alter table public.executives enable row level security;

drop policy if exists "public can read published executives" on public.executives;
create policy "public can read published executives"
on public.executives for select
to anon, authenticated
using (status = 'published');

drop policy if exists "staff can read executives" on public.executives;
create policy "staff can read executives"
on public.executives for select
to authenticated
using (public.has_admin_role());

drop policy if exists "staff can create executives" on public.executives;
create policy "staff can create executives"
on public.executives for insert
to authenticated
with check (public.has_admin_role());

drop policy if exists "staff can update executives" on public.executives;
create policy "staff can update executives"
on public.executives for update
to authenticated
using (public.has_admin_role())
with check (public.has_admin_role());

drop policy if exists "admins can delete executives" on public.executives;
create policy "admins can delete executives"
on public.executives for delete
to authenticated
using (public.has_admin_role(array['super_admin','admin']::public.user_role[]));

-- ---------- Public storage bucket for executive photos ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'executive-images',
  'executive-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Anyone can view the photos; only signed-in staff can change them.
drop policy if exists "Executive images are viewable by everyone" on storage.objects;
create policy "Executive images are viewable by everyone"
on storage.objects for select
to public
using (bucket_id = 'executive-images');

drop policy if exists "Staff can upload executive images" on storage.objects;
create policy "Staff can upload executive images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'executive-images' and public.has_admin_role());

drop policy if exists "Staff can update executive images" on storage.objects;
create policy "Staff can update executive images"
on storage.objects for update
to authenticated
using (bucket_id = 'executive-images' and public.has_admin_role())
with check (bucket_id = 'executive-images' and public.has_admin_role());

drop policy if exists "Admins can delete executive images" on storage.objects;
create policy "Admins can delete executive images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'executive-images'
  and public.has_admin_role(array['super_admin','admin']::public.user_role[])
);
