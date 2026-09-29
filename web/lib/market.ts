import "server-only";
import { connection } from "next/server";
import { supabase } from "./supabase";
import { formatNaira } from "./format";

// The market (D-012). Items are read with the public key, so only items of verified,
// visible vendors come back, and never one Samuel has taken down. A vendor reads and
// changes their own items on their shop page, through functions that check the token
// in their private shop link.

export type ItemKind = "product" | "service";

export type MarketItem = {
  id: string;
  created_at: string;
  kind: ItemKind;
  title: string;
  price: number | null;
  price_unit: string | null;
  description: string | null;
  gift: boolean;
  vendor: { id: string; slug: string; business_name: string; category: string; area: string };
};

export type ShopItem = Omit<MarketItem, "created_at" | "vendor"> & { hidden: boolean };

export type Shop = {
  business_name: string;
  slug: string;
  verified: boolean;
  hidden: boolean;
  items: ShopItem[];
};

// The most items one shop can have. The database enforces the same number.
export const MAX_ITEMS = 30;

const ITEM_COLUMNS =
  "id, created_at, kind, title, price, price_unit, description, gift, vendor:vendors!inner(id, slug, business_name, category, area)";

export function priceLabel(item: { price: number | null; price_unit: string | null }) {
  if (item.price === null) return "Ask for the price";
  return item.price_unit ? `${formatNaira(item.price)} ${item.price_unit}` : formatNaira(item.price);
}

export async function getMarketItems(): Promise<MarketItem[]> {
  await connection();
  try {
    const { data, error } = await supabase()
      .from("listings")
      .select(ITEM_COLUMNS)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw error;
    return (data ?? []) as unknown as MarketItem[];
  } catch (err) {
    console.error("market read failed", err);
    return [];
  }
}

export async function getVendorItems(vendorId: string): Promise<MarketItem[]> {
  await connection();
  try {
    const { data, error } = await supabase()
      .from("listings")
      .select(ITEM_COLUMNS)
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return (data ?? []) as unknown as MarketItem[];
  } catch (err) {
    console.error("vendor items read failed", err);
    return [];
  }
}

export async function getMarketItem(id: string): Promise<MarketItem | null> {
  try {
    const { data, error } = await supabase().from("listings").select(ITEM_COLUMNS).eq("id", id).maybeSingle();
    if (error) throw error;
    return (data as unknown as MarketItem | null) ?? null;
  } catch (err) {
    console.error("market item read failed", err);
    return null;
  }
}

export async function getShop(slug: string, token: string): Promise<Shop | null> {
  await connection();
  try {
    const { data, error } = await supabase().rpc("shop_for_edit", { p_slug: slug, p_token: token });
    if (error) throw error;
    return (data as Shop | null) ?? null;
  } catch (err) {
    console.error("shop read failed", err);
    return null;
  }
}
