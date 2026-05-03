"use client";

import { useSearchParams } from "next/navigation";
import { signIn } from "@/app/auth/actions";

export function LoginForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  return (
    <form action={signIn} className="space-y-5">
      <input type="hidden" name="redirect" value={redirect} />

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {decodeURIComponent(error)}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-tangaroa-700 focus:border-transparent transition"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-tangaroa-700 focus:border-transparent transition"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-tangaroa-800 py-3 text-sm font-semibold text-white hover:bg-tangaroa-700 active:scale-[0.98] transition-all"
      >
        Tomo mai — Sign in
      </button>

      <p className="text-center text-sm text-gray-500">
        Kāore he pūkete?{" "}
        <a href="/auth/signup" className="font-medium text-tangaroa-700 hover:underline">
          Sign up
        </a>
      </p>
    </form>
  );
}
