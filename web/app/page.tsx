import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { getPublicVendors, getRatings } from "@/lib/data";
import { VendorCard } from "./_components/vendor-card";
import { cardClass, eyebrow, primaryButton } from "./_components/ui";

const SHOW_COUNT_FROM = 5;

const STEPS = [
  {
    title: "We check every vendor",
    body: "Before a vendor appears here, we meet them or video-call them and check real work from past weddings.",
  },
  {
    title: "Real couples review them",
    body: "Couples review vendors after the wedding. We contact every reviewer before their review goes up.",
  },
  {
    title: "You talk to them directly",
    body: "Message any vendor on WhatsApp from their profile. No middleman and no fee for couples.",
  },
];

export default async function Home() {
  const [vendors, ratings] = await Promise.all([getPublicVendors(), getRatings()]);
  const latest = vendors.slice(0, 3);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-10">
      <section className="max-w-xl">
        <p className={eyebrow}>Together · Lagos</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-ink sm:text-4xl">
          Wedding vendors in Lagos you can actually trust.
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted">
          Every vendor on Together has been checked by a real person. Read what
          couples say, then message them on WhatsApp.
        </p>
        {vendors.length >= SHOW_COUNT_FROM ? (
          <p className="mt-3 text-sm font-medium text-ink">{vendors.length} verified vendors so far.</p>
        ) : null}
        <div className="mt-6 max-w-xs">
          <Link href="/vendors" className={primaryButton}>
            Find a vendor
          </Link>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-ink">Browse by what you need</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORIES.filter((c) => c !== "Other").map((c) => (
            <Link
              key={c}
              href={`/vendors?category=${encodeURIComponent(c)}`}
              className="rounded-full border border-line bg-card px-3.5 py-1.5 text-sm text-ink transition hover:border-wine hover:text-wine"
            >
              {c}
            </Link>
          ))}
        </div>
      </section>

      {latest.length > 0 ? (
        <section className="mt-10">
          <div className="flex items-baseline justify-between">
            <h2 className="text-sm font-semibold text-ink">Recently verified</h2>
            <Link href="/vendors" className="text-sm text-wine underline underline-offset-4">
              See all
            </Link>
          </div>
          <div className="mt-3 grid gap-3">
            {latest.map((v) => (
              <VendorCard key={v.id} vendor={v} rating={ratings.get(v.id)} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-ink">How Together works</h2>
        <ol className="mt-3 grid gap-3 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className={cardClass}>
              <p className="text-xs font-semibold text-wine">Step {i + 1}</p>
              <p className="mt-1 font-medium text-ink">{step.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={`mt-10 ${cardClass}`}>
        <p className="font-medium text-ink">Are you a wedding vendor in Lagos?</p>
        <p className="mt-1 text-sm text-muted">
          Get verified for free and let couples find you and message you directly.
        </p>
        <Link href="/join" className="mt-4 inline-block text-sm font-semibold text-wine underline underline-offset-4">
          Sign up as a vendor
        </Link>
      </section>
    </main>
  );
}
