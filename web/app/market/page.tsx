import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { getMarketItems } from "@/lib/market";
import { ItemCard } from "../_components/item-card";
import { eyebrow, inputClass, labelClass, secondaryButton } from "../_components/ui";

export const metadata: Metadata = {
  title: "Market",
  description: "Aso-ebi, souvenirs, cakes, gifts and wedding services from Lagos vendors checked by a real person.",
};

const SHOW = [
  { id: "", label: "Everything" },
  { id: "products", label: "Products" },
  { id: "services", label: "Services" },
  { id: "gifts", label: "Gifts" },
] as const;

function param(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim().slice(0, 60) : "";
}

export default async function MarketPage({ searchParams }: PageProps<"/market">) {
  const [params, items] = await Promise.all([searchParams, getMarketItems()]);
  const show = SHOW.some((s) => s.id === params.show) ? param(params.show) : "";
  const category = param(params.category);
  const q = param(params.q).toLowerCase();

  const results = items.filter(
    (i) =>
      (show !== "products" || i.kind === "product") &&
      (show !== "services" || i.kind === "service") &&
      (show !== "gifts" || i.gift) &&
      (!category || i.vendor.category === category) &&
      (!q || `${i.title} ${i.description ?? ""} ${i.vendor.business_name}`.toLowerCase().includes(q)),
  );
  const filtered = Boolean(show || category || q);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-10">
      <p className={eyebrow}>Market</p>
      <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-ink">
        {show === "gifts" ? "Gifts from verified vendors" : "Buy from vendors you can trust"}
      </h1>
      <p className="mt-2 text-base text-muted">
        Aso-ebi, souvenirs, cakes, gifts and services, sold by Lagos vendors we have met or video-called. Ask the
        seller on WhatsApp.
      </p>

      <form method="get" className="mt-6 grid gap-3 rounded-2xl border border-line bg-card p-4 shadow-sm sm:grid-cols-4">
        <label className={labelClass}>
          Show
          <select name="show" defaultValue={show} className={inputClass}>
            {SHOW.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Vendor type
          <select name="category" defaultValue={category} className={inputClass}>
            <option value="">All</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Search
          <input name="q" defaultValue={params.q ? param(params.q) : ""} placeholder="e.g. gele, hamper" className={inputClass} />
        </label>
        <div className="flex items-end">
          <button type="submit" className={`${secondaryButton} w-full`}>
            Search
          </button>
        </div>
      </form>

      <p className="mt-6 text-sm text-muted">
        {results.length} {results.length === 1 ? "item" : "items"}
        {filtered ? (
          <>
            {" "}
            ·{" "}
            <Link href="/market" className="text-wine underline underline-offset-4">
              Clear filters
            </Link>
          </>
        ) : null}
      </p>

      {results.length > 0 ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {results.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="mt-3 rounded-2xl border border-dashed border-line bg-card p-6 text-center">
          <p className="font-medium text-ink">{filtered ? "Nothing matches yet." : "The market opens as vendors are verified."}</p>
          <p className="mt-1 text-sm text-muted">
            Every seller here is a vendor we have checked. Do you sell for weddings in Lagos?
          </p>
          <Link href="/join" className="mt-3 inline-block text-sm font-semibold text-wine underline underline-offset-4">
            Get verified and sell here
          </Link>
        </div>
      )}

      <section className="mt-10 rounded-2xl border border-gold/30 bg-gold-soft p-5">
        <h2 className="font-semibold text-ink">Buying safely</h2>
        <ul className="mt-2 grid gap-1.5 text-sm leading-relaxed text-ink">
          <li>You deal with the vendor directly. Together never takes payment and never holds your money.</li>
          <li>Agree the price, delivery date and what is included on WhatsApp before you pay.</li>
          <li>Pay only the vendor on the listing. Together will never message you first asking you to pay anyone.</li>
          <li>
            If something goes wrong, leave a review on the vendor&apos;s profile. We read every review before it goes up,
            and we can take a vendor or an item down.
          </li>
        </ul>
      </section>
    </main>
  );
}
