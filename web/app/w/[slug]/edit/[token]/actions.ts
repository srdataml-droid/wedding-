"use server";

import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getPublicVendors } from "@/lib/data";
import { CHECKLIST_IDS } from "@/lib/checklist";
import { isIsoDate, isSlug, isUuid, text } from "@/lib/format";
import { EVENT_SLOTS, isToken, type WeddingEvent } from "@/lib/weddings";

function editBase(slug: string, token: string) {
  if (!isSlug(slug) || !isToken(token)) redirect("/");
  return `/w/${slug}/edit/${token}`;
}

// Every save goes through update_wedding, which checks the token in the database.
async function save(slug: string, token: string, fields: Record<string, unknown>, section: string) {
  const base = editBase(slug, token);
  let ok = false;
  try {
    const { data, error } = await supabase().rpc("update_wedding", {
      p_slug: slug,
      p_token: token,
      p_fields: fields,
    });
    if (error) console.error("wedding update failed", error);
    else ok = data === true;
  } catch (err) {
    console.error("wedding update failed", err);
  }
  redirect(ok ? `${base}?saved=${section}#${section}` : `${base}?error=save#${section}`);
}

export async function saveDetails(slug: string, token: string, formData: FormData) {
  const base = editBase(slug, token);
  const partnerOne = text(formData, "partner_one", 60);
  const partnerTwo = text(formData, "partner_two", 60);
  const weddingDate = text(formData, "wedding_date", 10);
  const hashtag = text(formData, "hashtag", 41)
    .replace(/^#/, "")
    .replace(/[^A-Za-z0-9_]/g, "")
    .slice(0, 40);

  if (!partnerOne || !partnerTwo) redirect(`${base}?error=names#details`);
  if (weddingDate && !isIsoDate(weddingDate)) redirect(`${base}?error=date#details`);

  await save(
    slug,
    token,
    {
      partner_one: partnerOne,
      partner_two: partnerTwo,
      wedding_date: weddingDate,
      hashtag,
      story: text(formData, "story", 2000),
      aso_ebi: text(formData, "aso_ebi", 600),
      rsvp_open: formData.get("rsvp_open") === "on",
    },
    "details",
  );
}

export async function saveEvents(slug: string, token: string, formData: FormData) {
  const events: WeddingEvent[] = [];
  for (let i = 0; i < EVENT_SLOTS; i++) {
    const event: WeddingEvent = {
      title: text(formData, `event_${i}_title`, 80),
      date: text(formData, `event_${i}_date`, 10),
      time: text(formData, `event_${i}_time`, 5),
      venue: text(formData, `event_${i}_venue`, 120),
      address: text(formData, `event_${i}_address`, 200),
    };
    if (event.date && !isIsoDate(event.date)) event.date = "";
    if (event.time && !/^\d{2}:\d{2}$/.test(event.time)) event.time = "";
    // A title on its own is just the placeholder, so it needs a date or a place to count.
    if (event.title && (event.date || event.venue || event.address)) events.push(event);
  }
  await save(slug, token, { events }, "events");
}

export async function saveVendors(slug: string, token: string, formData: FormData) {
  const chosen = formData.getAll("vendor").filter((v): v is string => typeof v === "string" && isUuid(v));
  const publicIds = new Set((await getPublicVendors()).map((v) => v.id));
  const vendorIds = [...new Set(chosen)].filter((id) => publicIds.has(id)).slice(0, 20);
  await save(slug, token, { vendor_ids: vendorIds }, "vendors");
}

export async function saveChecklist(slug: string, token: string, formData: FormData) {
  const done: Record<string, boolean> = {};
  for (const value of formData.getAll("done")) {
    if (typeof value === "string" && CHECKLIST_IDS.has(value)) done[value] = true;
  }
  await save(slug, token, { checklist: done }, "checklist");
}

export async function deleteWedding(slug: string, token: string, formData: FormData) {
  const base = editBase(slug, token);
  if (text(formData, "confirm", 3) !== "yes") redirect(`${base}?error=confirm#delete`);

  let ok = false;
  try {
    const { data, error } = await supabase().rpc("delete_wedding", { p_slug: slug, p_token: token });
    if (error) console.error("wedding delete failed", error);
    else ok = data === true;
  } catch (err) {
    console.error("wedding delete failed", err);
  }
  redirect(ok ? "/start?deleted=1" : `${base}?error=save#delete`);
}
