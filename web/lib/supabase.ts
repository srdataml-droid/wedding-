import "server-only";
import { createClient } from "@supabase/supabase-js";

// Uses the publishable key, which is safe to expose, though it is only ever used on the
// server here. Row Level Security decides what it may do: add a sign-up and call
// vendor_count(). Nothing else. See supabase/migrations/0002_public_signup.sql.
export function supabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY must be set");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
