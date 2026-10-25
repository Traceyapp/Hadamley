import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const g = globalThis as unknown as { __hadamleySupabase?: SupabaseClient };

/** Server-only Supabase client using the secret key. Never import this into client components. */
export function supabase(): SupabaseClient {
  g.__hadamleySupabase ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return g.__hadamleySupabase;
}
