import { signUpVendor } from "./actions";
import { CATEGORIES } from "@/lib/categories";
import { supabase } from "@/lib/supabase";

const SHOW_COUNT_FROM = 5;

// Every visit reads the count, which keeps a free Supabase project active and
// gives vendors a reason to trust the list once it has a few names on it.
async function vendorCount(): Promise<number | null> {
  try {
    const { data, error } = await supabase().rpc("vendor_count");
    if (error) {
      console.error("vendor count failed", error);
      return null;
    }
    const count = Number(data);
    return Number.isFinite(count) ? count : null;
  } catch (err) {
    console.error("vendor count failed", err);
    return null;
  }
}

const ERRORS: Record<string, string> = {
  missing: "Please fill in your business name, category, area and WhatsApp number.",
  whatsapp: "That WhatsApp number does not look right. Use the format 0803 123 4567.",
  save: "Something went wrong saving your details. Please try again.",
};

const labelClass = "block text-sm font-medium text-ink";
const inputClass =
  "mt-1.5 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-base text-ink placeholder:text-muted/70 outline-none transition focus:border-wine focus:ring-2 focus:ring-wine/20";

export default async function Page({ searchParams }: PageProps<"/">) {
  const [params, count] = await Promise.all([searchParams, vendorCount()]);
  const errorKey = typeof params.error === "string" ? params.error : null;
  const error = errorKey ? ERRORS[errorKey] : null;

  return (
    <main className="mx-auto w-full max-w-md px-4 pb-16 pt-10">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-wine">
          Together
        </p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-ink">
          Lagos wedding vendors couples can trust.
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted">
          Every vendor on the list has been met or called, and checked, by a
          real person. Sign up below. It takes one minute and is free while we
          build the list.
        </p>
        {count !== null && count >= SHOW_COUNT_FROM ? (
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-sm font-medium text-ink">
            <span className="h-2 w-2 rounded-full bg-wine" aria-hidden="true" />
            {count} vendors signed up so far
          </p>
        ) : null}
      </header>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-lg border border-wine/30 bg-blush px-4 py-3 text-sm text-wine-deep"
        >
          {error}
        </p>
      ) : null}

      <form
        action={signUpVendor}
        className="mt-6 flex flex-col gap-4 rounded-2xl border border-line bg-card p-5 shadow-sm"
      >
        <label className={labelClass}>
          Business name
          <input name="business_name" required maxLength={120} className={inputClass} />
        </label>

        <label className={labelClass}>
          What do you do?
          <select name="category" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              Choose one
            </option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className={labelClass}>
          Area of Lagos you work from
          <input
            name="area"
            required
            maxLength={120}
            placeholder="e.g. Surulere, Lekki, Ikeja"
            className={inputClass}
          />
        </label>

        <label className={labelClass}>
          WhatsApp number
          <input
            name="whatsapp"
            type="tel"
            required
            inputMode="tel"
            placeholder="0803 123 4567"
            className={inputClass}
          />
        </label>

        <label className={labelClass}>
          Instagram handle <span className="font-normal text-muted">(optional)</span>
          <input name="instagram" maxLength={60} placeholder="@yourbusiness" className={inputClass} />
        </label>

        <label className={labelClass}>
          Years doing weddings <span className="font-normal text-muted">(optional)</span>
          <input
            name="years_active"
            type="number"
            min={0}
            max={60}
            inputMode="numeric"
            className={inputClass}
          />
        </label>

        <button
          type="submit"
          className="mt-2 w-full rounded-lg bg-wine px-4 py-3 text-base font-semibold text-white transition hover:bg-wine-deep active:bg-wine-deep"
        >
          Sign up
        </button>
      </form>

      <p className="mt-6 text-center text-xs leading-relaxed text-muted">
        We will only use your number to confirm your details and tell you when
        the list is live.
      </p>
    </main>
  );
}
