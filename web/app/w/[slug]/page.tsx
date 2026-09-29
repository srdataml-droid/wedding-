import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { countdownLabel, formatLongDate, formatTime, isSlug, mapsLink } from "@/lib/format";
import { getPublicWedding, getVendorsByIds, sortEvents } from "@/lib/weddings";
import { themeStyle } from "@/lib/themes";
import { Ornament, WovenBand } from "../../_components/ornament";
import { cardClass, inputClass, labelClass, primaryButton } from "../../_components/ui";
import { sendRsvp } from "./actions";

export async function generateMetadata({ params }: PageProps<"/w/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const wedding = isSlug(slug) ? await getPublicWedding(slug) : null;
  return {
    title: wedding ? `${wedding.partner_one} & ${wedding.partner_two}` : "Wedding not found",
    description: wedding ? "Our wedding: the day, the details, aso-ebi and RSVP." : undefined,
    // Wedding pages stay out of search engines. Guests arrive by link.
    robots: { index: false, follow: false },
  };
}

const RSVP_MESSAGES: Record<string, { text: string; tone: "ok" | "error" }> = {
  thanks: { text: "Thank you. The couple has your reply.", tone: "ok" },
  missing: { text: "Please add your name and say whether you are coming.", tone: "error" },
  phone: { text: "That phone number does not look right. Use the format 0803 123 4567, or leave it blank.", tone: "error" },
  closed: { text: "The couple has closed RSVPs.", tone: "error" },
  save: { text: "Something went wrong sending your reply. Please try again.", tone: "error" },
};

