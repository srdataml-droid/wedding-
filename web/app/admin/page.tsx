import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { SITE_URL, formatDate, formatMonth, formatNaira, waLink } from "@/lib/format";
import { priceLabel } from "@/lib/market";
import { isToken } from "@/lib/tokens";
import { Stars } from "../_components/stars";
import { cardClass, inputClass, secondaryButton } from "../_components/ui";
import {
  approveReview,
  deleteReview,
  deleteVendor,
  logOut,
  newShopLink,
  setItemHidden,
  setVendorHidden,
  setWeddingHidden,
  unverifyVendor,
  verifyVendor,
} from "./actions";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
  // A new shop link sits in this page's address until it is sent. Never send it to other sites.
  referrer: "no-referrer",
};

type Vendor = {
  id: string;
  created_at: string;
  slug: string | null;
  business_name: string;
  category: string;
  area: string;
  whatsapp: string;
  instagram: string | null;
  years_active: number | null;
  about: string | null;
  starting_price: number | null;
  verified_at: string | null;
  verified_note: string | null;
  hidden_at: string | null;
  shop_token_hash: string | null;
};

type Item = {
  id: string;
  created_at: string;
  vendor_id: string;
  title: string;
  price: number | null;
  price_unit: string | null;
  hidden_at: string | null;
  vendors: { business_name: string } | null;
};

type PendingReview = {
  id: string;
  created_at: string;
  reviewer_name: string;
  reviewer_whatsapp: string;
  rating: number;
  body: string;
  wedding_month: string | null;
  vendors: { business_name: string; slug: string | null } | null;
};

type WeddingRow = {
  id: string;
  created_at: string;
  slug: string;
  partner_one: string;
  partner_two: string;
  wedding_date: string | null;
  hidden_at: string | null;
};

const MESSAGES: Record<string, string> = {
  verified: "Vendor verified. Their profile is live.",
  unverified: "Vendor taken off the public list.",
  hidden: "Vendor hidden from the public list.",
  shown: "Vendor visible again.",
  deleted: "Vendor deleted.",
  approved: "Review approved. It is now public.",
  "review-deleted": "Review deleted.",
  "wedding-hidden": "Wedding website taken down.",
  "wedding-shown": "Wedding website back up.",
  "item-hidden": "Item taken down. The vendor can see that it was.",
  "item-shown": "Item back up.",
};

const ERRORS: Record<string, string> = {
  note: "Write what you checked before verifying, at least a few words. It shows on their profile.",
  confirm: "Tick the box to confirm the delete.",
  save: "That did not save. Check the Supabase secret key in Vercel and try again.",
};

async function loadData() {
  const db = supabaseAdmin();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const [vendors, reviews, enquiries, weddings, rsvps, items] = await Promise.all([
    db.from("vendors").select("*").order("created_at", { ascending: false }).limit(1000),
    db
      .from("reviews")
      .select("id, created_at, reviewer_name, reviewer_whatsapp, rating, body, wedding_month, vendors(business_name, slug)")
      .is("approved_at", null)
      .order("created_at", { ascending: true })
      .limit(200),
    db.from("enquiries").select("vendor_id, listing_id").gte("created_at", since).limit(10000),
    db
      .from("weddings")
      .select("id, created_at, slug, partner_one, partner_two, wedding_date, hidden_at")
      .order("created_at", { ascending: false })
      .limit(200),
    db.from("rsvps").select("wedding_id").limit(20000),
    db
      .from("listings")
      .select("id, created_at, vendor_id, title, price, price_unit, hidden_at, vendors(business_name)")
      .order("created_at", { ascending: false })
      .limit(300),
  ]);
  const error = vendors.error ?? reviews.error ?? enquiries.error ?? weddings.error ?? rsvps.error ?? items.error;
  if (error) throw error;
  const enquiryCounts = new Map<string, number>();
  const itemEnquiryCounts = new Map<string, number>();
  for (const row of (enquiries.data ?? []) as { vendor_id: string; listing_id: string | null }[]) {
    enquiryCounts.set(row.vendor_id, (enquiryCounts.get(row.vendor_id) ?? 0) + 1);
    if (row.listing_id) itemEnquiryCounts.set(row.listing_id, (itemEnquiryCounts.get(row.listing_id) ?? 0) + 1);
  }
  const itemCounts = new Map<string, number>();
  for (const item of (items.data ?? []) as unknown as Item[]) {
    itemCounts.set(item.vendor_id, (itemCounts.get(item.vendor_id) ?? 0) + 1);
  }
  const rsvpCounts = new Map<string, number>();
  for (const row of (rsvps.data ?? []) as { wedding_id: string }[]) {
    rsvpCounts.set(row.wedding_id, (rsvpCounts.get(row.wedding_id) ?? 0) + 1);
  }
  return {
    vendors: (vendors.data ?? []) as Vendor[],
    reviews: (reviews.data ?? []) as unknown as PendingReview[],
    enquiryCounts,
    enquiryTotal: enquiries.data?.length ?? 0,
    weddings: (weddings.data ?? []) as WeddingRow[],
    rsvpCounts,
    items: (items.data ?? []) as unknown as Item[],
    itemCounts,
    itemEnquiryCounts,
  };
}

