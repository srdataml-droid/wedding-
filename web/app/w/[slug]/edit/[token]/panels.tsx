import type { ReactNode } from "react";
import Link from "next/link";
import { CHECKLIST, CHECKLIST_TOTAL } from "@/lib/checklist";
import { BUDGET_LINES, budgetTotals, readBudget } from "@/lib/budget";
import { THEMES } from "@/lib/themes";
import type { PublicVendor } from "@/lib/data";
import {
  SITE_URL,
  countdownLabel,
  daysUntil,
  formatDate,
  formatLongDate,
  formatNaira,
  waLink,
  waShare,
} from "@/lib/format";
import { DEFAULT_EVENT_TITLES, EVENT_SLOTS, type EditableWedding, type Rsvp, type WeddingEvent } from "@/lib/weddings";
import { cardClass, inputClass, labelClass, secondaryButton } from "../../../../_components/ui";
import {
  deleteWedding,
  saveBudget,
  saveChecklist,
  saveDetails,
  saveEvents,
  saveTheme,
  saveVendors,
} from "./actions";

// The couple's planner, one panel per tab. Every form posts to an action that checks
// the private token in the database.

type PanelProps = { wedding: EditableWedding; slug: string; token: string };

const saveButton = "mt-3 rounded-lg bg-wine px-4 py-2.5 text-sm font-semibold text-white hover:bg-wine-deep";

export function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className={`scroll-mt-6 ${cardClass}`}>
      <h2 className="font-display text-2xl font-semibold text-ink">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Progress({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-wine" style={{ width: `${pct}%` }} />
    </div>
  );
}

function rsvpCounts(rsvps: Rsvp[]) {
  const coming = rsvps.filter((r) => r.attending);
  return {
    comingReplies: coming.length,
    people: coming.reduce((sum, r) => sum + r.party_size, 0),
    notComing: rsvps.length - coming.length,
  };
}

function naira(n: number) {
  return new Intl.NumberFormat("en-NG").format(n);
}

// ---------- Overview ----------

export function OverviewPanel({ wedding, slug, token, rsvps }: PanelProps & { rsvps: Rsvp[] }) {
  const base = `/w/${slug}/edit/${token}`;
  const publicUrl = `${SITE_URL}/w/${slug}`;
  const names = `${wedding.partner_one} & ${wedding.partner_two}`;
  const done = wedding.checklist ?? {};
  const doneCount = Object.keys(done).length;
  const nextUp = CHECKLIST.flatMap((g) => g.items).filter((i) => !done[i.id]).slice(0, 3);
  const guests = rsvpCounts(rsvps);
  const totals = budgetTotals(readBudget(wedding.budget));
  const days = wedding.wedding_date ? daysUntil(wedding.wedding_date) : null;

  const stats = [
    { label: "Checklist", value: `${doneCount} of ${CHECKLIST_TOTAL}`, tab: "checklist", bar: [doneCount, CHECKLIST_TOTAL] as const },
    { label: "Guests coming", value: `${guests.people}`, tab: "guests", note: `${guests.comingReplies} ${guests.comingReplies === 1 ? "reply" : "replies"}` },
    {
      label: "Budget paid",
      value: totals.planned > 0 ? formatNaira(totals.paid) : "Not set",
      tab: "budget",
      bar: totals.planned > 0 ? ([totals.paid, totals.planned] as const) : undefined,
      note: totals.planned > 0 ? `of ${formatNaira(totals.planned)}` : undefined,
    },
    { label: "Vendors booked", value: `${wedding.vendor_ids?.length ?? 0}`, tab: "vendors" },
  ];

  return (
    <div className="grid gap-5">
      <section className="rounded-2xl border border-gold/40 bg-gold-soft p-6 text-center">
        {wedding.wedding_date && days !== null ? (
          <>
            <p className="font-display text-6xl font-semibold text-wine">{days > 0 ? days : "♥"}</p>
            <p className="mt-1 text-sm font-medium text-ink">
              {days > 0 ? `days until ${formatLongDate(wedding.wedding_date)}` : countdownLabel(wedding.wedding_date)}
            </p>
          </>
        ) : (
          <>
            <p className="font-display text-3xl font-semibold text-ink">{names}</p>
            <Link href={`${base}?tab=website#details`} className="mt-2 inline-block text-sm text-wine underline underline-offset-4">
              Add your wedding date
            </Link>
          </>
        )}
      </section>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <Link key={s.label} href={`${base}?tab=${s.tab}`} className={`${cardClass} p-4 transition hover:border-wine`}>
            <p className="text-xs font-medium text-muted">{s.label}</p>
            <p className="mt-1 text-xl font-semibold text-ink">{s.value}</p>
            {s.note ? <p className="text-xs text-muted">{s.note}</p> : null}
            {s.bar ? (
              <div className="mt-2">
                <Progress value={s.bar[0]} total={s.bar[1]} />
              </div>
            ) : null}
          </Link>
        ))}
      </div>

      <Section id="next" title="Next up">
        {nextUp.length === 0 ? (
          <p className="text-sm text-ink">Every task is ticked. Enjoy the day.</p>
        ) : (
          <ul className="grid gap-2">
            {nextUp.map((item) => (
              <li key={item.id} className="flex items-start gap-2.5 text-sm text-ink">
                <span className="mt-1 h-3 w-3 shrink-0 rounded-full border-2 border-gold" aria-hidden="true" />
                {item.label}
              </li>
            ))}
          </ul>
        )}
        <Link href={`${base}?tab=checklist`} className="mt-3 inline-block text-sm font-semibold text-wine underline underline-offset-4">
          Open the checklist
        </Link>
      </Section>

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
    </div>
  );
}

