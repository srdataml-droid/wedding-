"use server";

import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getVendorBySlug } from "@/lib/data";
import { SITE_URL, isSlug, text, waLink } from "@/lib/format";

// Logs the enquiry, then hands the couple to WhatsApp. The number comes from the
// database, never from the form, so nobody can redirect couples elsewhere.
export async function contactVendor(slug: string) {
  if (!isSlug(slug)) redirect("/vendors");
  const vendor = await getVendorBySlug(slug);
  if (!vendor) redirect("/vendors");

  try {
    const { error } = await supabase().from("enquiries").insert({ vendor_id: vendor.id });
    if (error) console.error("enquiry insert failed", error);
  } catch (err) {
    console.error("enquiry insert failed", err);
  }

  const message = `Hi ${vendor.business_name}, I found you on Together (${SITE_URL}). I'm planning a wedding and would like to ask about your services.`;
  redirect(waLink(vendor.whatsapp, message));
}

export async function submitReview(slug: string, formData: FormData) {
  if (!isSlug(slug)) redirect("/vendors");
  const back = `/vendors/${slug}/review`;

  if (text(formData, "website")) redirect(`/vendors/${slug}?review=sent`);

  const name = text(formData, "reviewer_name", 80);
  const whatsapp = text(formData, "reviewer_whatsapp", 20).replace(/[^\d+]/g, "");
  const rating = Number.parseInt(text(formData, "rating", 1), 10);
  const body = text(formData, "body", 1000);
  const month = text(formData, "wedding_month", 7);

  if (!name || !whatsapp || !body || !Number.isInteger(rating)) redirect(`${back}?error=missing`);
  if (rating < 1 || rating > 5) redirect(`${back}?error=missing`);
  if (whatsapp.replace(/\D/g, "").length < 10) redirect(`${back}?error=whatsapp`);
  if (body.length < 10) redirect(`${back}?error=short`);
  if (month && !/^\d{4}-\d{2}$/.test(month)) redirect(`${back}?error=missing`);

  const vendor = await getVendorBySlug(slug);
  if (!vendor) redirect("/vendors");

  let failed = false;
  try {
    const { error } = await supabase()
      .from("reviews")
      .insert({
        vendor_id: vendor.id,
        reviewer_name: name,
        reviewer_whatsapp: whatsapp,
        rating,
        body,
        wedding_month: month ? `${month}-01` : null,
      });
    if (error) {
      console.error("review insert failed", error);
      failed = true;
    }
  } catch (err) {
    console.error("review insert failed", err);
    failed = true;
  }

  if (failed) redirect(`${back}?error=save`);
  redirect(`/vendors/${slug}?review=sent`);
}
