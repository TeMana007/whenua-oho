import { Suspense } from "react";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata = { title: "Sign up — Kōrero Companion" };

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold text-secondary tracking-tight">
            Kōrero Companion
          </h1>
          <p className="mt-2 text-secondary/70 text-sm font-body">
            Tīmata mai i konei — Start your te reo journey here
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl px-8 py-10">
          <h2 className="font-heading text-xl font-semibold text-ink mb-6">
            Create your account
          </h2>
          <Suspense>
            <SignupForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