// ---------- Website ----------

export function WebsitePanel({ wedding, slug, token }: PanelProps) {
  const slots: WeddingEvent[] = Array.from({ length: EVENT_SLOTS }, (_, i) => {
    const e = wedding.events?.[i];
    return e ?? { title: DEFAULT_EVENT_TITLES[i] ?? "", date: "", time: "", venue: "", address: "" };
  });
  const bind = <A extends unknown[], R>(fn: (slug: string, token: string, ...args: A) => R) => fn.bind(null, slug, token);

  return (
    <div className="grid gap-5">
      <Section id="design" title="Design">
        <p className="text-sm text-muted">Pick the colours for your website. Guests see it straight away.</p>
        <form action={bind(saveTheme)} className="mt-3">
          <div className="grid grid-cols-2 gap-3">
            {THEMES.map((t) => (
              <label
                key={t.id}
                className="cursor-pointer rounded-xl border-2 border-line p-3 transition has-[:checked]:border-ink"
                style={{ backgroundColor: t.palette.paper }}
              >
                <input type="radio" name="theme" value={t.id} defaultChecked={wedding.theme === t.id} className="sr-only" />
                <span className="flex gap-1.5" aria-hidden="true">
                  {[t.palette.primary, t.palette.gold, t.palette.goldSoft].map((c) => (
                    <span key={c} className="h-6 w-6 rounded-full border border-black/10" style={{ backgroundColor: c }} />
                  ))}
                </span>
                <span className="mt-2 block font-display text-lg font-semibold" style={{ color: t.palette.primary }}>
                  {t.name}
                </span>
              </label>
            ))}
          </div>
          <button type="submit" className={saveButton}>
            Save design
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

      <section id="delete" className="scroll-mt-6 rounded-2xl border border-line p-5">
        <details>
          <summary className="cursor-pointer text-sm text-muted">Delete this website</summary>
          <p className="mt-2 text-sm text-muted">This deletes the website, every RSVP, your checklist and your budget. It cannot be undone.</p>
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
  );
}

// ---------- Guests ----------

