import type { Metadata } from "next";
import { createWedding } from "./actions";
import { Ornament } from "../_components/ornament";
import { eyebrow, inputClass, labelClass, primaryButton } from "../_components/ui";

export const metadata: Metadata = { title: "Create your wedding website" };

const ERRORS: Record<string, string> = {
  missing: "Please fill in both first names.",
  date: "That date does not look right. Pick it from the calendar, or leave it blank for now.",
  save: "Something went wrong creating your website. Please try again.",
};

const FEATURES = [
  "Your story, every ceremony, times and directions",
  "Aso-ebi colours and how guests can order",
  "Online RSVP, with one list of who is coming",
  "A Nigerian wedding checklist and a private budget tracker",
  "Four designs in aso-ebi colours: wine, emerald, royal blue, coral",
  "Credit the verified vendors you booked",
];

export default async function StartPage({ searchParams }: PageProps<"/start">) {
  const query = await searchParams;
  const error = typeof query.error === "string" ? ERRORS[query.error] : null;
  const deleted = query.deleted === "1";

  return (
    <main className="mx-auto w-full max-w-md px-4 pb-16 pt-10">
      <p className={eyebrow}>Free wedding website</p>
      <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-ink">
        One link for everything your guests need.
      </h1>
      <ul className="mt-4 grid gap-1.5 text-sm text-muted">
        {FEATURES.map((f) => (
          <li key={f} className="flex gap-2">
            <span className="text-gold" aria-hidden="true">
              ◆
            </span>
            {f}
          </li>
        ))}
      </ul>

      {deleted ? (
        <p role="status" className="mt-6 rounded-lg border border-line bg-card px-4 py-3 text-sm text-ink">
          Your website and its RSVPs have been deleted.
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-6 rounded-lg border border-wine/30 bg-blush px-4 py-3 text-sm text-wine-deep">
          {error}
        </p>
      ) : null}

      <form action={createWedding} className="mt-6 flex flex-col gap-4 rounded-2xl border border-line bg-card p-5 shadow-sm">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
        <Ornament />
        <label className={labelClass}>
          Your first name
          <input name="partner_one" required maxLength={60} placeholder="e.g. Tolu" className={inputClass} />
        </label>
        <label className={labelClass}>
          Your partner&apos;s first name
          <input name="partner_two" required maxLength={60} placeholder="e.g. Kemi" className={inputClass} />
        </label>
        <label className={labelClass}>
          Wedding date <span className="font-normal text-muted">(optional, you can add it later)</span>
          <input name="wedding_date" type="date" className={inputClass} />
        </label>
        <button type="submit" className={`mt-1 ${primaryButton}`}>
          Create my website
        </button>
        <p className="text-xs leading-relaxed text-muted">
          No account needed. You get a private link to edit your website. Keep it safe and share it only with your
          partner.
        </p>
      </form>
    </main>
  );
}
