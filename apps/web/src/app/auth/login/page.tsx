import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Sign in — Kōrero Companion" };

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-tangaroa-900 to-tangaroa-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Kōrero Companion
          </h1>
          <p className="mt-2 text-tangaroa-200 text-sm">
            Tomo mai ki tō akoranga — Welcome back to your learning
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl px-8 py-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Sign in</h2>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
