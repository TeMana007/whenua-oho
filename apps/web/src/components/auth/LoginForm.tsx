"use client";

import { useSearchParams } from "next/navigation";
import { signIn } from "@/app/auth/actions";

export function LoginForm() {
  const searchParams = useSearchParams();
  const error    = searchParams.get("error");
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  return (
    <form action={signIn} className="space-y-5">
      <input type="hidden" name="redirect" value={redirect} />

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 font-body">
          {decodeURIComponent(error)}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-body font-medium text-ink mb-1">
          Email
        </label>
        <input
          id="email" name="email" type="email" required autoComplete="email"
          className="input-field"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-body font-medium text-ink mb-1">
          Password
        </label>
        <input
          id="password" name="password" type="password" required autoComplete="current-password"
          className="input-field"
          placeholder="••••••••"
        />
      </div>

      <button type="submit" className="btn-primary w-full">
        Tomo mai — Sign in
      </button>

      <p className="text-center text-sm font-body text-ink/60">
        Kāore he pūkete?{" "}
        <a href="/auth/signup" className="font-medium text-primary hover:text-accent transition underline underline-offset-2">
          Sign up
        </a>
      </p>
    </form>
  );
}
