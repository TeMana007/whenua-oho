import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@korero/data";

/**
 * Browser (client component) Supabase client.
 * Call this inside Client Components — never in Server Components or middleware.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
