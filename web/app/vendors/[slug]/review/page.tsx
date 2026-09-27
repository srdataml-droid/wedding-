import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getVendorBySlug } from "@/lib/data";
import { isSlug, recentMonths } from "@/lib/format";
import { eyebrow, inputClass, labelClass, primaryButton } from "../../../_components/ui";
import { submitReview } from "../actions";

export const metadata: Metadata = { title: "Leave a review", robots: { index: false } };

const ERRORS: Record<string, string> = {
  missing: "Please fill in your name, your WhatsApp number, a rating and your review.",
  whatsapp: "That WhatsApp number does not look right. Use the format 0803 123 4567.",
  short: "Please write a little more, at least one full sentence.",
  save: "Something went wrong saving your review. Please try again.",
};

const RATINGS = [
  { value: 5, label: "Excellent" },
  { value: 4, label: "Good" },
  { value: 3, label: "Okay" },
  { value: 2, label: "Poor" },
  { value: 1, label: "Bad" },
];

export default async function ReviewPage({ params, searchParams }: PageProps<"/vendors/[slug]/review">) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  if (!isSlug(slug)) notFound();
  const vendor = await getVendorBySlug(slug);
  if (!vendor) notFound();

  const errorKey = typeof query.error === "string" ? query.error : null;
  const error = errorKey ? ERRORS[errorKey] : null;
  const action = submitReview.bind(null, vendor.slug);

  return (
    <main className="mx-auto w-full max-w-md px-4 pb-16 pt-8">
      <Link href={`/vendors/${vendor.slug}`} className="text-sm text-wine underline underline-offset-4">
        Back to {vendor.business_name}
      </Link>
      <p className={`mt-4 ${eyebrow}`}>Review</p>
      <h1 className="mt-2 text-2xl font-semibold leading-tight text-ink">
        How was {vendor.business_name}?
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Only review a vendor who worked your wedding. We contact every reviewer
        on WhatsApp before a review goes up. Your number is never shown.
      </p>

      {error ? (
        <p role="alert" className="mt-5 rounded-lg border border-wine/30 bg-blush px-4 py-3 text-sm text-wine-deep">
          {error}
        </p>
      ) : null}

      <form action={action} className="mt-5 flex flex-col gap-4 rounded-2xl border border-line bg-card p-5 shadow-sm">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

        <fieldset>
          <legend className={labelClass}>Your rating</legend>
          <div className="mt-2 grid grid-cols-5 gap-2">
            {RATINGS.map((r) => (
              <label
                key={r.value}
                className="flex cursor-pointer flex-col items-center rounded-lg border border-line px-1 py-2 text-center text-xs text-muted has-[:checked]:border-wine has-[:checked]:bg-blush has-[:checked]:text-wine-deep"
              >
                <input type="radio" name="rating" value={r.value} required className="sr-only" />
                <span className="text-lg text-wine">{r.value}★</span>
                {r.label}
              </label>
            ))}
          </div>
        </fieldset>

        <label className={labelClass}>
          Your review
          <textarea
            name="body"
            required
            minLength={10}
            maxLength={1000}
            rows={5}
            placeholder="What did they do well? Anything the next couple should know?"
            className={inputClass}
          />
        </label>

        <label className={labelClass}>
          When was your wedding? <span className="font-normal text-muted">(optional)</span>
          <select name="wedding_month" defaultValue="" className={inputClass}>
            <option value="">Prefer not to say</option>
            {recentMonths().map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          Your name <span className="font-normal text-muted">(shown with your review)</span>
          <input name="reviewer_name" required maxLength={80} placeholder="e.g. Tolu & Kemi" className={inputClass} />
        </label>

        <label className={labelClass}>
          Your WhatsApp number <span className="font-normal text-muted">(private)</span>
          <input
            name="reviewer_whatsapp"
            type="tel"
            required
            inputMode="tel"
            placeholder="0803 123 4567"
            className={inputClass}
          />
        </label>

        <button type="submit" className={`mt-1 ${primaryButton}`}>
          Send review
        </button>
      </form>
    </main>
  );
}
