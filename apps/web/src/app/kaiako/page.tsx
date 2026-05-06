import { cookies }     from "next/headers";
import { redirect }    from "next/navigation";
import { kaiakologin } from "./actions";

export const metadata = { title: "Kaiako Login — Kōrero Companion" };

export default async function KaiakoLoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  // Already logged in?
  const cookieStore = await cookies();
  if (cookieStore.get("kaiako_class_id")) redirect("/kaiako/dashboard");

  const errorMsg = searchParams.error ? decodeURIComponent(searchParams.error) : null;

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-accent/20 items-center justify-center mb-2">
            <svg viewBox="0 0 60 60" className="w-10 h-10" fill="none">
              <circle cx="30" cy="30" r="24" stroke="#C8A951" strokeWidth="6" />
              <circle cx="30" cy="18" r="10" stroke="#C8A951" strokeWidth="5" />
              <circle cx="30" cy="10" r="4"  stroke="#C8A951" strokeWidth="4" />
            </svg>
          </div>
          <h1 className="font-heading text-3xl text-secondary">Kaiako Portal</h1>
          <p className="font-body text-secondary/50 text-sm">
            Teacher dashboard for Kōrero Companion
          </p>
        </div>

        {/* Login card */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl space-y-5">
          <div className="space-y-1">
            <h2 className="font-heading text-xl text-primary">Tēnā koe, kaiako</h2>
            <p className="font-body text-sm text-ink/50">Enter your class code to access your dashboard.</p>
          </div>

          {errorMsg && (
            <div className="bg-warning/10 border border-warning/30 rounded-xl px-4 py-3">
              <p className="font-body text-sm text-warning">{errorMsg}</p>
            </div>
          )}

          <form action={kaiakologin} className="space-y-4">
            <div className="space-y-1">
              <label className="font-body text-xs text-ink/60 uppercase tracking-wider" htmlFor="classCode">
                Class Code
              </label>
              <input
                id="classCode"
                name="classCode"
                type="text"
                required
                placeholder="e.g. KAKANO01"
                className="input-field uppercase tracking-widest font-bold text-center text-lg"
                autoComplete="off"
                autoCapitalize="characters"
              />
            </div>

            <details className="group">
              <summary className="font-body text-xs text-ink/40 cursor-pointer select-none hover:text-ink/60 transition">
                + Sign in with email (optional)
              </summary>
              <div className="mt-3 space-y-3">
                <input
                  name="email"
                  type="email"
                  placeholder="Email address"
                  className="input-field"
                />
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  className="input-field"
                />
              </div>
            </details>

            <button type="submit" className="w-full btn-primary">
              Enter dashboard →
            </button>
          </form>

          {/* Attribution */}
          <p className="text-center font-body text-xs text-ink/25 pt-2">
            Nā Dr. Rāpata Wiri ngā akoranga
          </p>
        </div>
      </div>
    </div>
  );
}
