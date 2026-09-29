-- Anniversary reminders (D-012). A couple can ask Together for one WhatsApp message a year,
-- about two weeks before their anniversary, with gift ideas from the market. Samuel sends
-- it by hand from /admin. The number and the date the couple agreed are private: the public
-- key cannot read them (weddings has column grants, see 0005), only the couple's private
-- link and /admin can, and they are deleted with the website.

alter table public.weddings
  -- Digits only, with the country code, as wa.me needs it: 2348031234567.
  add column if not exists reminder_whatsapp text
    check (reminder_whatsapp is null or reminder_whatsapp ~ '^[0-9]{10,15}$'),
  -- Set by the database when the couple ticks the consent box. Cleared when they stop.
  add column if not exists reminder_consent_at timestamptz,
  -- The day Samuel last sent one, so nobody gets two for the same anniversary.
  add column if not exists reminder_sent_on date;

-- No number without a recorded yes, and no yes left behind without a number.
alter table public.weddings
  add constraint weddings_reminder_needs_consent
    check ((reminder_whatsapp is null) = (reminder_consent_at is null));

-- Same function as in 0007, plus the reminder. The consent time is set here, by the
-- database, never taken from the form. An empty number stops the reminders.
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
    reminder_whatsapp = case when p_fields ? 'reminder_whatsapp'
      then nullif(p_fields->>'reminder_whatsapp', '') else reminder_whatsapp end,
    reminder_consent_at = case when p_fields ? 'reminder_whatsapp'
      then case when nullif(p_fields->>'reminder_whatsapp', '') is null then null else now() end
      else reminder_consent_at end,
    updated_at = now()
  where id = v_id;

  return true;
end;
$$;
