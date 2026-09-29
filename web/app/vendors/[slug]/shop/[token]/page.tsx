import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MAX_ITEMS, getShop, priceLabel, type ShopItem } from "@/lib/market";
import { SITE_URL, isSlug, waShare } from "@/lib/format";
import { isToken } from "@/lib/tokens";
import { cardClass, eyebrow, inputClass, labelClass, secondaryButton } from "../../../../_components/ui";
import { addItem, removeItem, updateItem } from "./actions";

export const metadata: Metadata = {
  title: "Your shop",
  robots: { index: false, follow: false },
  // The private token is in this page's address. Never send it to other sites.
  referrer: "no-referrer",
};

const SAVED: Record<string, string> = {
  added: "Item added.",
  saved: "Changes saved.",
  removed: "Item removed.",
};

const ERRORS: Record<string, string> = {
  missing: "Say whether it is a product or a service, and give it a name of at least 2 letters.",
  price: "That price does not look right. Use numbers only, like 25,000, or leave it empty.",
  full: `A shop can have ${MAX_ITEMS} items. Remove one to add another.`,
  confirm: "Tick the box to confirm.",
  save: "That did not save. Please try again.",
};

const saveButton = "rounded-lg bg-wine px-4 py-2.5 text-sm font-semibold text-white hover:bg-wine-deep";

