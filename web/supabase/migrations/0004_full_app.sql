-- Full app v1 (D-009): public directory of verified vendors, moderated reviews, enquiry log.
-- The page still uses only the publishable key. Row Level Security decides what it may do.
-- The admin page uses the secret key on the server and bypasses these policies.

-- Vendors: a public address, a line about their work, an optional starting price,
-- and a way for Samuel to hide someone without deleting them.
alter table public.vendors
  add column if not exists slug text unique,
  add column if not exists about text check (about is null or char_length(about) <= 280),
  add column if not exists starting_price integer check (starting_price is null or starting_price >= 0),
  add column if not exists hidden_at timestamptz;

-- Couples see vendors Samuel has verified and not hidden. Nothing else.
-- Their WhatsApp number is public by design: the profile's contact button uses it,
-- and the sign-up form tells vendors so.
create policy "verified vendors are public"
  on public.vendors
  for select
  to anon
  using (verified_at is not null and hidden_at is null);

-- Reviews: anyone can submit one for a public vendor. It stays hidden until Samuel approves it.
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  reviewer_name text not null check (char_length(reviewer_name) between 1 and 80),
  -- Private. Used only to confirm the review came from a real couple.
  reviewer_whatsapp text not null check (char_length(reviewer_whatsapp) between 10 and 20),
  rating smallint not null check (rating between 1 and 5),
  body text not null check (char_length(body) between 10 and 1000),
  -- First day of the wedding month, when the couple gives one.
  wedding_month date,
  approved_at timestamptz
);

create index if not exists reviews_vendor_id_idx on public.reviews (vendor_id);

alter table public.reviews enable row level security;

create policy "anyone can review a public vendor"
  on public.reviews
  for insert
  to anon
  with check (
    approved_at is null
    and exists (
      select 1 from public.vendors v
      where v.id = vendor_id and v.verified_at is not null and v.hidden_at is null
    )
  );

create policy "approved reviews are public"
  on public.reviews
  for select
  to anon
  using (approved_at is not null);

-- The reviewer's phone number never leaves the database through the public key.
revoke select on public.reviews from anon, authenticated;
grant select (id, created_at, vendor_id, reviewer_name, rating, body, wedding_month, approved_at)
  on public.reviews to anon;

-- Enquiries: one row each time a couple taps "Message on WhatsApp". Write-only for the public.
-- This is the number that shows a vendor Together sends them business.
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  vendor_id uuid not null references public.vendors (id) on delete cascade
);

create index if not exists enquiries_vendor_id_created_at_idx on public.enquiries (vendor_id, created_at);

alter table public.enquiries enable row level security;

create policy "anyone can log an enquiry to a public vendor"
  on public.enquiries
  for insert
  to anon
  with check (
    exists (
      select 1 from public.vendors v
      where v.id = vendor_id and v.verified_at is not null and v.hidden_at is null
    )
  );
