import { signUpVendor } from "./actions";
import { CATEGORIES } from "@/lib/categories";

const ERRORS: Record<string, string> = {
  missing: "Please fill in your business name, category, area and WhatsApp number.",
  whatsapp: "That WhatsApp number does not look right. Use the format 0803 123 4567.",
  save: "Something went wrong saving your details. Please try again.",
};

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 outline-none focus:border-zinc-900";

export default async function Page({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const errorKey = typeof params.error === "string" ? params.error : null;
  const error = errorKey ? ERRORS[errorKey] : null;

  return (
    <main className="mx-auto w-full max-w-md px-4 py-10">
      <h1 className="text-2xl font-semibold text-zinc-900">Together</h1>
      <p className="mt-2 text-zinc-700">
        A list of Lagos wedding vendors that couples can trust. Every vendor on
        it has been met or called, and checked, by a real person.
      </p>
      <p className="mt-2 text-zinc-700">
        Sign up below. It takes one minute, and it is free while we build the
        list.
      </p>

      {error ? (
        <p className="mt-6 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <form action={signUpVendor} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800">
          Business name
          <input name="business_name" required maxLength={120} className={inputClass} />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800">
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

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800">
          Area of Lagos you work from
          <input
            name="area"
            required
            maxLength={120}
            placeholder="e.g. Surulere, Lekki, Ikeja"
            className={inputClass}
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800">
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

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800">
          Instagram handle (optional)
          <input name="instagram" maxLength={60} placeholder="@yourbusiness" className={inputClass} />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800">
          Years doing weddings (optional)
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
          className="mt-2 rounded-md bg-zinc-900 px-4 py-3 text-base font-medium text-white hover:bg-zinc-700"
        >
          Sign up
        </button>
      </form>

      <p className="mt-8 text-xs text-zinc-500">
        We will only use your number to confirm your details and tell you when
        the list is live.
      </p>
    </main>
  );
}
