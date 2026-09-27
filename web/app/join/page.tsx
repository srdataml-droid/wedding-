import type { Metadata } from "next";
import { connection } from "next/server";
import { signUpVendor } from "../actions";
import { CATEGORIES, LAGOS_AREAS } from "@/lib/categories";
import { supabase } from "@/lib/supabase";
import { eyebrow, inputClass, labelClass, primaryButton } from "../_components/ui";

export const metadata: Metadata = { title: "Sign up as a vendor" };

const SHOW_COUNT_FROM = 5;

// Every visit reads the count, which keeps a free Supabase project active and
// gives vendors a reason to trust the list once it has a few names on it.
async function signupCount(): Promise<number | null> {
  await connection();
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

export default async function JoinPage({ searchParams }: PageProps<"/join">) {
  const [params, count] = await Promise.all([searchParams, signupCount()]);
  const errorKey = typeof params.error === "string" ? params.error : null;
  const error = errorKey ? ERRORS[errorKey] : null;

  return (
    <main className="mx-auto w-full max-w-md px-4 pb-16 pt-10">
      <header>
        <p className={eyebrow}>For vendors</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-ink">
          Get verified. Let couples find you.
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted">
          Together lists Lagos wedding vendors that couples can trust. Sign up
          below. We will meet you or video-call you, check your past work, and
          then put your profile live. It is free.
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
        {/* Left empty by people, filled in by spam bots. */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

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
            list="lagos-areas"
            placeholder="e.g. Surulere, Lekki, Ikeja"
            className={inputClass}
          />
          <datalist id="lagos-areas">
            {LAGOS_AREAS.map((a) => (
              <option key={a} value={a} />
            ))}
          </datalist>
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

        <label className={labelClass}>
          Starting price in naira <span className="font-normal text-muted">(optional)</span>
          <input
            name="starting_price"
            type="number"
            min={0}
            step={1000}
            inputMode="numeric"
            placeholder="e.g. 250000"
            className={inputClass}
          />
        </label>

        <label className={labelClass}>
          One line about your work <span className="font-normal text-muted">(optional)</span>
          <textarea
            name="about"
            maxLength={280}
            rows={3}
            placeholder="e.g. Traditional and white weddings across Lagos, 150+ weddings since 2018."
            className={inputClass}
          />
        </label>

        <p className="text-xs leading-relaxed text-muted">
          Once we have verified you, your profile goes live. Couples will see
          your WhatsApp number there and can message you directly.
        </p>

        <button type="submit" className={`mt-1 ${primaryButton}`}>
          Sign up
        </button>
      </form>
    </main>
  );
}
