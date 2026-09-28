"use server";

import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isIsoDate, slugify, text } from "@/lib/format";
import { hashToken, newEditToken } from "@/lib/weddings";

export async function createWedding(formData: FormData) {
  // Spam bots fill every field, including the hidden one. People never see it.
  if (text(formData, "website")) redirect("/start");

  const partnerOne = text(formData, "partner_one", 60);
  const partnerTwo = text(formData, "partner_two", 60);
  const weddingDate = text(formData, "wedding_date", 10);

  if (!partnerOne || !partnerTwo) redirect("/start?error=missing");
  if (weddingDate && !isIsoDate(weddingDate)) redirect("/start?error=date");

  const token = newEditToken();
  let slug = "";
  let saved = false;

  // A second try covers the rare case of two couples getting the same address.
  for (let attempt = 0; attempt < 2 && !saved; attempt++) {
    slug = slugify(`${partnerOne} and ${partnerTwo}`);
    try {
      const { error } = await supabase()
        .from("weddings")
        .insert({
          slug,
          edit_token_hash: hashToken(token),
          partner_one: partnerOne,
          partner_two: partnerTwo,
          wedding_date: weddingDate || null,
        });
      if (error) console.error("wedding insert failed", error);
      else saved = true;
    } catch (err) {
      console.error("wedding insert failed", err);
    }
  }

  if (!saved) redirect("/start?error=save");
  redirect(`/w/${slug}/edit/${token}?new=1`);
}
