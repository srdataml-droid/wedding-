-- Market (D-012): verified vendors show what they sell, products or services, with a price.
-- Couples ask the vendor on WhatsApp. There is no checkout: no money passes through Together.
-- A vendor manages their items through a private shop link that Samuel sends from /admin
-- after verifying them. Like the couple's edit link, only a SHA-256 hash of its token is
-- stored, and every change goes through a function below that checks it.

alter table public.vendors
  add column if not exists shop_token_hash text
    check (shop_token_hash is null or shop_token_hash ~ '^[0-9a-f]{64}$');

-- Until now the public key could read every column of a verified vendor. From here it reads
-- a fixed list, so the shop link's hash never leaves the database.
revoke select on public.vendors from anon, authenticated;
grant select (id, created_at, slug, business_name, category, area, whatsapp, instagram, years_active,
              about, starting_price, verified_at, verified_note, hidden_at)
  on public.vendors to anon;

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  kind text not null check (kind in ('product', 'service')),
  title text not null check (char_length(title) between 2 and 80),
  -- Naira. Empty means "ask for the price".
  price bigint check (price is null or price between 1 and 100000000000),
  -- Shown after the price, e.g. "per yard" or "for 100 guests".
  price_unit text check (price_unit is null or char_length(price_unit) between 1 and 24),
  description text check (description is null or char_length(description) <= 500),
  -- Listed under "Gifts" in the market, which anniversary reminders link to.
  gift boolean not null default false,
  -- Set by Samuel to take an item down.
  hidden_at timestamptz
);

create index if not exists listings_vendor_id_idx on public.listings (vendor_id);

alter table public.listings enable row level security;

-- Couples see the items of verified, visible vendors, unless Samuel has taken an item down.
create policy "items of public vendors are public"
  on public.listings
  for select
  to anon
  using (
    hidden_at is null
    and exists (
      select 1 from public.vendors v
      where v.id = vendor_id and v.verified_at is not null and v.hidden_at is null
    )
  );

-- Read-only for the public key. Vendors change items only through the functions below.
revoke all on public.listings from anon, authenticated;
grant select (id, created_at, vendor_id, kind, title, price, price_unit, description, gift, hidden_at)
  on public.listings to anon;

-- Enquiries can name the item a couple asked about. It must belong to the same public vendor.
alter table public.enquiries
  add column if not exists listing_id uuid references public.listings (id) on delete set null;

create index if not exists enquiries_listing_id_idx on public.enquiries (listing_id);

drop policy if exists "anyone can log an enquiry to a public vendor" on public.enquiries;

create policy "anyone can log an enquiry to a public vendor"
  on public.enquiries
  for insert
  to anon
  with check (
    exists (
      select 1 from public.vendors v
      where v.id = vendor_id and v.verified_at is not null and v.hidden_at is null
    )
    and (
      listing_id is null
      or exists (
        select 1 from public.listings l
        where l.id = listing_id and l.vendor_id = enquiries.vendor_id
      )
    )
  );

-- The vendor's side. Each function checks the private shop token before doing anything.

create or replace function public.shop_for_edit(p_slug text, p_token text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'business_name', v.business_name,
    'slug', v.slug,
    'verified', v.verified_at is not null,
    'hidden', v.hidden_at is not null,
    'items', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', l.id,
          'kind', l.kind,
          'title', l.title,
          'price', l.price,
          'price_unit', l.price_unit,
          'description', l.description,
          'gift', l.gift,
          'hidden', l.hidden_at is not null
        )
        order by l.created_at desc
      )
      from public.listings l
      where l.vendor_id = v.id
    ), '[]'::jsonb)
  )
  from public.vendors v
  where v.slug = p_slug
    and v.shop_token_hash = encode(sha256(convert_to(p_token, 'UTF8')), 'hex');
$$;

-- Adds an item when p_id is null, otherwise changes that item. Returns 'added', 'saved',
-- 'full' (30 items is the most a shop can have), or null when the link or item is wrong.
create or replace function public.save_listing(p_slug text, p_token text, p_id uuid, p_fields jsonb)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_vendor uuid;
begin
  select v.id into v_vendor
  from public.vendors v
  where v.slug = p_slug
    and v.shop_token_hash = encode(sha256(convert_to(p_token, 'UTF8')), 'hex');

  if v_vendor is null then
    return null;
  end if;

  if p_id is null then
    if (select count(*) from public.listings l where l.vendor_id = v_vendor) >= 30 then
      return 'full';
    end if;
    insert into public.listings (vendor_id, kind, title, price, price_unit, description, gift)
    values (
      v_vendor,
      p_fields->>'kind',
      p_fields->>'title',
      (p_fields->>'price')::bigint,
      nullif(p_fields->>'price_unit', ''),
      nullif(p_fields->>'description', ''),
      coalesce((p_fields->>'gift')::boolean, false)
    );
    return 'added';
  end if;

  update public.listings set
    kind = p_fields->>'kind',
    title = p_fields->>'title',
    price = (p_fields->>'price')::bigint,
    price_unit = nullif(p_fields->>'price_unit', ''),
    description = nullif(p_fields->>'description', ''),
    gift = coalesce((p_fields->>'gift')::boolean, false),
    updated_at = now()
  where id = p_id and vendor_id = v_vendor;

  if not found then
    return null;
  end if;
  return 'saved';
end;
$$;

create or replace function public.delete_listing(p_slug text, p_token text, p_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  delete from public.listings l
  using public.vendors v
  where l.id = p_id
    and l.vendor_id = v.id
    and v.slug = p_slug
    and v.shop_token_hash = encode(sha256(convert_to(p_token, 'UTF8')), 'hex');
  get diagnostics v_count = row_count;
  return v_count > 0;
end;
$$;

-- Supabase grants new functions to signed-in users as well. This app has none, so only the
-- anonymous role (the site, through its server) may call these, and each checks the token.
revoke all on function public.shop_for_edit(text, text) from public, authenticated;
revoke all on function public.save_listing(text, text, uuid, jsonb) from public, authenticated;
revoke all on function public.delete_listing(text, text, uuid) from public, authenticated;
grant execute on function public.shop_for_edit(text, text) to anon;
grant execute on function public.save_listing(text, text, uuid, jsonb) to anon;
grant execute on function public.delete_listing(text, text, uuid) to anon;