function ItemForm({
  action,
  item,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  item?: ShopItem;
  submitLabel: string;
}) {
  return (
    <form action={action} className="mt-3 flex flex-col gap-4">
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <fieldset>
        <legend className={labelClass}>Is it a product or a service?</legend>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {[
            { value: "product", label: "A product" },
            { value: "service", label: "A service" },
          ].map((o) => (
            <label
              key={o.value}
              className="cursor-pointer rounded-lg border border-line px-3 py-2.5 text-center text-sm text-ink has-[:checked]:border-wine has-[:checked]:bg-blush has-[:checked]:text-wine-deep"
            >
              <input type="radio" name="kind" value={o.value} required defaultChecked={item?.kind === o.value} className="sr-only" />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>
      <label className={labelClass}>
        Name
        <input
          name="title"
          required
          minLength={2}
          maxLength={80}
          defaultValue={item?.title}
          placeholder="e.g. Aso-oke set for the couple"
          className={inputClass}
        />
      </label>
      <div className="grid grid-cols-2 items-end gap-3">
        <label className={labelClass}>
          Price in naira <span className="font-normal text-muted">(optional)</span>
          <input
            name="price"
            inputMode="numeric"
            maxLength={20}
            defaultValue={item?.price != null ? new Intl.NumberFormat("en-NG").format(item.price) : ""}
            placeholder="e.g. 25,000"
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          After the price <span className="font-normal text-muted">(optional)</span>
          <input
            name="price_unit"
            maxLength={24}
            defaultValue={item?.price_unit ?? ""}
            placeholder="e.g. per yard"
            className={inputClass}
          />
        </label>
      </div>
      <label className={labelClass}>
        Describe it <span className="font-normal text-muted">(optional)</span>
        <textarea
          name="description"
          maxLength={500}
          rows={3}
          defaultValue={item?.description ?? ""}
          placeholder="What is included, colours or sizes, how long it takes, delivery in Lagos"
          className={inputClass}
        />
      </label>
      <label className="flex items-start gap-2.5 text-sm text-ink">
        <input type="checkbox" name="gift" defaultChecked={item?.gift} className="mt-0.5 h-4 w-4 accent-wine" />
        Good as a gift, for example for an anniversary
      </label>
      <div>
        <button type="submit" className={saveButton}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

export default async function ShopPage({ params, searchParams }: PageProps<"/vendors/[slug]/shop/[token]">) {
  const [{ slug, token }, query] = await Promise.all([params, searchParams]);
  if (!isSlug(slug) || !isToken(token)) notFound();
  const shop = await getShop(slug, token);
  if (!shop) notFound();

  const link = `${SITE_URL}/vendors/${slug}/shop/${token}`;
  const live = shop.verified && !shop.hidden;
  const saved = typeof query.saved === "string" ? SAVED[query.saved] : null;
  const error = typeof query.error === "string" ? ERRORS[query.error] : null;
  const add = addItem.bind(null, slug, token);
  const update = updateItem.bind(null, slug, token);
  const remove = removeItem.bind(null, slug, token);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-16 pt-8">
      <p className={eyebrow}>Your shop on Together</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-ink">{shop.business_name}</h1>

      {live ? (
        <p className="mt-4 rounded-lg border border-line bg-card px-4 py-3 text-sm text-ink">
          Live. Couples see your items in the{" "}
          <Link href="/market" className="text-wine underline underline-offset-4">
            market
          </Link>{" "}
          and on{" "}
          <Link href={`/vendors/${slug}#sells`} className="text-wine underline underline-offset-4">
            your profile
          </Link>
          , and message you on WhatsApp.
        </p>
      ) : (
        <p role="alert" className="mt-4 rounded-lg border border-wine/30 bg-blush px-4 py-3 text-sm text-wine-deep">
          {shop.hidden
            ? "Together has hidden your profile, so your items are not public. Message Together on WhatsApp to ask why."
            : "Your items are saved but not public yet. They appear once Together has verified you."}
        </p>
      )}

      <section className="mt-5 rounded-2xl border border-line bg-card p-5">
        <p className="font-semibold text-ink">Your private shop link</p>
        <p className="mt-1 text-sm text-muted">
          This link lets you change what you sell on Together. There is no password, so keep it private. If you lose
          it, ask Together for a new one; the old one then stops working.
        </p>
        <input readOnly value={link} className={`${inputClass} font-mono text-xs`} aria-label="Your private shop link" />
        <a
          href={waShare(`My private shop link on Together. Do not forward: ${link}`)}
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-3 ${secondaryButton}`}
        >
          Send it to myself on WhatsApp
        </a>
      </section>

      {saved ? (
        <p role="status" className="mt-5 rounded-lg border border-line bg-card px-4 py-3 text-sm text-ink">
          {saved}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-5 rounded-lg border border-wine/30 bg-blush px-4 py-3 text-sm text-wine-deep">
          {error}
        </p>
      ) : null}

      <section id="items" className="mt-8 scroll-mt-6">
        <h2 className="font-display text-2xl font-semibold text-ink">What you sell ({shop.items.length})</h2>
        {shop.items.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Nothing yet. Add your first item below.</p>
        ) : (
          <ul className="mt-3 grid gap-3">
            {shop.items.map((item) => (
              <li key={item.id} id={`item-${item.id}`} className={`scroll-mt-6 ${cardClass}`}>
                <p className="text-xs font-semibold uppercase tracking-wider text-wine">
                  {item.kind === "product" ? "Product" : "Service"}
                  {item.gift ? " · Good as a gift" : ""}
                </p>
                <p className="mt-1 text-lg font-semibold text-ink">{item.title}</p>
                <p className="text-base text-ink">{priceLabel(item)}</p>
                {item.hidden ? (
                  <p className="mt-2 text-sm font-medium text-wine-deep">Taken down by Together. Couples cannot see it.</p>
                ) : null}
                {item.description ? (
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted">{item.description}</p>
                ) : null}
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-semibold text-wine">Change or remove</summary>
                  <ItemForm action={update} item={item} submitLabel="Save changes" />
                  <form action={remove} className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-4 text-sm">
                    <input type="hidden" name="id" value={item.id} />
                    <label className="flex items-center gap-2 text-muted">
                      <input type="checkbox" name="confirm" value="yes" /> Yes, remove it
                    </label>
                    <button type="submit" className="text-wine-deep underline underline-offset-4">
                      Remove
                    </button>
                  </form>
                </details>
              </li>
            ))}
          </ul>
        )}
      </section>

      {shop.items.length < MAX_ITEMS ? (
        <section id="add" className={`mt-8 scroll-mt-6 ${cardClass}`}>
          <h2 className="font-display text-2xl font-semibold text-ink">Add something you sell</h2>
          <p className="mt-1 text-sm text-muted">
            One product or service at a time. Couples ask you about it on WhatsApp. Together takes no fee and never
            handles payment.
          </p>
          <ItemForm action={add} submitLabel="Add item" />
        </section>
      ) : null}
    </main>
  );
}
