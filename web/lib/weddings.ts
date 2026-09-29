import "server-only";
import { connection } from "next/server";
import { supabase } from "./supabase";
import type { PublicVendor } from "./data";

// Wedding websites (D-010). Guests read the public page with the publishable key.
// The couple reaches their edit page through a private link that carries a token;
// the database stores only its SHA-256 hash and checks it in every couple function.

export type WeddingEvent = {
  title: string;
  date: string; // YYYY-MM-DD or ""
  time: string; // HH:MM or ""
  venue: string;
  address: string;
};

export type PublicWedding = {
  id: string;
  created_at: string;
  slug: string;
  partner_one: string;
  partner_two: string;
  wedding_date: string | null;
  hashtag: string | null;
  story: string | null;
  aso_ebi: string | null;
  events: WeddingEvent[];
  vendor_ids: string[];
  rsvp_open: boolean;
  theme: string;
};

export type EditableWedding = PublicWedding & {
  checklist: Record<string, boolean>;
  budget: unknown;
  hidden_at: string | null;
};

export type Rsvp = {
  created_at: string;
  guest_name: string;
  attending: boolean;
  party_size: number;
  phone: string | null;
  message: string | null;
};

// The edit page offers this many event slots. Empty ones start with these titles.
export const EVENT_SLOTS = 4;
export const DEFAULT_EVENT_TITLES = ["Traditional wedding", "Church wedding", "Reception", ""];

const PUBLIC_COLUMNS =
  "id, created_at, slug, partner_one, partner_two, wedding_date, hashtag, story, aso_ebi, events, vendor_ids, rsvp_open, theme";

export async function getPublicWedding(slug: string): Promise<PublicWedding | null> {
  await connection();
  try {
    const { data, error } = await supabase().from("weddings").select(PUBLIC_COLUMNS).eq("slug", slug).maybeSingle();
    if (error) throw error;
    return (data as PublicWedding | null) ?? null;
  } catch (err) {
    console.error("wedding read failed", err);
    return null;
  }
}

export async function getWeddingForEdit(slug: string, token: string): Promise<EditableWedding | null> {
  await connection();
  try {
    const { data, error } = await supabase().rpc("wedding_for_edit", { p_slug: slug, p_token: token });
    if (error) throw error;
    return (data as EditableWedding | null) ?? null;
  } catch (err) {
    console.error("wedding edit read failed", err);
    return null;
  }
}

export async function getRsvps(slug: string, token: string): Promise<Rsvp[]> {
  try {
    const { data, error } = await supabase().rpc("wedding_rsvps", { p_slug: slug, p_token: token });
    if (error) throw error;
    return (data ?? []) as Rsvp[];
  } catch (err) {
    console.error("rsvp read failed", err);
    return [];
  }
}

// Credited vendors, read with the public key, so a vendor who is hidden or
// unverified later simply drops off every wedding site.
export async function getVendorsByIds(ids: string[]): Promise<PublicVendor[]> {
  if (ids.length === 0) return [];
  try {
    const { data, error } = await supabase()
      .from("vendors")
      .select("id, slug, business_name, category, area, whatsapp, instagram, years_active, about, starting_price, verified_at, verified_note")
      .in("id", ids);
    if (error) throw error;
    return ((data ?? []) as PublicVendor[]).filter((v) => v.slug);
  } catch (err) {
    console.error("credited vendors read failed", err);
    return [];
  }
}

export function sortEvents(events: WeddingEvent[]) {
  return [...events].sort((a, b) => {
    if (a.date && b.date) return (a.date + a.time).localeCompare(b.date + b.time);
    if (a.date) return -1;
    if (b.date) return 1;
    return 0;
  });
}
