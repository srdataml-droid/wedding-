"use server";

import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { CATEGORIES } from "@/lib/categories";

function text(formData: FormData, name: string, max = 120) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function signUpVendor(formData: FormData) {
  const businessName = text(formData, "business_name");
  const category = text(formData, "category");
  const area = text(formData, "area");
  const whatsapp = text(formData, "whatsapp", 20).replace(/[^\d+]/g, "");
  const instagram = text(formData, "instagram", 60).replace(/^@/, "");
  const yearsRaw = text(formData, "years_active", 3);
  const yearsActive = yearsRaw ? Number.parseInt(yearsRaw, 10) : null;

  if (!businessName || !area || !whatsapp) {
    redirect("/?error=missing");
  }
  if (!(CATEGORIES as readonly string[]).includes(category)) {
    redirect("/?error=missing");
  }
  if (whatsapp.replace(/\D/g, "").length < 10) {
    redirect("/?error=whatsapp");
  }

  const { error } = await supabaseAdmin().from("vendors").insert({
    business_name: businessName,
    category,
    area,
    whatsapp,
    instagram: instagram || null,
    years_active: Number.isFinite(yearsActive) ? yearsActive : null,
  });

  if (error) {
    console.error("vendor insert failed", error);
    redirect("/?error=save");
  }

  redirect("/thanks");
}
