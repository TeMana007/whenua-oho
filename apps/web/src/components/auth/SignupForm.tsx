"use client";

import { useSearchParams } from "next/navigation";
import { signUp } from "@/app/auth/actions";

export function SignupForm() {
  const searchParams = useSearchParams();
  const error   = searchParams.get("error");
  const success = searchParams.get("success");

  return (
    <form action={signUp} className="space-y-5">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-body text-red-700">
          {decodeURIComponent(error)}
        </div>
      )}
      {success && (
        <div className="rounded-xl bg-success/10 border border-success/30 px-4 py-3 text-sm font-body text-success">
          {decodeURIComponent(success)}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-body font-medium text-ink mb-1">
          Full name
        </label>
        <input
          id="name" name="name" type="text" required autoComplete="name"
          className="input-field"
          placeholder="Aroha Ngata"
        />
      </div>

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
          id="password" name="password" type="password" required autoComplete="new-password" minLength={8}
          className="input-field"
          placeholder="At least 8 characters"
        />
      </div>

      <div>
        <label htmlFor="class_code" className="block text-sm font-body font-medium text-ink mb-1">
          Class code{" "}
          <span className="text-ink/40 font-normal">(optional — ask your kaiako)</span>
        </label>
        <input
          id="class_code" name="class_code" type="text" autoComplete="off"
          className="input-field uppercase tracking-widest"
          placeholder="e.g. MAORI101"
        />
      </div>

      <button type="submit" className="btn-primary w-full">
        Hono mai — Join
      </button>

      <p className="text-center text-sm font-body text-ink/60">
        He pūkete tō?{" "}
        <a href="/auth/login" className="font-medium text-primary hover:text-accent transition underline underline-offset-2">
          Sign in
        </a>
      </p>
    </form>
  );
}
