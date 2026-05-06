import { createClient, SupabaseClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TypedSupabaseClient = SupabaseClient<any>;

/**
 * Browser / React Native client — uses the anon key.
 * Safe to call on the client side; RLS enforces access control.
 *
 * Note: Database generic omitted due to supabase-js 2.105.x type API changes.
 * Each call site casts query results to the appropriate type.
 */
export function createSupabaseClient(): TypedSupabaseClient {
  // Support both Next.js (NEXT_PUBLIC_) and Expo (EXPO_PUBLIC_) prefixes
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase env vars: set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY (web) " +
      "or EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY (mobile)"
    );
  }

  return createClient(url, key);
}

/**
 * Server-side admin client — uses the service role key.
 * NEVER expose this to the browser.
 * Only import in Next.js Route Handlers / Server Actions / Edge Functions.
 */
export function createSupabaseAdminClient(): TypedSupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local"
    );
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
