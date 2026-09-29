import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicVendors } from "@/lib/data";
import { SITE_URL, isSlug, waShare } from "@/lib/format";
import { getRsvps, getWeddingForEdit, isToken } from "@/lib/weddings";
import { eyebrow, inputClass, secondaryButton } from "../../../../_components/ui";
import { BudgetPanel, ChecklistPanel, GuestsPanel, OverviewPanel, VendorsPanel, WebsitePanel } from "./panels";

export const metadata: Metadata = {
  title: "Your wedding planner",
  robots: { index: false, follow: false },
  // The private token is in this page's address. Never send it to other sites.
  referrer: "no-referrer",
};

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "website", label: "Website" },
  { id: "guests", label: "Guests" },
  { id: "checklist", label: "Checklist" },
  { id: "budget", label: "Budget" },
  { id: "vendors", label: "Vendors" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const SAVED: Record<string, string> = {
  details: "Details saved.",
  design: "Design saved. Your website has the new colours.",
  events: "Celebrations saved.",
  vendors: "Vendors saved.",
  checklist: "Checklist saved.",
  budget: "Budget saved.",
};

const ERRORS: Record<string, string> = {
  names: "Please keep both first names.",
  date: "That date does not look right.",
  confirm: "Tick the box to confirm the delete.",
  save: "That did not save. Please try again.",
};

export default async function WeddingPlannerPage({ params, searchParams }: PageProps<"/w/[slug]/edit/[token]">) {
  const [{ slug, token }, query] = await Promise.all([params, searchParams]);
  if (!isSlug(slug) || !isToken(token)) notFound();
  const wedding = await getWeddingForEdit(slug, token);
  if (!wedding) notFound();

  const tab: TabId = TABS.some((t) => t.id === query.tab) ? (query.tab as TabId) : "overview";
  const [rsvps, vendors] = await Promise.all([
    tab === "overview" || tab === "guests" ? getRsvps(slug, token) : Promise.resolve([]),
    tab === "vendors" ? getPublicVendors() : Promise.resolve([]),
  ]);

  const base = `/w/${slug}/edit/${token}`;
  const editUrl = `${SITE_URL}${base}`;
  const isNew = query.new === "1";
  const saved = typeof query.saved === "string" ? SAVED[query.saved] : null;
  const error = typeof query.error === "string" ? ERRORS[query.error] : null;
  const panelProps = { wedding, slug, token };

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-16 pt-8">
      <p className={eyebrow}>Your wedding planner</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-ink">
        {wedding.partner_one} &amp; {wedding.partner_two}
      </h1>

      {wedding.hidden_at ? (
        <p role="alert" className="mt-4 rounded-lg border border-wine/30 bg-blush px-4 py-3 text-sm text-wine-deep">
          Together has taken this website down. Message Together on WhatsApp if you think this is a mistake.
        </p>
      ) : null}

      {isNew || tab === "overview" ? (
        <section className={`mt-5 rounded-2xl border p-5 ${isNew ? "border-gold bg-gold-soft" : "border-line bg-card"}`}>
          <p className="font-semibold text-ink">
            {isNew ? "Your website is ready. Save this private link first." : "Your private link"}
          </p>
          <p className="mt-1 text-sm text-muted">
            This link opens your planner. Anyone with it can edit your website and see your RSVPs and budget. There is
            no password, so keep it safe and share it only with your partner.
          </p>
          <input readOnly value={editUrl} className={`${inputClass} font-mono text-xs`} aria-label="Your private link" />
          <a
            href={waShare(`Private link to our wedding planner on Together. Do not forward: ${editUrl}`)}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-3 ${secondaryButton}`}
          >
            Send it to myself on WhatsApp
          </a>
        </section>
      ) : null}

      <nav aria-label="Planner" className="-mx-4 mt-5 overflow-x-auto px-4">
        <ul className="flex min-w-max gap-2">
          {TABS.map((t) => (
            <li key={t.id}>
              <Link
                href={`${base}?tab=${t.id}`}
                aria-current={t.id === tab ? "page" : undefined}
                className={`block rounded-full border px-4 py-2 text-sm font-medium transition ${
                  t.id === tab ? "border-wine bg-wine text-white" : "border-line bg-card text-ink hover:border-wine"
                }`}
              >
                {t.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

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

      <div className="mt-5">
        {tab === "overview" ? <OverviewPanel {...panelProps} rsvps={rsvps} /> : null}
        {tab === "website" ? <WebsitePanel {...panelProps} /> : null}
        {tab === "guests" ? <GuestsPanel rsvps={rsvps} /> : null}
        {tab === "checklist" ? <ChecklistPanel {...panelProps} /> : null}
        {tab === "budget" ? <BudgetPanel {...panelProps} /> : null}
        {tab === "vendors" ? <VendorsPanel {...panelProps} vendors={vendors} /> : null}
      </div>
    </main>
  );
}
