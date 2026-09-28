import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { getPublicVendors, getRatings } from "@/lib/data";
import { VendorCard } from "./_components/vendor-card";
import { Ornament, WovenBand } from "./_components/ornament";
import { cardClass, eyebrow, primaryButton, secondaryButton } from "./_components/ui";

const SHOW_COUNT_FROM = 5;

const TOOLS = [
  {
    title: "Wedding website",
    body: "Your story, every ceremony, aso-ebi and directions, on one link guests open on WhatsApp.",
    href: "/start",
  },
  {
    title: "Online RSVP",
    body: "Guests reply on your website. You see who is coming, and how many, in one list.",
    href: "/start",
  },
  {
    title: "Planning checklist",
    body: "A Nigerian wedding checklist, from the introduction to the final numbers for the caterer.",
    href: "/start",
  },
  {
    title: "Verified vendors",
    body: "Every vendor is met or video-called, and their past work checked, before they appear here.",
    href: "/vendors",
  },
];

const STEPS = [
  {
    title: "We check every vendor",
    body: "We meet them or video-call them and check real work from past weddings before they go live.",
  },
  {
    title: "Real couples review them",
    body: "We contact every reviewer to confirm the vendor worked their wedding before a review goes up.",
  },
  {
    title: "You talk to them directly",
    body: "Message vendors on WhatsApp from their profile. No middleman and no fee for couples.",
  },
];

export default async function Home() {
  const [vendors, ratings] = await Promise.all([getPublicVendors(), getRatings()]);
  const latest = vendors.slice(0, 3);

  return (
    <main className="pb-16">
      <WovenBand />
      <section className="mx-auto w-full max-w-4xl px-4 pb-4 pt-12 text-center">
        <p className={eyebrow}>Together · Lagos</p>
        <h1 className="mx-auto mt-4 max-w-2xl font-display text-5xl font-semibold leading-[1.05] text-ink sm:text-6xl">
          Plan your wedding with people you can trust.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted">
          Make a free wedding website with RSVP, keep your planning on track, and book Lagos vendors who have been
          checked by a real person.
        </p>
        <div className="mx-auto mt-7 grid max-w-md gap-3 sm:grid-cols-2">
          <Link href="/start" className={primaryButton}>
            Create your website
          </Link>
          <Link href="/vendors" className={`${secondaryButton} py-3 text-base`}>
            Find a vendor
          </Link>
        </div>
        {vendors.length >= SHOW_COUNT_FROM ? (
          <p className="mt-4 text-sm font-medium text-ink">{vendors.length} verified vendors so far.</p>
        ) : null}
        <Ornament className="mt-10" />
      </section>

      <div className="mx-auto w-full max-w-4xl px-4">
        <section className="mt-8">
          <h2 className="text-center font-display text-3xl font-semibold text-ink">Everything for the big day</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {TOOLS.map((t) => (
              <Link key={t.title} href={t.href} className={`${cardClass} transition hover:border-wine`}>
                <p className="font-display text-2xl font-semibold text-wine">{t.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{t.body}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-center font-display text-3xl font-semibold text-ink">Find your vendors</h2>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
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
          {latest.length > 0 ? (
            <div className="mt-6">
              <div className="flex items-baseline justify-between">
                <h3 className="text-sm font-semibold text-ink">Recently verified</h3>
                <Link href="/vendors" className="text-sm text-wine underline underline-offset-4">
                  See all
                </Link>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {latest.map((v) => (
                  <VendorCard key={v.id} vendor={v} rating={ratings.get(v.id)} />
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <section className="mt-12">
          <h2 className="text-center font-display text-3xl font-semibold text-ink">Why couples trust Together</h2>
          <ol className="mt-5 grid gap-3 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className={cardClass}>
                <p className="text-xs font-semibold uppercase tracking-wider text-gold">Step {i + 1}</p>
                <p className="mt-1 font-medium text-ink">{step.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12 rounded-2xl border border-gold/30 bg-gold-soft p-6 text-center">
          <p className="font-display text-3xl font-semibold text-ink">Are you a wedding vendor in Lagos?</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Get verified for free. Couples find you, message you directly, and see you credited on real wedding
            websites.
          </p>
          <Link href="/join" className="mt-4 inline-block text-sm font-semibold text-wine underline underline-offset-4">
            Sign up as a vendor
          </Link>
        </section>
      </div>
    </main>
  );
}
