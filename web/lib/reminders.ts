import { SITE_URL, daysBetween, formatDayMonth, ordinal } from "./format";

// Anniversary reminders (D-012). A couple who asked gets one WhatsApp message a year, which
// Samuel sends by hand from /admin. Plain date maths here, so it can be checked on its own.

// A reminder shows on /admin this many days before the anniversary, so a weekly look at
// the page catches every couple about two to three weeks ahead.
export const REMIND_DAYS_AHEAD = 21;

// A reminder sent within this many days before an anniversary counts for that anniversary.
const SENT_WINDOW_DAYS = 60;

function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// The anniversary in a given year. A 29 February wedding is kept on 28 February in other years.
function anniversaryIn(weddingDate: string, year: number) {
  const [, month, day] = weddingDate.split("-").map(Number);
  const d = month === 2 && day === 29 && !isLeapYear(year) ? 28 : day;
  return `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

// The next anniversary on or after today, and which one it is. The first is a year after the wedding.
export function nextAnniversary(weddingDate: string, today: string) {
  const weddingYear = Number(weddingDate.slice(0, 4));
  let year = Math.max(Number(today.slice(0, 4)), weddingYear + 1);
  let date = anniversaryIn(weddingDate, year);
  if (date < today) {
    year += 1;
    date = anniversaryIn(weddingDate, year);
  }
  return { date, years: year - weddingYear, daysAway: daysBetween(today, date) };
}

// Due: the anniversary is close, and no reminder has gone out for it yet.
export function reminderDue(weddingDate: string, sentOn: string | null, today: string) {
  const next = nextAnniversary(weddingDate, today);
  const alreadySent = sentOn !== null && daysBetween(sentOn, next.date) <= SENT_WINDOW_DAYS;
  return next.daysAway <= REMIND_DAYS_AHEAD && !alreadySent ? next : null;
}

export function reminderMessage(partnerOne: string, partnerTwo: string, date: string, years: number) {
  return `Hello ${partnerOne} and ${partnerTwo}, this is Together. Your ${ordinal(years)} wedding anniversary is on ${formatDayMonth(date)}. Congratulations! If you are planning a gift, here are gifts from verified Lagos vendors: ${SITE_URL}/market?show=gifts. Reply STOP and we will not message you again.`;
}
