"use client";

import { useSearchParams } from "next/navigation";
import { signUp } from "@/app/auth/actions";

export function SignupForm() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const success = searchParams.get("success");

  return (
    <form action={signUp} className="space-y-5">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {decodeURIComponent(error)}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          {decodeURIComponent(success)}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Full name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-tangaroa-700 focus:border-transparent transition"
          placeholder="Aroha Ngata"
        />
      </div>

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
          autoComplete="new-password"
          minLength={8}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-tangaroa-700 focus:border-transparent transition"
          placeholder="At least 8 characters"
        />
      </div>

      <div>
        <label htmlFor="class_code" className="block text-sm font-medium text-gray-700 mb-1">
          Class code{" "}
          <span className="text-gray-400 font-normal">(optional — ask your kaiako)</span>
        </label>
        <input
          id="class_code"
          name="class_code"
          type="text"
          autoComplete="off"
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-tangaroa-700 focus:border-transparent transition"
          placeholder="e.g. MAORI101"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-tangaroa-800 py-3 text-sm font-semibold text-white hover:bg-tangaroa-700 active:scale-[0.98] transition-all"
      >
        Hono mai — Join
      </button>

      <p className="text-center text-sm text-gray-500">
        He pūkete tō?{" "}
        <a href="/auth/login" className="font-medium text-tangaroa-700 hover:underline">
          Sign in
        </a>
      </p>
    </form>
  );
}
