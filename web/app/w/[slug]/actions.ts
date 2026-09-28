"use server";

import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isSlug, text } from "@/lib/format";
import { getPublicWedding } from "@/lib/weddings";

export async function sendRsvp(slug: string, formData: FormData) {
  if (!isSlug(slug)) redirect("/");
  const back = `/w/${slug}`;

  if (text(formData, "website")) redirect(`${back}?rsvp=thanks#rsvp`);

  const guestName = text(formData, "guest_name", 80);
  const attending = text(formData, "attending", 3);
  const partyRaw = Number.parseInt(text(formData, "party_size", 2), 10);
  const phone = text(formData, "phone", 20).replace(/[^\d+]/g, "");
  const message = text(formData, "message", 500);

  if (!guestName || (attending !== "yes" && attending !== "no")) redirect(`${back}?rsvp=missing#rsvp`);
  if (phone && phone.replace(/\D/g, "").length < 10) redirect(`${back}?rsvp=phone#rsvp`);

  const wedding = await getPublicWedding(slug);
  if (!wedding) redirect("/");
  if (!wedding.rsvp_open) redirect(`${back}?rsvp=closed#rsvp`);

  const partySize = attending === "yes" && Number.isInteger(partyRaw) ? Math.min(Math.max(partyRaw, 1), 10) : 1;

  let failed = false;
  try {
    const { error } = await supabase()
      .from("rsvps")
      .insert({
        wedding_id: wedding.id,
        guest_name: guestName,
        attending: attending === "yes",
        party_size: partySize,
        phone: phone || null,
        message: message || null,
      });
    if (error) {
      console.error("rsvp insert failed", error);
      failed = true;
    }
  } catch (err) {
    console.error("rsvp insert failed", err);
    failed = true;
  }

  redirect(failed ? `${back}?rsvp=save#rsvp` : `${back}?rsvp=thanks#rsvp`);
}
