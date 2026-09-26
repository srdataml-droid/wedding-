-- Slice 1: vendor sign-up. One table. Read it in the Supabase dashboard.
create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  business_name text not null,
  category text not null,
  area text not null,
  whatsapp text not null,
  instagram text,
  years_active integer,
  -- Filled by hand in Slice 2 after Samuel has met or called the vendor.
  verified_at timestamptz,
  verified_note text
);

-- Lock the table to the public. The app writes with the service role key on the server only.
alter table public.vendors enable row level security;
