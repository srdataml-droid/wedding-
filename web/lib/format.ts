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

// "2026-12-12" → "Saturday, 12 December 2026". Date-only values carry no time zone.
export function formatLongDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

// "14:00" → "2:00 pm"
export function formatTime(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return hhmm;
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

// Today's date in Lagos, as YYYY-MM-DD.
export function todayInLagos() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: LAGOS }).format(new Date());
}

// Whole days between two date-only values.
export function daysBetween(fromIso: string, toIso: string) {
  return Math.round((Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso}T00:00:00Z`)) / 86_400_000);
}

// Whole days from today in Lagos to a date-only value. Negative once it has passed.
export function daysUntil(isoDate: string) {
  return daysBetween(todayInLagos(), isoDate);
}

// "2026-12-12" → "12 December"
export function formatDayMonth(isoDate: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", timeZone: "UTC" }).format(
    new Date(`${isoDate}T00:00:00Z`),
  );
}

// 1 → "1st", 2 → "2nd", 11 → "11th", 23 → "23rd"
export function ordinal(n: number) {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${{ 1: "st", 2: "nd", 3: "rd" }[n % 10] ?? "th"}`;
}

export function countdownLabel(isoDate: string) {
  const days = daysUntil(isoDate);
  if (days > 1) return `${days} days to go`;
  if (days === 1) return "Tomorrow";
  if (days === 0) return "Today";
  return "Married";
}

export function mapsLink(place: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;
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

// Opens WhatsApp with the text ready, and lets the person pick who to send it to.
export function waShare(text: string) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
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

// A real calendar date in YYYY-MM-DD form, so 2026-02-30 is refused before it reaches the database.
export function isIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
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
