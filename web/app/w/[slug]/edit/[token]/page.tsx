import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CHECKLIST, CHECKLIST_TOTAL } from "@/lib/checklist";
import { getPublicVendors } from "@/lib/data";
import { SITE_URL, formatDate, isSlug, waLink, waShare } from "@/lib/format";
import {
  DEFAULT_EVENT_TITLES,
  EVENT_SLOTS,
  getRsvps,
  getWeddingForEdit,
  isToken,
  type WeddingEvent,
} from "@/lib/weddings";
import { cardClass, eyebrow, inputClass, labelClass, secondaryButton } from "../../../../_components/ui";
import { deleteWedding, saveChecklist, saveDetails, saveEvents, saveVendors } from "./actions";

export const metadata: Metadata = {
  title: "Edit your wedding website",
  robots: { index: false, follow: false },
  // The private token is in this page's address. Never send it to other sites.
  referrer: "no-referrer",
};

const SAVED: Record<string, string> = {
  details: "Details saved.",
  events: "Celebrations saved.",
  vendors: "Vendors saved.",
  checklist: "Checklist saved.",
};

const ERRORS: Record<string, string> = {
  names: "Please keep both first names.",
  date: "That date does not look right.",
  confirm: "Tick the box to confirm the delete.",
  save: "That did not save. Please try again.",
};

const saveButton = "mt-3 rounded-lg bg-wine px-4 py-2.5 text-sm font-semibold text-white hover:bg-wine-deep";

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className={`scroll-mt-6 ${cardClass}`}>
      <h2 className="font-display text-2xl font-semibold text-ink">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

