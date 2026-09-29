"use server";

import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getPublicVendors } from "@/lib/data";
import { CHECKLIST_IDS } from "@/lib/checklist";
import { BUDGET_LINES, parseNaira, type BudgetLine } from "@/lib/budget";
import { isThemeId } from "@/lib/themes";
import { isIsoDate, isSlug, isUuid, text, waNumber } from "@/lib/format";
import { isToken } from "@/lib/tokens";
import { EVENT_SLOTS, type WeddingEvent } from "@/lib/weddings";

function editBase(slug: string, token: string) {
  if (!isSlug(slug) || !isToken(token)) redirect("/");
  return `/w/${slug}/edit/${token}`;
}

function back(slug: string, token: string, tab: string, section: string, params: string) {
  return `${editBase(slug, token)}?tab=${tab}&${params}#${section}`;
}

// Every save goes through update_wedding, which checks the token in the database.
async function save(slug: string, token: string, fields: Record<string, unknown>, tab: string, section: string) {
  editBase(slug, token);
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
  redirect(back(slug, token, tab, section, ok ? `saved=${section}` : "error=save"));
}

export async function saveDetails(slug: string, token: string, formData: FormData) {
  const partnerOne = text(formData, "partner_one", 60);
  const partnerTwo = text(formData, "partner_two", 60);
  const weddingDate = text(formData, "wedding_date", 10);
  const hashtag = text(formData, "hashtag", 41)
    .replace(/^#/, "")
    .replace(/[^A-Za-z0-9_]/g, "")
    .slice(0, 40);

  if (!partnerOne || !partnerTwo) redirect(back(slug, token, "website", "details", "error=names"));
  if (weddingDate && !isIsoDate(weddingDate)) redirect(back(slug, token, "website", "details", "error=date"));

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
    "website",
    "details",
  );
}

export async function saveTheme(slug: string, token: string, formData: FormData) {
  const theme = text(formData, "theme", 20);
  if (!isThemeId(theme)) redirect(back(slug, token, "website", "design", "error=save"));
  await save(slug, token, { theme }, "website", "design");
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
  await save(slug, token, { events }, "website", "events");
}

export async function saveVendors(slug: string, token: string, formData: FormData) {
  const chosen = formData.getAll("vendor").filter((v): v is string => typeof v === "string" && isUuid(v));
  const publicIds = new Set((await getPublicVendors()).map((v) => v.id));
  const vendorIds = [...new Set(chosen)].filter((id) => publicIds.has(id)).slice(0, 20);
  await save(slug, token, { vendor_ids: vendorIds }, "vendors", "vendors");
}

export async function saveChecklist(slug: string, token: string, formData: FormData) {
  const done: Record<string, boolean> = {};
  for (const value of formData.getAll("done")) {
    if (typeof value === "string" && CHECKLIST_IDS.has(value)) done[value] = true;
  }
  await save(slug, token, { checklist: done }, "checklist", "checklist");
}

export async function saveBudget(slug: string, token: string, formData: FormData) {
  const lines: Record<string, BudgetLine> = {};
  for (const { id } of BUDGET_LINES) {
    const planned = parseNaira(text(formData, `planned_${id}`, 20));
    const paid = parseNaira(text(formData, `paid_${id}`, 20));
    if (planned !== null || paid !== null) lines[id] = { planned, paid };
  }
  const target = parseNaira(text(formData, "target", 20));
  await save(slug, token, { budget: { target, lines } }, "budget", "budget");
}

// Anniversary reminder (D-012). Turning it on needs the ticked consent box; the database
// records when. An empty number turns it off.
export async function saveReminder(slug: string, token: string, formData: FormData) {
  if (text(formData, "stop", 3) === "yes") {
    return save(slug, token, { reminder_whatsapp: "" }, "overview", "reminder");
  }
  const number = waNumber(text(formData, "reminder_whatsapp", 20));
  if (number.length < 11 || number.length > 15) redirect(back(slug, token, "overview", "reminder", "error=whatsapp"));
  if (text(formData, "consent", 3) !== "yes") redirect(back(slug, token, "overview", "reminder", "error=consent"));
  await save(slug, token, { reminder_whatsapp: number }, "overview", "reminder");
}

export async function deleteWedding(slug: string, token: string, formData: FormData) {
  if (text(formData, "confirm", 3) !== "yes") redirect(back(slug, token, "website", "delete", "error=confirm"));

  let ok = false;
  try {
    const { data, error } = await supabase().rpc("delete_wedding", { p_slug: slug, p_token: token });
    if (error) console.error("wedding delete failed", error);
    else ok = data === true;
  } catch (err) {
    console.error("wedding delete failed", err);
  }
  redirect(ok ? "/start?deleted=1" : back(slug, token, "website", "delete", "error=save"));
}
