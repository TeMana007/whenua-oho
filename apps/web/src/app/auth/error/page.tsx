import { Suspense } from "react";
import { AuthError } from "./AuthError";

export const metadata = { title: "Auth error — Kōrero Companion" };

export default function AuthErrorPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-tangaroa-900 to-tangaroa-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl px-8 py-10 max-w-md w-full text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Authentication error
        </h2>
        <Suspense>
          <AuthError />
        </Suspense>
        <a
          href="/auth/login"
          className="mt-6 inline-block rounded-xl bg-tangaroa-800 px-6 py-3 text-sm font-semibold text-white hover:bg-tangaroa-700 transition"
        >
          Back to sign in
        </a>
      </div>
    </main>
  );
}