export default async function EditWeddingPage({ params, searchParams }: PageProps<"/w/[slug]/edit/[token]">) {
  const [{ slug, token }, query] = await Promise.all([params, searchParams]);
  if (!isSlug(slug) || !isToken(token)) notFound();
  const wedding = await getWeddingForEdit(slug, token);
  if (!wedding) notFound();

  const [rsvps, vendors] = await Promise.all([getRsvps(slug, token), getPublicVendors()]);

  const publicUrl = `${SITE_URL}/w/${slug}`;
  const editUrl = `${SITE_URL}/w/${slug}/edit/${token}`;
  const names = `${wedding.partner_one} & ${wedding.partner_two}`;
  const isNew = query.new === "1";
  const saved = typeof query.saved === "string" ? SAVED[query.saved] : null;
  const error = typeof query.error === "string" ? ERRORS[query.error] : null;

  const coming = rsvps.filter((r) => r.attending);
  const people = coming.reduce((sum, r) => sum + r.party_size, 0);
  const notComing = rsvps.length - coming.length;
  const doneCount = Object.keys(wedding.checklist ?? {}).length;
  const chosen = new Set(wedding.vendor_ids ?? []);
  const slots: WeddingEvent[] = Array.from({ length: EVENT_SLOTS }, (_, i) => {
    const e = wedding.events?.[i];
    return e ?? { title: DEFAULT_EVENT_TITLES[i] ?? "", date: "", time: "", venue: "", address: "" };
  });

  const bind = <A extends unknown[], R>(fn: (slug: string, token: string, ...args: A) => R) => fn.bind(null, slug, token);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-16 pt-8">
      <p className={eyebrow}>Your wedding website</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-ink">{names}</h1>

      {wedding.hidden_at ? (
        <p role="alert" className="mt-4 rounded-lg border border-wine/30 bg-blush px-4 py-3 text-sm text-wine-deep">
          Together has taken this website down. Message Together on WhatsApp if you think this is a mistake.
        </p>
      ) : null}

      <section className={`mt-5 rounded-2xl border p-5 ${isNew ? "border-gold bg-gold-soft" : "border-line bg-card"}`}>
        <p className="font-semibold text-ink">{isNew ? "Your website is ready. Save this private link first." : "Your private edit link"}</p>
        <p className="mt-1 text-sm text-muted">
          Anyone with this link can edit your website and see your RSVPs. There is no password, so keep it safe and
          share it only with your partner.
        </p>
        <input readOnly value={editUrl} className={`${inputClass} font-mono text-xs`} aria-label="Your private edit link" />
        <a
          href={waShare(`Private link to edit our wedding website on Together. Do not forward: ${editUrl}`)}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-3 ${secondaryButton}`}
        >
          Send it to myself on WhatsApp
        </a>
      </section>

      {saved ? (
        <p role="status" className="mt-4 rounded-lg border border-line bg-card px-4 py-3 text-sm text-ink">
          {saved}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-4 rounded-lg border border-wine/30 bg-blush px-4 py-3 text-sm text-wine-deep">
          {error}
        </p>
      ) : null}

      <div className="mt-5 grid gap-5">
        <Section id="share" title="Share with guests">
          <p className="break-all text-sm text-ink">{publicUrl}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={waShare(`${names} are getting married! All the details and RSVP here: ${publicUrl}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-wine px-4 py-2.5 text-sm font-semibold text-white hover:bg-wine-deep"
            >
              Share on WhatsApp
            </a>
            <Link href={`/w/${slug}`} className={secondaryButton}>
              View your website
            </Link>
          </div>
        </Section>

        <Section id="rsvps" title="RSVPs">
          <dl className="grid grid-cols-3 gap-2 text-center">
            {[
              ["Coming", `${coming.length} ${coming.length === 1 ? "reply" : "replies"}`],
              ["People", String(people)],
              ["Not coming", String(notComing)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-line bg-paper px-2 py-2">
                <dt className="text-xs text-muted">{label}</dt>
                <dd className="text-lg font-semibold text-ink">{value}</dd>
              </div>
            ))}
          </dl>
          {rsvps.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No replies yet. Share your website to start collecting them.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {rsvps.map((r, i) => (
                <li key={`${r.created_at}-${i}`} className="py-2.5 text-sm">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-medium text-ink">{r.guest_name}</span>
                    <span className={r.attending ? "text-wine" : "text-muted"}>
                      {r.attending ? `Coming · ${r.party_size} ${r.party_size === 1 ? "person" : "people"}` : "Not coming"}
                    </span>
                  </div>
                  {r.message ? <p className="mt-1 text-ink">{r.message}</p> : null}
                  <p className="mt-1 text-xs text-muted">
                    {formatDate(r.created_at)}
                    {r.phone ? (
                      <>
                        {" · "}
                        <a
                          href={waLink(r.phone, `Hi ${r.guest_name}, thank you for your RSVP!`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-wine underline underline-offset-4"
                        >
                          {r.phone}
                        </a>
                      </>
                    ) : null}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section id="checklist" title={`Checklist · ${doneCount} of ${CHECKLIST_TOTAL} done`}>
          <form action={bind(saveChecklist)}>
            <div className="grid gap-4">
              {CHECKLIST.map((group) => (
                <fieldset key={group.title}>
                  <legend className="text-sm font-semibold text-gold">{group.title}</legend>
                  <div className="mt-1.5 grid gap-1.5">
                    {group.items.map((item) => (
                      <label key={item.id} className="flex items-start gap-2.5 text-sm text-ink">
                        <input
                          type="checkbox"
                          name="done"
                          value={item.id}
                          defaultChecked={Boolean(wedding.checklist?.[item.id])}
                          className="mt-0.5 h-4 w-4 accent-wine"
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>
            <button type="submit" className={saveButton}>
              Save checklist
            </button>
          </form>
        </Section>

        <Section id="details" title="Details">
          <form action={bind(saveDetails)} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                First name
                <input name="partner_one" required maxLength={60} defaultValue={wedding.partner_one} className={inputClass} />
              </label>
              <label className={labelClass}>
                Partner&apos;s first name
                <input name="partner_two" required maxLength={60} defaultValue={wedding.partner_two} className={inputClass} />
              </label>
            </div>
            <label className={labelClass}>
              Main wedding date
              <input name="wedding_date" type="date" defaultValue={wedding.wedding_date ?? ""} className={inputClass} />
            </label>
            <label className={labelClass}>
              Hashtag <span className="font-normal text-muted">(optional)</span>
              <input name="hashtag" maxLength={41} placeholder="#ToluAndKemi2026" defaultValue={wedding.hashtag ?? ""} className={inputClass} />
            </label>
            <label className={labelClass}>
              Your story <span className="font-normal text-muted">(optional)</span>
              <textarea name="story" maxLength={2000} rows={4} defaultValue={wedding.story ?? ""} placeholder="How you met, and the proposal." className={inputClass} />
            </label>
            <label className={labelClass}>
              Aso-ebi <span className="font-normal text-muted">(optional)</span>
              <textarea
                name="aso_ebi"
                maxLength={600}
                rows={3}
                defaultValue={wedding.aso_ebi ?? ""}
                placeholder="Colours, fabric, price, and who to contact to order."
                className={inputClass}
              />
            </label>
            <label className="flex items-center gap-2.5 text-sm text-ink">
              <input type="checkbox" name="rsvp_open" defaultChecked={wedding.rsvp_open} className="h-4 w-4 accent-wine" />
              Guests can RSVP on the website
            </label>
            <div>
              <button type="submit" className={saveButton}>
                Save details
              </button>
            </div>
          </form>
        </Section>

        <Section id="events" title="The celebrations">
          <p className="text-sm text-muted">Add each ceremony. Leave the date and place empty to hide a slot.</p>
          <form action={bind(saveEvents)} className="mt-3 grid gap-5">
            {slots.map((e, i) => (
              <fieldset key={i} className="grid gap-3 border-t border-line pt-4 first:border-t-0 first:pt-0">
                <label className={labelClass}>
                  Event name
                  <input name={`event_${i}_title`} maxLength={80} defaultValue={e.title} placeholder="e.g. After party" className={inputClass} />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={labelClass}>
                    Date
                    <input name={`event_${i}_date`} type="date" defaultValue={e.date} className={inputClass} />
                  </label>
                  <label className={labelClass}>
                    Time
                    <input name={`event_${i}_time`} type="time" defaultValue={e.time} className={inputClass} />
                  </label>
                </div>
                <label className={labelClass}>
                  Venue
                  <input name={`event_${i}_venue`} maxLength={120} defaultValue={e.venue} placeholder="e.g. Harbour Point" className={inputClass} />
                </label>
                <label className={labelClass}>
                  Address
                  <input name={`event_${i}_address`} maxLength={200} defaultValue={e.address} placeholder="e.g. 4 Wilmot Point Road, Victoria Island" className={inputClass} />
                </label>
              </fieldset>
            ))}
            <div>
              <button type="submit" className={saveButton}>
                Save celebrations
              </button>
            </div>
          </form>
        </Section>

        <Section id="vendors" title="Your vendors">
          <p className="text-sm text-muted">
            Tick the Together vendors you booked. They show on your website so guests can find them too.
          </p>
          {vendors.length === 0 ? (
            <p className="mt-3 text-sm text-muted">
              No verified vendors yet.{" "}
              <Link href="/vendors" className="text-wine underline underline-offset-4">
                Browse vendors
              </Link>
            </p>
          ) : (
            <form action={bind(saveVendors)} className="mt-3">
              <div className="grid gap-1.5">
                {vendors.map((v) => (
                  <label key={v.id} className="flex items-center gap-2.5 text-sm text-ink">
                    <input type="checkbox" name="vendor" value={v.id} defaultChecked={chosen.has(v.id)} className="h-4 w-4 accent-wine" />
                    <span>
                      {v.business_name} <span className="text-muted">· {v.category}</span>
                    </span>
                  </label>
                ))}
              </div>
              <button type="submit" className={saveButton}>
                Save vendors
              </button>
            </form>
          )}
        </Section>

        <section id="delete" className="scroll-mt-6 rounded-2xl border border-line p-5">
          <details>
            <summary className="cursor-pointer text-sm text-muted">Delete this website</summary>
            <p className="mt-2 text-sm text-muted">This deletes the website and every RSVP. It cannot be undone.</p>
            <form action={bind(deleteWedding)} className="mt-3 flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" name="confirm" value="yes" className="h-4 w-4 accent-wine" /> Yes, delete it
              </label>
              <button type="submit" className="text-sm text-wine-deep underline">
                Delete website
              </button>
            </form>
          </details>
        </section>
      </div>
    </main>
  );
}
