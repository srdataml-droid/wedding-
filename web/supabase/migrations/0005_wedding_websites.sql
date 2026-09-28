-- Wedding websites (D-010): a couple makes a free site with events, aso-ebi details,
-- credited vendors and RSVP. No accounts. The couple edits through a private link.
-- Only a SHA-256 hash of that link's token is stored, never the token itself.
-- Everything a couple does goes through the security definer functions below, which
-- check the token. The public key never sees the hash, the checklist or any RSVP.

create table if not exists public.weddings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{3,60}$'),
  edit_token_hash text not null check (edit_token_hash ~ '^[0-9a-f]{64}$'),
  partner_one text not null check (char_length(partner_one) between 1 and 60),
  partner_two text not null check (char_length(partner_two) between 1 and 60),
  wedding_date date,
  hashtag text check (hashtag is null or char_length(hashtag) <= 40),
  story text check (story is null or char_length(story) <= 2000),
  aso_ebi text check (aso_ebi is null or char_length(aso_ebi) <= 600),
  -- [{ "title", "date": "YYYY-MM-DD", "time": "HH:MM", "venue", "address" }]
  events jsonb not null default '[]'::jsonb
    check (jsonb_typeof(events) = 'array' and jsonb_array_length(events) <= 6),
  -- Verified Together vendors the couple credits on their site.
  vendor_ids uuid[] not null default '{}' check (cardinality(vendor_ids) <= 20),
  rsvp_open boolean not null default true,
  -- Private to the couple: { "item-id": true }
  checklist jsonb not null default '{}'::jsonb check (jsonb_typeof(checklist) = 'object'),
  -- Set by Samuel to take a site down.
  hidden_at timestamptz
);

alter table public.weddings enable row level security;

create policy "anyone can create a wedding website"
  on public.weddings
  for insert
  to anon
  with check (hidden_at is null);

create policy "visible wedding websites are public"
  on public.weddings
  for select
  to anon
  using (hidden_at is null);

-- The token hash and the checklist never leave the database through the public key.
revoke select on public.weddings from anon, authenticated;
grant select (id, created_at, slug, partner_one, partner_two, wedding_date, hashtag, story, aso_ebi,
              events, vendor_ids, rsvp_open, hidden_at)
  on public.weddings to anon;

-- RSVPs: guests can send one. Nobody can read them with the public key.
create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  wedding_id uuid not null references public.weddings (id) on delete cascade,
  guest_name text not null check (char_length(guest_name) between 1 and 80),
  attending boolean not null,
  party_size smallint not null default 1 check (party_size between 1 and 10),
  phone text check (phone is null or char_length(phone) between 10 and 20),
  message text check (message is null or char_length(message) <= 500)
);

create index if not exists rsvps_wedding_id_idx on public.rsvps (wedding_id);

alter table public.rsvps enable row level security;

create policy "guests can reply to an open, visible wedding"
  on public.rsvps
  for insert
  to anon
  with check (
    exists (
      select 1 from public.weddings w
      where w.id = wedding_id and w.hidden_at is null and w.rsvp_open
    )
  );

revoke select on public.rsvps from anon, authenticated;

-- The couple's side. Each function checks the private token before doing anything.

create or replace function public.wedding_for_edit(p_slug text, p_token text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select to_jsonb(w) - 'edit_token_hash'
  from public.weddings w
  where w.slug = p_slug
    and w.edit_token_hash = encode(sha256(convert_to(p_token, 'UTF8')), 'hex');
$$;

create or replace function public.update_wedding(p_slug text, p_token text, p_fields jsonb)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  select w.id into v_id
  from public.weddings w
  where w.slug = p_slug
    and w.edit_token_hash = encode(sha256(convert_to(p_token, 'UTF8')), 'hex')
    and w.hidden_at is null;

  if v_id is null then
    return false;
  end if;

  update public.weddings set
    partner_one = case when p_fields ? 'partner_one' then p_fields->>'partner_one' else partner_one end,
    partner_two = case when p_fields ? 'partner_two' then p_fields->>'partner_two' else partner_two end,
    wedding_date = case when p_fields ? 'wedding_date'
      then nullif(p_fields->>'wedding_date', '')::date else wedding_date end,
    hashtag = case when p_fields ? 'hashtag' then nullif(p_fields->>'hashtag', '') else hashtag end,
    story = case when p_fields ? 'story' then nullif(p_fields->>'story', '') else story end,
    aso_ebi = case when p_fields ? 'aso_ebi' then nullif(p_fields->>'aso_ebi', '') else aso_ebi end,
    rsvp_open = case when p_fields ? 'rsvp_open' then (p_fields->>'rsvp_open')::boolean else rsvp_open end,
    events = case when p_fields ? 'events' then p_fields->'events' else events end,
    vendor_ids = case when p_fields ? 'vendor_ids'
      then array(select jsonb_array_elements_text(p_fields->'vendor_ids')::uuid) else vendor_ids end,
    checklist = case when p_fields ? 'checklist' then p_fields->'checklist' else checklist end,
    updated_at = now()
  where id = v_id;

  return true;
end;
$$;

create or replace function public.wedding_rsvps(p_slug text, p_token text)
returns table (
  created_at timestamptz,
  guest_name text,
  attending boolean,
  party_size smallint,
  phone text,
  message text
)
language sql
stable
security definer
set search_path = ''
as $$
  select r.created_at, r.guest_name, r.attending, r.party_size, r.phone, r.message
  from public.rsvps r
  join public.weddings w on w.id = r.wedding_id
  where w.slug = p_slug
    and w.edit_token_hash = encode(sha256(convert_to(p_token, 'UTF8')), 'hex')
  order by r.created_at desc;
$$;

create or replace function public.delete_wedding(p_slug text, p_token text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  delete from public.weddings w
  where w.slug = p_slug
    and w.edit_token_hash = encode(sha256(convert_to(p_token, 'UTF8')), 'hex');
  get diagnostics v_count = row_count;
  return v_count > 0;
end;
$$;

revoke all on function public.wedding_for_edit(text, text) from public;
revoke all on function public.update_wedding(text, text, jsonb) from public;
revoke all on function public.wedding_rsvps(text, text) from public;
revoke all on function public.delete_wedding(text, text) from public;
grant execute on function public.wedding_for_edit(text, text) to anon;
grant execute on function public.update_wedding(text, text, jsonb) to anon;
grant execute on function public.wedding_rsvps(text, text) to anon;
grant execute on function public.delete_wedding(text, text) to anon;
