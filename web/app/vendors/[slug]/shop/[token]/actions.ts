"use server";

import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { parseNaira } from "@/lib/budget";
import { isSlug, isUuid, text } from "@/lib/format";
import { isToken } from "@/lib/tokens";

// The vendor's side of the market (D-012). Every change goes through a database function
// that checks the token in the private shop link.

function shopBase(slug: string, token: string) {
  if (!isSlug(slug) || !isToken(token)) redirect("/");
  return `/vendors/${slug}/shop/${token}`;
}

type ItemFields = {
  kind: string;
  title: string;
  price: number | null;
  price_unit: string;
  description: string;
  gift: boolean;
};

function readItem(formData: FormData): { fields: ItemFields } | { error: string } {
  const kind = text(formData, "kind", 10);
  const title = text(formData, "title", 80);
  const priceRaw = text(formData, "price", 20);
  const price = priceRaw ? parseNaira(priceRaw) : null;

  if ((kind !== "product" && kind !== "service") || title.length < 2) return { error: "missing" };
  if (priceRaw && (price === null || price < 1)) return { error: "price" };

  return {
    fields: {
      kind,
      title,
      price,
      price_unit: text(formData, "price_unit", 24),
      description: text(formData, "description", 500),
      gift: formData.get("gift") === "on",
    },
  };
}

async function saveItem(slug: string, token: string, id: string | null, fields: ItemFields) {
  try {
    const { data, error } = await supabase().rpc("save_listing", {
      p_slug: slug,
      p_token: token,
      p_id: id,
      p_fields: fields,
    });
    if (error) {
      console.error("item save failed", error);
      return null;
    }
    return data as string | null;
  } catch (err) {
    console.error("item save failed", err);
    return null;
  }
}

export async function addItem(slug: string, token: string, formData: FormData) {
  const base = shopBase(slug, token);
  const item = readItem(formData);
  if ("error" in item) redirect(`${base}?error=${item.error}#add`);

  const result = await saveItem(slug, token, null, item.fields);
  if (result === "full") redirect(`${base}?error=full#items`);
  redirect(result === "added" ? `${base}?saved=added#items` : `${base}?error=save#add`);
}

export async function updateItem(slug: string, token: string, formData: FormData) {
  const base = shopBase(slug, token);
  const id = text(formData, "id", 36);
  if (!isUuid(id)) redirect(`${base}?error=save#items`);
  const item = readItem(formData);
  if ("error" in item) redirect(`${base}?error=${item.error}#item-${id}`);

  const result = await saveItem(slug, token, id, item.fields);
  redirect(result === "saved" ? `${base}?saved=saved#item-${id}` : `${base}?error=save#item-${id}`);
}

export async function removeItem(slug: string, token: string, formData: FormData) {
  const base = shopBase(slug, token);
  const id = text(formData, "id", 36);
  if (!isUuid(id)) redirect(`${base}?error=save#items`);
  if (text(formData, "confirm", 3) !== "yes") redirect(`${base}?error=confirm#item-${id}`);

  let ok = false;
  try {
    const { data, error } = await supabase().rpc("delete_listing", { p_slug: slug, p_token: token, p_id: id });
    if (error) console.error("item delete failed", error);
    else ok = data === true;
  } catch (err) {
    console.error("item delete failed", err);
  }
  redirect(ok ? `${base}?saved=removed#items` : `${base}?error=save#items`);
}
