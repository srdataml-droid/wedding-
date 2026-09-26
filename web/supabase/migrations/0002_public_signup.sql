-- Slice 1: the page uses the publishable key. Row Level Security decides what it may do.

-- Anyone may add a sign-up. Nobody outside the dashboard may read, change or delete rows,
-- and nobody can mark themselves verified: that stays a by-hand step in the dashboard.
create policy "anyone can sign up"
  on public.vendors
  for insert
  to anon
  with check (verified_at is null and verified_note is null);

-- The page shows how many vendors have signed up. Only the number leaves the database.
create or replace function public.vendor_count()
returns bigint
language sql
stable
security definer
set search_path = ''
as $$
  select count(*) from public.vendors;
$$;

revoke all on function public.vendor_count() from public;
grant execute on function public.vendor_count() to anon;
