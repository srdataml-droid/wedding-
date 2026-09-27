import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { getPublicVendors, getRatings } from "@/lib/data";
import { VendorCard } from "../_components/vendor-card";
import { eyebrow, inputClass, labelClass, secondaryButton } from "../_components/ui";

export const metadata: Metadata = { title: "Find a vendor" };

function param(value: string | string[] | undefined) {
  return typeof value === "string" ? value.trim().slice(0, 60) : "";
}

export default async function VendorsPage({ searchParams }: PageProps<"/vendors">) {
  const [params, vendors, ratings] = await Promise.all([searchParams, getPublicVendors(), getRatings()]);
  const category = param(params.category);
  const area = param(params.area);
  const q = param(params.q).toLowerCase();

  const areas = [...new Set(vendors.map((v) => v.area))].sort((a, b) => a.localeCompare(b));
  const results = vendors.filter(
    (v) =>
      (!category || v.category === category) &&
      (!area || v.area === area) &&
      (!q || v.business_name.toLowerCase().includes(q)),
  );
  const filtered = Boolean(category || area || q);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-10">
      <p className={eyebrow}>Verified vendors</p>
      <h1 className="mt-3 text-3xl font-semibold leading-tight text-ink">Find a vendor</h1>
      <p className="mt-2 text-base text-muted">
        Every vendor here has been checked by a real person before going live.
      </p>

      <form method="get" className="mt-6 grid gap-3 rounded-2xl border border-line bg-card p-4 shadow-sm sm:grid-cols-4">
        <label className={labelClass}>
          Category
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
          Area
          <select name="area" defaultValue={area} className={inputClass}>
            <option value="">All of Lagos</option>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Name
          <input name="q" defaultValue={params.q ? param(params.q) : ""} placeholder="Search by name" className={inputClass} />
        </label>
        <div className="flex items-end gap-2">
          <button type="submit" className={`${secondaryButton} w-full`}>
            Search
          </button>
        </div>
      </form>

      <p className="mt-6 text-sm text-muted">
        {results.length} {results.length === 1 ? "vendor" : "vendors"}
        {filtered ? (
          <>
            {" "}
            ·{" "}
            <Link href="/vendors" className="text-wine underline underline-offset-4">
              Clear filters
            </Link>
          </>
        ) : null}
      </p>

      {results.length > 0 ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {results.map((v) => (
            <VendorCard key={v.id} vendor={v} rating={ratings.get(v.id)} />
          ))}
        </div>
      ) : (
        <div className="mt-3 rounded-2xl border border-dashed border-line bg-card p-6 text-center">
          <p className="font-medium text-ink">No verified vendors here yet.</p>
          <p className="mt-1 text-sm text-muted">
            We are checking vendors across Lagos every week. Know a great one?
          </p>
          <Link href="/join" className="mt-3 inline-block text-sm font-semibold text-wine underline underline-offset-4">
            Send them the vendor sign-up page
          </Link>
        </div>
      )}
    </main>
  );
}