export function GuestsPanel({ rsvps }: { rsvps: Rsvp[] }) {
  const counts = rsvpCounts(rsvps);
  return (
    <Section id="guests" title="Guests">
      <dl className="grid grid-cols-3 gap-2 text-center">
        {[
          ["Coming", `${counts.comingReplies} ${counts.comingReplies === 1 ? "reply" : "replies"}`],
          ["People", String(counts.people)],
          ["Not coming", String(counts.notComing)],
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
  );
}

// ---------- Checklist ----------

export function ChecklistPanel({ wedding, slug, token }: PanelProps) {
  const done = wedding.checklist ?? {};
  const doneCount = Object.keys(done).length;
  return (
    <Section id="checklist" title="Checklist">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-ink">
          {doneCount} of {CHECKLIST_TOTAL} done
        </span>
        <span className="text-muted">{Math.round((doneCount / CHECKLIST_TOTAL) * 100)}%</span>
      </div>
      <div className="mt-2">
        <Progress value={doneCount} total={CHECKLIST_TOTAL} />
      </div>
      <form action={saveChecklist.bind(null, slug, token)} className="mt-4">
        <div className="grid gap-4">
          {CHECKLIST.map((group) => (
            <fieldset key={group.title}>
              <legend className="text-sm font-semibold text-gold">{group.title}</legend>
              <div className="mt-1.5 grid gap-1.5">
                {group.items.map((item) => (
                  <label key={item.id} className="flex items-start gap-2.5 text-sm text-ink">
                    <input type="checkbox" name="done" value={item.id} defaultChecked={Boolean(done[item.id])} className="mt-0.5 h-4 w-4 accent-wine" />
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
  );
}

// ---------- Budget ----------

export function BudgetPanel({ wedding, slug, token }: PanelProps) {
  const budget = readBudget(wedding.budget);
  const totals = budgetTotals(budget);
  const over = budget.target !== null && totals.planned > budget.target;
  const numberInput = `${inputClass} text-right tabular-nums`;
  const cellInput =
    "w-full rounded-lg border border-line bg-white px-2 py-2 text-right text-sm tabular-nums text-ink outline-none transition focus:border-wine focus:ring-2 focus:ring-wine/20";

  return (
    <Section id="budget" title="Budget">
      <p className="text-sm text-muted">Private to you two. Amounts in naira. Together never holds or moves money.</p>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
        {[
          ["Planned", formatNaira(totals.planned)],
          ["Paid", formatNaira(totals.paid)],
          ["Still to pay", formatNaira(totals.toPay)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-line bg-paper px-2 py-2">
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="text-sm font-semibold text-ink tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
      {totals.planned > 0 ? (
        <div className="mt-3">
          <Progress value={totals.paid} total={totals.planned} />
        </div>
      ) : null}
      {budget.target !== null ? (
        <p className={`mt-2 text-sm ${over ? "text-wine-deep" : "text-muted"}`}>
          {over
            ? `Your plan is ${formatNaira(totals.planned - budget.target)} over your total budget of ${formatNaira(budget.target)}.`
            : `${formatNaira(budget.target - totals.planned)} left unplanned in your total budget of ${formatNaira(budget.target)}.`}
        </p>
      ) : null}

      <form action={saveBudget.bind(null, slug, token)} className="mt-5">
        <label className={labelClass}>
          Total budget <span className="font-normal text-muted">(optional)</span>
          <input
            name="target"
            inputMode="numeric"
            placeholder="e.g. 8,000,000"
            defaultValue={budget.target !== null ? naira(budget.target) : ""}
            className={numberInput}
          />
        </label>
        <div className="mt-4 grid grid-cols-[1fr_6.5rem_6.5rem] items-end gap-2 text-xs font-medium text-muted">
          <span>Cost</span>
          <span className="text-right">Planned ₦</span>
          <span className="text-right">Paid ₦</span>
        </div>
        <div className="mt-1 grid gap-2">
          {BUDGET_LINES.map((line) => {
            const value = budget.lines[line.id];
            return (
              <div key={line.id} className="grid grid-cols-[1fr_6.5rem_6.5rem] items-center gap-2">
                <span className="text-sm text-ink">{line.label}</span>
                <input
                  name={`planned_${line.id}`}
                  inputMode="numeric"
                  aria-label={`${line.label}, planned`}
                  defaultValue={value?.planned != null ? naira(value.planned) : ""}
                  className={cellInput}
                />
                <input
                  name={`paid_${line.id}`}
                  inputMode="numeric"
                  aria-label={`${line.label}, paid`}
                  defaultValue={value?.paid != null ? naira(value.paid) : ""}
                  className={cellInput}
                />
              </div>
            );
          })}
        </div>
        <button type="submit" className={saveButton}>
          Save budget
        </button>
      </form>
    </Section>
  );
}

// ---------- Vendors ----------

export function VendorsPanel({ wedding, slug, token, vendors }: PanelProps & { vendors: PublicVendor[] }) {
  const chosen = new Set(wedding.vendor_ids ?? []);
  return (
    <Section id="vendors" title="Your vendors">
      <p className="text-sm text-muted">
        Tick the Together vendors you booked. They show on your website so guests can find them too.
      </p>
      {vendors.length === 0 ? (
        <p className="mt-3 text-sm text-muted">No verified vendors yet.</p>
      ) : (
        <form action={saveVendors.bind(null, slug, token)} className="mt-3">
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
      <Link href="/vendors" className="mt-4 inline-block text-sm font-semibold text-wine underline underline-offset-4">
        Find verified vendors
      </Link>
    </Section>
  );
}
