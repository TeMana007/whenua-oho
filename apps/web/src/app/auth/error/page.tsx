import { Suspense } from "react";
import { AuthError } from "./AuthError";

export const metadata = { title: "Auth error — Kōrero Companion" };

export default function AuthErrorPage() {
  return (
    <main className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl px-8 py-10 max-w-md w-full text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="font-heading text-xl font-semibold text-ink mb-2">
          Authentication error
        </h2>
        <Suspense>
          <AuthError />
        </Suspense>
        <a href="/auth/login" className="btn-primary mt-6 inline-flex">
          Back to sign in
        </a>
      </div>
    </main>
  );
}
