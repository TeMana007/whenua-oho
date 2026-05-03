import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata = { title: "Sign in — Kōrero Companion" };

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold text-secondary tracking-tight">
            Kōrero Companion
          </h1>
          <p className="mt-2 text-secondary/70 text-sm font-body">
            Tomo mai ki tō akoranga — Welcome back to your learning
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl px-8 py-10">
          <h2 className="font-heading text-xl font-semibold text-ink mb-6">Sign in</h2>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
