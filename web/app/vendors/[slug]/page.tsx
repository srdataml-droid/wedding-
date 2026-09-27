import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getApprovedReviews, getVendorBySlug } from "@/lib/data";
import { formatDate, formatMonth, formatNaira, isSlug } from "@/lib/format";
import { RatingLine, Stars } from "../../_components/stars";
import { cardClass, primaryButton, secondaryButton } from "../../_components/ui";
import { contactVendor } from "./actions";

export async function generateMetadata({ params }: PageProps<"/vendors/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const vendor = isSlug(slug) ? await getVendorBySlug(slug) : null;
  return vendor
    ? {
        title: `${vendor.business_name}, ${vendor.category} in ${vendor.area}`,
        description: vendor.about ?? `${vendor.category} in ${vendor.area}, Lagos. Verified by Together.`,
      }
    : { title: "Vendor not found" };
}

export default async function VendorPage({ params, searchParams }: PageProps<"/vendors/[slug]">) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  if (!isSlug(slug)) notFound();
  const vendor = await getVendorBySlug(slug);
  if (!vendor) notFound();

  const reviews = await getApprovedReviews(vendor.id);
  const rating = reviews.length
    ? { average: reviews.reduce((s, r) => s + r.rating, 0) / reviews.length, count: reviews.length }
    : undefined;
  const reviewSent = query.review === "sent";
  const contact = contactVendor.bind(null, vendor.slug);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-16 pt-8">
      <Link href="/vendors" className="text-sm text-wine underline underline-offset-4">
        All vendors
      </Link>

      <header className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-wine">{vendor.category}</p>
        <h1 className="mt-1 text-3xl font-semibold leading-tight text-ink">{vendor.business_name}</h1>
        <p className="mt-1 text-base text-muted">
          {vendor.area}, Lagos
          {vendor.years_active ? ` · ${vendor.years_active} years doing weddings` : ""}
          {vendor.starting_price ? ` · From ${formatNaira(vendor.starting_price)}` : ""}
        </p>
        <div className="mt-2">
          <RatingLine rating={rating} />
        </div>
      </header>

      {reviewSent ? (
        <p role="status" className="mt-5 rounded-lg border border-line bg-card px-4 py-3 text-sm text-ink">
          Thank you. We will contact you on WhatsApp to confirm your review, then it will appear here.
        </p>
      ) : null}

      <section className="mt-5 rounded-2xl border border-wine/20 bg-blush p-4">
        <p className="text-sm font-semibold text-wine-deep">✓ Verified by Together on {formatDate(vendor.verified_at)}</p>
        {vendor.verified_note ? (
          <p className="mt-1 text-sm leading-relaxed text-ink">What we checked: {vendor.verified_note}</p>
        ) : null}
      </section>

      {vendor.about ? <p className="mt-5 text-base leading-relaxed text-ink">{vendor.about}</p> : null}

      <section className={`mt-5 ${cardClass}`}>
        <form action={contact}>
          <button type="submit" className={primaryButton}>
            Message on WhatsApp
          </button>
        </form>
        {vendor.instagram ? (
          <a
            href={`https://instagram.com/${encodeURIComponent(vendor.instagram)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-3 w-full ${secondaryButton}`}
          >
            See their work on Instagram
          </a>
        ) : null}
        <p className="mt-3 text-xs text-muted">
          You talk to the vendor directly. Together takes no fee and never holds your money.
        </p>
      </section>

      <section className="mt-8">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-semibold text-ink">Reviews from couples</h2>
          <Link
            href={`/vendors/${vendor.slug}/review`}
            className="text-sm font-semibold text-wine underline underline-offset-4"
          >
            Leave a review
          </Link>
        </div>
        {reviews.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            No reviews yet. If this vendor worked your wedding, your review helps the next couple.
          </p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {reviews.map((r) => (
              <li key={r.id} className={cardClass}>
                <div className="flex items-center justify-between gap-3">
                  <Stars value={r.rating} />
                  <span className="text-xs text-muted">
                    {r.wedding_month ? `Wedding in ${formatMonth(r.wedding_month)}` : formatDate(r.created_at)}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink">{r.body}</p>
                <p className="mt-2 text-xs font-medium text-muted">{r.reviewer_name}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
