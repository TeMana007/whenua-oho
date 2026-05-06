import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { CookieMethodsServer } from "@supabase/ssr";

/**
 * Server (Server Components, Route Handlers, Server Actions) Supabase client.
 * Reads and writes session cookies automatically.
 *
 * Note: The Database generic is intentionally omitted due to a version
 * mismatch between @supabase/ssr 0.4.1 and @supabase/supabase-js 2.105.x
 * (the SSR package imports from a dist path that no longer exists).
 * Type safety on query results is handled via explicit casts at each call site.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createClient(): ReturnType<typeof createServerClient<any>> {
  const cookieStore = cookies();

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return cookieStore.getAll();
    },
    setAll(cookiesToSet) {
      try {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        );
      } catch {
        // setAll called from a Server Component — cookies will be set by middleware
      }
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createServerClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieMethods }
  );
}
