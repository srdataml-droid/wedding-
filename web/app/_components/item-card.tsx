import Link from "next/link";
import { priceLabel, type MarketItem } from "@/lib/market";
import { contactVendor } from "../vendors/[slug]/actions";

// One thing a verified vendor sells (D-012). The button logs an enquiry for the item and
// opens WhatsApp with a message that names it.
export function ItemCard({ item, showVendor = true }: { item: MarketItem; showVendor?: boolean }) {
  const ask = contactVendor.bind(null, item.vendor.slug);
  return (
    <article id={`item-${item.id}`} className="flex scroll-mt-6 flex-col rounded-2xl border border-line bg-card p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-wine">
        {item.kind === "product" ? "Product" : "Service"}
        {item.gift ? " · Good as a gift" : ""}
      </p>
      <h3 className="mt-1 text-lg font-semibold leading-snug text-ink">{item.title}</h3>
      <p className="mt-0.5 text-base font-medium text-ink">{priceLabel(item)}</p>
      {item.description ? (
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted">{item.description}</p>
      ) : null}
      {showVendor ? (
        <p className="mt-3 text-sm text-muted">
          Sold by{" "}
          <Link href={`/vendors/${item.vendor.slug}`} className="font-medium text-ink underline underline-offset-4">
            {item.vendor.business_name}
          </Link>{" "}
          <span className="whitespace-nowrap text-xs font-medium text-wine-deep">✓ Verified</span> · {item.vendor.area}
        </p>
      ) : null}
      <form action={ask} className="mt-auto pt-4">
        <input type="hidden" name="item" value={item.id} />
        <button
          type="submit"
          className="w-full rounded-lg bg-wine px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-wine-deep"
        >
          Ask on WhatsApp
        </button>
      </form>
    </article>
  );
}
