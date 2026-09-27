"use server";

import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CATEGORIES } from "@/lib/categories";
import { slugify, text } from "@/lib/format";

export async function signUpVendor(formData: FormData) {
  // Spam bots fill every field, including the hidden one. People never see it.
  if (text(formData, "website")) redirect("/thanks");

  const businessName = text(formData, "business_name");
  const category = text(formData, "category");
  const area = text(formData, "area");
  const whatsapp = text(formData, "whatsapp", 20).replace(/[^\d+]/g, "");
  const instagram = text(formData, "instagram", 60).replace(/^@/, "");
  const about = text(formData, "about", 280);
  const yearsRaw = text(formData, "years_active", 3);
  const yearsActive = yearsRaw ? Number.parseInt(yearsRaw, 10) : null;
  const priceRaw = text(formData, "starting_price", 12).replace(/\D/g, "");
  const startingPrice = priceRaw ? Math.min(Number.parseInt(priceRaw, 10), 1_000_000_000) : null;

  if (!businessName || !area || !whatsapp) {
    redirect("/join?error=missing");
  }
  if (!(CATEGORIES as readonly string[]).includes(category)) {
    redirect("/join?error=missing");
  }
  if (whatsapp.replace(/\D/g, "").length < 10) {
    redirect("/join?error=whatsapp");
  }

  let failed = false;
  try {
    const { error } = await supabase().from("vendors").insert({
      business_name: businessName,
      slug: slugify(businessName),
      category,
      area,
      whatsapp,
      instagram: instagram || null,
      about: about || null,
      years_active: yearsActive !== null && Number.isFinite(yearsActive) ? yearsActive : null,
      starting_price: startingPrice !== null && Number.isFinite(startingPrice) ? startingPrice : null,
    });
    if (error) {
      console.error("vendor insert failed", error);
      failed = true;
    }
  } catch (err) {
    console.error("vendor insert failed", err);
    failed = true;
  }

  // redirect() throws on purpose, so it stays outside the try block.
  if (failed) redirect("/join?error=save");
  redirect("/thanks");
}
