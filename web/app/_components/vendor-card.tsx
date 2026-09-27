import Link from "next/link";
import type { PublicVendor, Rating } from "@/lib/data";
import { formatNaira } from "@/lib/format";
import { RatingLine } from "./stars";

export function VendorCard({ vendor, rating }: { vendor: PublicVendor; rating?: Rating }) {
  return (
    <Link
      href={`/vendors/${vendor.slug}`}
      className="block rounded-2xl border border-line bg-card p-4 shadow-sm transition hover:border-wine"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-wine">{vendor.category}</p>
          <h3 className="mt-1 truncate text-lg font-semibold text-ink">{vendor.business_name}</h3>
          <p className="mt-0.5 text-sm text-muted">
            {vendor.area}
            {vendor.years_active ? ` · ${vendor.years_active} yrs doing weddings` : ""}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-blush px-2.5 py-1 text-xs font-medium text-wine-deep">
          ✓ Verified
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <RatingLine rating={rating} />
        {vendor.starting_price ? (
          <span className="text-sm text-ink">From {formatNaira(vendor.starting_price)}</span>
        ) : null}
      </div>
    </Link>
  );
}