function Hidden({ id }: { id: string }) {
  return <input type="hidden" name="id" value={id} />;
}

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  await requireAdmin();
  const query = await searchParams;
  const ok = typeof query.ok === "string" ? MESSAGES[query.ok] : null;
  const error = typeof query.error === "string" ? ERRORS[query.error] : null;

  let data: Awaited<ReturnType<typeof loadData>>;
  try {
    data = await loadData();
  } catch (err) {
    console.error("admin load failed", err);
    return (
      <main className="mx-auto w-full max-w-2xl px-4 pb-16 pt-10">
        <h1 className="text-2xl font-semibold text-ink">Admin</h1>
        <p className="mt-4 rounded-lg border border-wine/30 bg-blush px-4 py-3 text-sm text-wine-deep">
          Could not load data. Check that SUPABASE_SECRET_KEY in Vercel is the secret key from Supabase, Settings, API Keys.
        </p>
      </main>
    );
  }

  const pending = data.vendors.filter((v) => !v.verified_at);
  const live = data.vendors.filter((v) => v.verified_at && !v.hidden_at);
  const hidden = data.vendors.filter((v) => v.verified_at && v.hidden_at);

  // A shop link just made by newShopLink. Shown once: only its hash is stored.
  const token = typeof query.token === "string" && isToken(query.token) ? query.token : null;
  const shopVendor = token ? data.vendors.find((v) => v.id === query.shop && v.slug) : undefined;
  const shopLink = token && shopVendor ? `${SITE_URL}/vendors/${shopVendor.slug}/shop/${token}` : null;

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-16 pt-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-ink">Admin</h1>
        <form action={logOut}>
          <button type="submit" className={secondaryButton}>
            Sign out
          </button>
        </form>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ["Waiting", pending.length],
          ["Live", live.length],
          ["Reviews to check", data.reviews.length],
          ["Enquiries, 30 days", data.enquiryTotal],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-line bg-card px-3 py-2">
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="text-xl font-semibold text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      {ok ? (
        <p role="status" className="mt-4 rounded-lg border border-line bg-card px-4 py-3 text-sm text-ink">
          {ok}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-4 rounded-lg border border-wine/30 bg-blush px-4 py-3 text-sm text-wine-deep">
          {error}
        </p>
      ) : null}

      {shopVendor && shopLink ? (
        <section id="shop-link" className="mt-4 rounded-2xl border border-gold bg-gold-soft p-4">
          <p className="font-semibold text-ink">Shop link for {shopVendor.business_name}</p>
          <p className="mt-1 text-sm text-muted">
            Send it now. It is shown only this once, because only its hash is stored. Any older link for this vendor
            has stopped working.
          </p>
          <input readOnly value={shopLink} className={`${inputClass} font-mono text-xs`} aria-label="Shop link" />
          <a
            href={waLink(
              shopVendor.whatsapp,
              `Hi ${shopVendor.business_name}, this is Samuel from Together. Here is your private shop link. Use it to add what you sell to the Together market. Keep it private, it works like a key: ${shopLink}`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block rounded-lg bg-wine px-4 py-2.5 text-sm font-semibold text-white hover:bg-wine-deep"
          >
            Send it to them on WhatsApp
          </a>
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-ink">Waiting for verification ({pending.length})</h2>
        {pending.length === 0 ? <p className="mt-2 text-sm text-muted">Nobody waiting.</p> : null}
        <ul className="mt-3 grid gap-3">
          {pending.map((v) => (
            <li key={v.id} className={cardClass}>
              <p className="text-xs font-semibold uppercase tracking-wider text-wine">{v.category}</p>
              <p className="mt-1 text-lg font-semibold text-ink">{v.business_name}</p>
              <p className="text-sm text-muted">
                {v.area} · signed up {formatDate(v.created_at)}
                {v.years_active ? ` · ${v.years_active} yrs` : ""}
                {v.starting_price ? ` · from ${formatNaira(v.starting_price)}` : ""}
              </p>
              {v.about ? <p className="mt-2 text-sm text-ink">{v.about}</p> : null}
              <p className="mt-2 flex flex-wrap gap-3 text-sm">
                <a
                  href={waLink(v.whatsapp, `Hi ${v.business_name}, this is Samuel from Together. Thanks for signing up.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-wine underline underline-offset-4"
                >
                  WhatsApp {v.whatsapp}
                </a>
                {v.instagram ? (
                  <a
                    href={`https://instagram.com/${encodeURIComponent(v.instagram)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-wine underline underline-offset-4"
                  >
                    @{v.instagram}
                  </a>
                ) : null}
              </p>

              <form action={verifyVendor} className="mt-4">
                <Hidden id={v.id} />
                <label className="block text-sm font-medium text-ink">
                  What you checked <span className="font-normal text-muted">(shown publicly on their profile)</span>
                  <textarea
                    name="note"
                    required
                    minLength={5}
                    maxLength={300}
                    rows={2}
                    placeholder="e.g. Met at Balogun on 3 Oct. Saw photos from 3 delivered weddings with dates."
                    className={inputClass}
                  />
                </label>
                <button type="submit" className="mt-2 rounded-lg bg-wine px-4 py-2.5 text-sm font-semibold text-white hover:bg-wine-deep">
                  Verify and publish
                </button>
              </form>

              <details className="mt-3 text-sm">
                <summary className="cursor-pointer text-muted">Delete this sign-up</summary>
                <form action={deleteVendor} className="mt-2 flex items-center gap-3">
                  <Hidden id={v.id} />
                  <label className="flex items-center gap-2 text-muted">
                    <input type="checkbox" name="confirm" value="yes" /> Yes, delete it
                  </label>
                  <button type="submit" className="text-wine-deep underline">
                    Delete
                  </button>
                </form>
              </details>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-ink">Reviews to check ({data.reviews.length})</h2>
        <p className="mt-1 text-sm text-muted">
          Message the reviewer to confirm the vendor worked their wedding before you approve.
        </p>
        {data.reviews.length === 0 ? <p className="mt-2 text-sm text-muted">No reviews waiting.</p> : null}
        <ul className="mt-3 grid gap-3">
          {data.reviews.map((r) => (
            <li key={r.id} className={cardClass}>
              <p className="text-sm font-medium text-ink">
                For {r.vendors?.business_name ?? "a deleted vendor"} · <Stars value={r.rating} />
              </p>
              <p className="mt-2 whitespace-pre-line text-sm text-ink">{r.body}</p>
              <p className="mt-2 text-xs text-muted">
                {r.reviewer_name}
                {r.wedding_month ? ` · wedding in ${formatMonth(r.wedding_month)}` : ""} · sent {formatDate(r.created_at)}
              </p>
              <a
                href={waLink(
                  r.reviewer_whatsapp,
                  `Hi ${r.reviewer_name}, this is Samuel from Together. Thank you for reviewing ${r.vendors?.business_name ?? "your vendor"}. Can you confirm they worked your wedding?`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm text-wine underline underline-offset-4"
              >
                WhatsApp the reviewer
              </a>
              <div className="mt-3 flex gap-3">
                <form action={approveReview}>
                  <Hidden id={r.id} />
                  <button type="submit" className="rounded-lg bg-wine px-4 py-2 text-sm font-semibold text-white hover:bg-wine-deep">
                    Approve
                  </button>
                </form>
                <form action={deleteReview}>
                  <Hidden id={r.id} />
                  <button type="submit" className={secondaryButton}>
                    Delete
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-ink">Live vendors ({live.length})</h2>
        <ul className="mt-3 grid gap-2">
          {live.map((v) => (
            <li key={v.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-card px-4 py-3">
              <div className="min-w-0">
                {v.slug ? (
                  <Link href={`/vendors/${v.slug}`} className="font-medium text-ink underline underline-offset-4">
                    {v.business_name}
                  </Link>
                ) : (
                  <span className="font-medium text-ink">{v.business_name}</span>
                )}
                <p className="text-xs text-muted">
                  {v.category} · {v.area} · {data.enquiryCounts.get(v.id) ?? 0} enquiries in 30 days ·{" "}
                  {data.itemCounts.get(v.id) ?? 0} items
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <form action={newShopLink}>
                  <Hidden id={v.id} />
                  <button type="submit" className={secondaryButton}>
                    {v.shop_token_hash ? "New shop link" : "Shop link"}
                  </button>
                </form>
                <form action={setVendorHidden}>
                  <Hidden id={v.id} />
                  <input type="hidden" name="hide" value="true" />
                  <button type="submit" className={secondaryButton}>
                    Hide
                  </button>
                </form>
                <form action={unverifyVendor}>
                  <Hidden id={v.id} />
                  <button type="submit" className={secondaryButton}>
                    Unverify
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {hidden.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-ink">Hidden ({hidden.length})</h2>
          <ul className="mt-3 grid gap-2">
            {hidden.map((v) => (
              <li key={v.id} className="flex items-center justify-between gap-2 rounded-xl border border-line bg-card px-4 py-3">
                <span className="font-medium text-ink">{v.business_name}</span>
                <form action={setVendorHidden}>
                  <Hidden id={v.id} />
                  <input type="hidden" name="hide" value="false" />
                  <button type="submit" className={secondaryButton}>
                    Show again
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-ink">Market items ({data.items.length})</h2>
        <p className="mt-1 text-sm text-muted">
          Vendors add these through their shop link. Take one down if it looks like a scam, breaks the law or has
          nothing to do with weddings.
        </p>
        {data.items.length === 0 ? <p className="mt-2 text-sm text-muted">No items yet.</p> : null}
        <ul className="mt-3 grid gap-2">
          {data.items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-card px-4 py-3">
              <div className="min-w-0">
                <p className={item.hidden_at ? "font-medium text-muted line-through" : "font-medium text-ink"}>{item.title}</p>
                <p className="text-xs text-muted">
                  {priceLabel(item)} · {item.vendors?.business_name ?? "a deleted vendor"} · added {formatDate(item.created_at)} ·{" "}
                  {data.itemEnquiryCounts.get(item.id) ?? 0} enquiries in 30 days
                </p>
              </div>
              <form action={setItemHidden}>
                <Hidden id={item.id} />
                <input type="hidden" name="hide" value={item.hidden_at ? "false" : "true"} />
                <button type="submit" className={secondaryButton}>
                  {item.hidden_at ? "Put back up" : "Take down"}
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-ink">Wedding websites ({data.weddings.length})</h2>
        <p className="mt-1 text-sm text-muted">
          Take a site down if it looks like a scam or abuse, or if the couple asks.
        </p>
        {data.weddings.length === 0 ? <p className="mt-2 text-sm text-muted">No wedding websites yet.</p> : null}
        <ul className="mt-3 grid gap-2">
          {data.weddings.map((w) => (
            <li key={w.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line bg-card px-4 py-3">
              <div className="min-w-0">
                {w.hidden_at ? (
                  <span className="font-medium text-muted line-through">
                    {w.partner_one} &amp; {w.partner_two}
                  </span>
                ) : (
                  <Link href={`/w/${w.slug}`} className="font-medium text-ink underline underline-offset-4">
                    {w.partner_one} &amp; {w.partner_two}
                  </Link>
                )}
                <p className="text-xs text-muted">
                  Made {formatDate(w.created_at)}
                  {w.wedding_date ? ` · wedding ${w.wedding_date}` : ""} · {data.rsvpCounts.get(w.id) ?? 0} RSVPs
                </p>
              </div>
              <form action={setWeddingHidden}>
                <Hidden id={w.id} />
                <input type="hidden" name="hide" value={w.hidden_at ? "false" : "true"} />
                <button type="submit" className={secondaryButton}>
                  {w.hidden_at ? "Put back up" : "Take down"}
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
