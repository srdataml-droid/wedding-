// Small pure helpers shared by pages and actions.

export const SITE_URL = "https://together-seven-nu.vercel.app";

const LAGOS = "Africa/Lagos";

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: LAGOS,
  }).format(new Date(iso));
}

export function formatMonth(isoDate: string) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(isoDate));
}

export function formatNaira(amount: number) {
  return "₦" + new Intl.NumberFormat("en-NG").format(amount);
}

// Nigerian numbers are stored as typed (0803...). wa.me needs 2348031234567.
export function waNumber(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("234")) return digits;
  if (digits.startsWith("0")) return "234" + digits.slice(1);
  return digits;
}

export function waLink(raw: string, text: string) {
  return `https://wa.me/${waNumber(raw)}?text=${encodeURIComponent(text)}`;
}

export function slugify(name: string) {
  const base = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
  const suffix = crypto.randomUUID().slice(0, 4);
  return `${base || "vendor"}-${suffix}`;
}

export function isSlug(value: string) {
  return /^[a-z0-9-]{3,60}$/.test(value);
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(value);
}

export function text(formData: FormData, name: string, max = 120) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

// The last 24 months, newest first, for "When was your wedding?".
export function recentMonths(count = 24) {
  const now = new Date();
  const months: { value: string; label: string }[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const value = d.toISOString().slice(0, 7);
    months.push({ value, label: formatMonth(`${value}-01`) });
  }
  return months;
}
