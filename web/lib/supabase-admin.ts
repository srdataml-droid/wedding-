import "server-only";
import { createClient } from "@supabase/supabase-js";

// Admin-only client. Uses the secret key, which bypasses Row Level Security.
// Only ever called from the admin page and its actions, after the password check.
// The key is set by Samuel in Vercel and never passes through a chat.
export function supabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY must be set for the admin page");
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
