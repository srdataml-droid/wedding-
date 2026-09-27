import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// One admin, one password. The password lives only in Vercel as ADMIN_PASSWORD.
// The session cookie is signed with the password itself, so changing the password
// signs everyone out.

const COOKIE = "together_admin";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
export const MIN_PASSWORD_LENGTH = 12;

function adminPassword() {
  return process.env.ADMIN_PASSWORD ?? "";
}

// What stops the admin page from switching on, named so Samuel can fix it without guessing.
// Only names and lengths, never values. When this list is empty the page is on.
export function adminSetupProblems() {
  const problems: string[] = [];
  const secret = process.env.SUPABASE_SECRET_KEY ?? "";
  const password = adminPassword();
  if (!process.env.SUPABASE_URL) problems.push("SUPABASE_URL is missing.");
  if (!secret) problems.push("SUPABASE_SECRET_KEY is missing.");
  else if (secret.startsWith("sb_publishable_"))
    problems.push("SUPABASE_SECRET_KEY holds the publishable key. It needs the secret key (sb_secret_...).");
  if (!password) problems.push("ADMIN_PASSWORD is missing.");
  else if (password.length < MIN_PASSWORD_LENGTH)
    problems.push(`ADMIN_PASSWORD is shorter than ${MIN_PASSWORD_LENGTH} characters.`);
  return problems;
}

export function adminConfigured() {
  return adminSetupProblems().length === 0;
}

function sameText(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

function sign(expires: number) {
  return createHmac("sha256", adminPassword()).update(`together-admin|${expires}`).digest("hex");
}

export function passwordMatches(attempt: string) {
  return adminConfigured() && sameText(attempt, adminPassword());
}

export async function startAdminSession() {
  const expires = Date.now() + MAX_AGE_SECONDS * 1000;
  (await cookies()).set(COOKIE, `${expires}.${sign(expires)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function endAdminSession() {
  (await cookies()).delete(COOKIE);
}

export async function isAdmin() {
  // Read the cookie first, always. This keeps every admin page rendered per request,
  // never prerendered at build time when the password is not set yet.
  const value = (await cookies()).get(COOKIE)?.value;
  if (!adminConfigured() || !value) return false;
  const [expiresRaw, signature] = value.split(".");
  const expires = Number(expiresRaw);
  if (!signature || !Number.isFinite(expires) || expires < Date.now()) return false;
  return sameText(signature, sign(expires));
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}
