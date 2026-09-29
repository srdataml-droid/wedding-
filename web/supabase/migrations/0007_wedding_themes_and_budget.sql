-- More like The Knot or Zola (D-011): a design for each wedding website, and a private
-- budget tracker for the couple. The budget stores numbers only; no money moves.

alter table public.weddings
  add column if not exists theme text not null default 'wine'
    check (theme in ('wine', 'emerald', 'royal', 'coral')),
  -- Private to the couple: { "target": 5000000, "lines": { "venue": { "planned": 1500000, "paid": 500000 } } }
  add column if not exists budget jsonb not null default '{}'::jsonb
    check (jsonb_typeof(budget) = 'object');

-- Guests need the design to draw the page. The budget stays private, like the checklist.
grant select (theme) on public.weddings to anon;

-- Same function as in 0005, plus theme and budget.
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
    theme = case when p_fields ? 'theme' then p_fields->>'theme' else theme end,
    budget = case when p_fields ? 'budget' then p_fields->'budget' else budget end,
    updated_at = now()
  where id = v_id;

  return true;
end;
$$;