export default async function WeddingPage({ params, searchParams }: PageProps<"/w/[slug]">) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  if (!isSlug(slug)) notFound();
  const wedding = await getPublicWedding(slug);
  if (!wedding) notFound();

  const vendors = await getVendorsByIds(wedding.vendor_ids);
  const events = sortEvents(wedding.events ?? []);
  const rsvpKey = typeof query.rsvp === "string" ? query.rsvp : null;
  const rsvpMessage = rsvpKey ? RSVP_MESSAGES[rsvpKey] : null;
  const rsvp = sendRsvp.bind(null, wedding.slug);
  const names = `${wedding.partner_one} & ${wedding.partner_two}`;

  return (
    <main className="pb-16" style={themeStyle(wedding.theme)}>
      <WovenBand />
      <section className="mx-auto w-full max-w-2xl px-4 pb-6 pt-12 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">The wedding of</p>
        <h1 className="mt-3 font-display text-5xl font-semibold leading-tight text-ink sm:text-6xl">{names}</h1>
        <Ornament className="mt-5" />
        {wedding.wedding_date ? (
          <p className="mt-5 text-lg text-ink">
            {formatLongDate(wedding.wedding_date)}
            <span className="mt-1 block text-sm text-muted">{countdownLabel(wedding.wedding_date)}</span>
          </p>
        ) : null}
        {wedding.hashtag ? <p className="mt-3 font-display text-2xl text-wine">{`#${wedding.hashtag}`}</p> : null}
        {wedding.rsvp_open ? (
          <a href="#rsvp" className="mx-auto mt-6 block max-w-xs rounded-lg bg-wine px-4 py-3 text-base font-semibold text-white hover:bg-wine-deep">
            RSVP
          </a>
        ) : null}
      </section>

      <div className="mx-auto grid w-full max-w-2xl gap-8 px-4">
        {wedding.story ? (
          <section>
            <h2 className="text-center font-display text-3xl font-semibold text-ink">Our story</h2>
            <p className="mt-3 whitespace-pre-line text-center text-base leading-relaxed text-ink">{wedding.story}</p>
          </section>
        ) : null}

        {events.length > 0 ? (
          <section>
            <h2 className="text-center font-display text-3xl font-semibold text-ink">The celebrations</h2>
            <ul className="mt-4 grid gap-3">
              {events.map((e, i) => (
                <li key={`${e.title}-${i}`} className={`${cardClass} text-center`}>
                  <p className="font-display text-2xl font-semibold text-wine">{e.title}</p>
                  {e.date ? (
                    <p className="mt-1 text-sm text-ink">
                      {formatLongDate(e.date)}
                      {e.time ? ` · ${formatTime(e.time)}` : ""}
                    </p>
                  ) : null}
                  {e.venue ? <p className="mt-2 font-medium text-ink">{e.venue}</p> : null}
                  {e.address ? <p className="text-sm text-muted">{e.address}</p> : null}
                  {e.venue || e.address ? (
                    <a
                      href={mapsLink([e.venue, e.address].filter(Boolean).join(", "))}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-sm text-wine underline underline-offset-4"
                    >
                      Directions
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {wedding.aso_ebi ? (
          <section className="rounded-2xl border border-gold/30 bg-gold-soft p-5 text-center">
            <h2 className="font-display text-3xl font-semibold text-ink">Aso-ebi</h2>
            <p className="mt-2 whitespace-pre-line text-base leading-relaxed text-ink">{wedding.aso_ebi}</p>
          </section>
        ) : null}

        <section id="rsvp" className="scroll-mt-6">
          <h2 className="text-center font-display text-3xl font-semibold text-ink">RSVP</h2>
          {rsvpMessage ? (
            <p
              role={rsvpMessage.tone === "ok" ? "status" : "alert"}
              className={`mt-3 rounded-lg border px-4 py-3 text-center text-sm ${
                rsvpMessage.tone === "ok" ? "border-line bg-card text-ink" : "border-wine/30 bg-blush text-wine-deep"
              }`}
            >
              {rsvpMessage.text}
            </p>
          ) : null}
          {wedding.rsvp_open ? (
            <form action={rsvp} className={`mt-4 flex flex-col gap-4 ${cardClass}`}>
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
              <label className={labelClass}>
                Your name
                <input name="guest_name" required maxLength={80} className={inputClass} />
              </label>
              <fieldset>
                <legend className={labelClass}>Will you be there?</legend>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {[
                    { value: "yes", label: "Joyfully yes" },
                    { value: "no", label: "Sadly no" },
                  ].map((o) => (
                    <label
                      key={o.value}
                      className="cursor-pointer rounded-lg border border-line px-3 py-2.5 text-center text-sm text-ink has-[:checked]:border-wine has-[:checked]:bg-blush has-[:checked]:text-wine-deep"
                    >
                      <input type="radio" name="attending" value={o.value} required className="sr-only" />
                      {o.label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className={labelClass}>
                How many of you, including you?
                <select name="party_size" defaultValue="1" className={inputClass}>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
              <label className={labelClass}>
                Phone number <span className="font-normal text-muted">(optional, only the couple sees it)</span>
                <input name="phone" type="tel" inputMode="tel" placeholder="0803 123 4567" className={inputClass} />
              </label>
              <label className={labelClass}>
                A message for the couple <span className="font-normal text-muted">(optional)</span>
                <textarea name="message" maxLength={500} rows={3} className={inputClass} />
              </label>
              <button type="submit" className={primaryButton}>
                Send my reply
              </button>
              <p className="text-xs leading-relaxed text-muted">
                Your reply goes only to the couple. Together keeps it for them, and deletes it if they delete their
                website.
              </p>
            </form>
          ) : (
            <p className="mt-3 text-center text-sm text-muted">RSVPs are closed. Contact the couple directly.</p>
          )}
        </section>

        {vendors.length > 0 ? (
          <section>
            <h2 className="text-center font-display text-3xl font-semibold text-ink">Our vendors</h2>
            <p className="mt-1 text-center text-sm text-muted">Each one checked by a real person at Together.</p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {vendors.map((v) => (
                <li key={v.id}>
                  <Link
                    href={`/vendors/${v.slug}`}
                    className="block rounded-xl border border-line bg-card px-4 py-3 transition hover:border-wine"
                  >
                    <span className="text-xs font-semibold uppercase tracking-wider text-wine">{v.category}</span>
                    <span className="block font-medium text-ink">{v.business_name}</span>
                    <span className="text-xs text-muted">✓ Verified on Together</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="text-center">
          <Ornament />
          <p className="mt-4 text-sm text-muted">Planning your own wedding?</p>
          <Link href="/start" className="mt-1 inline-block text-sm font-semibold text-wine underline underline-offset-4">
            Make a free wedding website on Together
          </Link>
        </section>
      </div>
    </main>
  );
}
