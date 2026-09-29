"use server";

import { redirect } from "next/navigation";
import {
  adminConfigured,
  endAdminSession,
  passwordMatches,
  requireAdmin,
  startAdminSession,
} from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isUuid, slugify, text, todayInLagos } from "@/lib/format";
import { hashToken, newToken } from "@/lib/tokens";

export async function logIn(formData: FormData) {
  if (!adminConfigured()) redirect("/admin/login");
  if (!passwordMatches(text(formData, "password", 200))) {
    // Slow down guessing.
    await new Promise((resolve) => setTimeout(resolve, 800));
    redirect("/admin/login?error=wrong");
  }
  await startAdminSession();
  redirect("/admin");
}

export async function logOut() {
  await endAdminSession();
  redirect("/admin/login");
}

function idFrom(formData: FormData) {
  const id = text(formData, "id", 36);
  if (!isUuid(id)) redirect("/admin?error=save");
  return id;
}

async function run(write: () => PromiseLike<{ error: unknown }>, ok: string) {
  let failed = false;
  try {
    const { error } = await write();
    if (error) {
      console.error("admin write failed", error);
      failed = true;
    }
  } catch (err) {
    console.error("admin write failed", err);
    failed = true;
  }
  redirect(failed ? "/admin?error=save" : `/admin?ok=${ok}`);
}

export async function verifyVendor(formData: FormData) {
  await requireAdmin();
  const id = idFrom(formData);
  const note = text(formData, "note", 300);
  if (note.length < 5) redirect("/admin?error=note");

  const db = supabaseAdmin();
  const { data } = await db.from("vendors").select("slug, business_name").eq("id", id).maybeSingle();
  const slug = (data?.slug as string | null) ?? slugify((data?.business_name as string | undefined) ?? "vendor");

  await run(
    () =>
      db
        .from("vendors")
        .update({ verified_at: new Date().toISOString(), verified_note: note, slug })
        .eq("id", id),
    "verified",
  );
}

export async function unverifyVendor(formData: FormData) {
  await requireAdmin();
  const id = idFrom(formData);
  await run(
    () => supabaseAdmin().from("vendors").update({ verified_at: null, verified_note: null }).eq("id", id),
    "unverified",
  );
}

export async function setVendorHidden(formData: FormData) {
  await requireAdmin();
  const id = idFrom(formData);
  const hide = text(formData, "hide", 5) === "true";
  await run(
    () =>
      supabaseAdmin()
        .from("vendors")
        .update({ hidden_at: hide ? new Date().toISOString() : null })
        .eq("id", id),
    hide ? "hidden" : "shown",
  );
}

export async function deleteVendor(formData: FormData) {
  await requireAdmin();
  const id = idFrom(formData);
  if (text(formData, "confirm", 10) !== "yes") redirect("/admin?error=confirm");
  await run(() => supabaseAdmin().from("vendors").delete().eq("id", id), "deleted");
}

export async function approveReview(formData: FormData) {
  await requireAdmin();
  const id = idFrom(formData);
  await run(
    () => supabaseAdmin().from("reviews").update({ approved_at: new Date().toISOString() }).eq("id", id),
    "approved",
  );
}

export async function deleteReview(formData: FormData) {
  await requireAdmin();
  const id = idFrom(formData);
  await run(() => supabaseAdmin().from("reviews").delete().eq("id", id), "review-deleted");
}

// Makes a new private shop link for a vendor (D-012). Any older link stops working.
// The token is shown once, to Samuel, so he can send it to the vendor. Only its hash is kept.
export async function newShopLink(formData: FormData) {
  await requireAdmin();
  const id = idFrom(formData);
  const token = newToken();
  let failed = false;
  try {
    const { error } = await supabaseAdmin().from("vendors").update({ shop_token_hash: hashToken(token) }).eq("id", id);
    if (error) {
      console.error("shop link failed", error);
      failed = true;
    }
  } catch (err) {
    console.error("shop link failed", err);
    failed = true;
  }
  redirect(failed ? "/admin?error=save" : `/admin?shop=${id}&token=${token}#shop-link`);
}

// Takes a market item down, or puts it back. The vendor sees that it was taken down.
export async function setItemHidden(formData: FormData) {
  await requireAdmin();
  const id = idFrom(formData);
  const hide = text(formData, "hide", 5) === "true";
  await run(
    () =>
      supabaseAdmin()
        .from("listings")
        .update({ hidden_at: hide ? new Date().toISOString() : null })
        .eq("id", id),
    hide ? "item-hidden" : "item-shown",
  );
}

// Anniversary reminders (D-012). Samuel sends the WhatsApp message himself, then marks it
// sent so the couple does not show as due again until next year.
export async function markReminderSent(formData: FormData) {
  await requireAdmin();
  const id = idFrom(formData);
  await run(
    () => supabaseAdmin().from("weddings").update({ reminder_sent_on: todayInLagos() }).eq("id", id),
    "reminder-sent",
  );
}

// For a couple who replied STOP. Clears the number and the recorded yes together.
export async function stopReminder(formData: FormData) {
  await requireAdmin();
  const id = idFrom(formData);
  await run(
    () =>
      supabaseAdmin().from("weddings").update({ reminder_whatsapp: null, reminder_consent_at: null }).eq("id", id),
    "reminder-stopped",
  );
}

// Takes a wedding website down, or puts it back. For scams, abuse or a couple's request.
export async function setWeddingHidden(formData: FormData) {
  await requireAdmin();
  const id = idFrom(formData);
  const hide = text(formData, "hide", 5) === "true";
  await run(
    () =>
      supabaseAdmin()
        .from("weddings")
        .update({ hidden_at: hide ? new Date().toISOString() : null })
        .eq("id", id),
    hide ? "wedding-hidden" : "wedding-shown",
  );
}
