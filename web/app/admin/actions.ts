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
import { isUuid, slugify, text } from "@/lib/format";

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
