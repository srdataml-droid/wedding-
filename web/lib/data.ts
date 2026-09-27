import "server-only";
import { connection } from "next/server";
import { supabase } from "./supabase";

// Public reads. Row Level Security only returns verified, visible vendors and
// approved reviews, and never returns a reviewer's phone number.

export type PublicVendor = {
  id: string;
  slug: string;
  business_name: string;
  category: string;
  area: string;
  whatsapp: string;
  instagram: string | null;
  years_active: number | null;
  about: string | null;
  starting_price: number | null;
  verified_at: string;
  verified_note: string | null;
};

export type PublicReview = {
  id: string;
  created_at: string;
  reviewer_name: string;
  rating: number;
  body: string;
  wedding_month: string | null;
};

export type Rating = { average: number; count: number };

const VENDOR_COLUMNS =
  "id, slug, business_name, category, area, whatsapp, instagram, years_active, about, starting_price, verified_at, verified_note";

export async function getPublicVendors(): Promise<PublicVendor[]> {
  await connection();
  try {
    const { data, error } = await supabase()
      .from("vendors")
      .select(VENDOR_COLUMNS)
      .order("verified_at", { ascending: false })
      .limit(500);
    if (error) throw error;
    return ((data ?? []) as PublicVendor[]).filter((v) => v.slug);
  } catch (err) {
    console.error("public vendors read failed", err);
    return [];
  }
}

export async function getVendorBySlug(slug: string): Promise<PublicVendor | null> {
  await connection();
  try {
    const { data, error } = await supabase()
      .from("vendors")
      .select(VENDOR_COLUMNS)
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return (data as PublicVendor | null) ?? null;
  } catch (err) {
    console.error("vendor read failed", err);
    return null;
  }
}

export async function getRatings(): Promise<Map<string, Rating>> {
  await connection();
  const ratings = new Map<string, Rating>();
  try {
    const { data, error } = await supabase().from("reviews").select("vendor_id, rating").limit(5000);
    if (error) throw error;
    const sums = new Map<string, { total: number; count: number }>();
    for (const row of (data ?? []) as { vendor_id: string; rating: number }[]) {
      const s = sums.get(row.vendor_id) ?? { total: 0, count: 0 };
      s.total += row.rating;
      s.count += 1;
      sums.set(row.vendor_id, s);
    }
    for (const [id, s] of sums) ratings.set(id, { average: s.total / s.count, count: s.count });
  } catch (err) {
    console.error("ratings read failed", err);
  }
  return ratings;
}

export async function getApprovedReviews(vendorId: string): Promise<PublicReview[]> {
  await connection();
  try {
    const { data, error } = await supabase()
      .from("reviews")
      .select("id, created_at, reviewer_name, rating, body, wedding_month")
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return (data ?? []) as PublicReview[];
  } catch (err) {
    console.error("reviews read failed", err);
    return [];
  }
}
