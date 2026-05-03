import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

const NAV_ITEMS = [
  { href: "/dashboard",  label: "Home",    icon: "🏠" },
  { href: "/practice",   label: "Kōrero",  icon: "🎙️" },
  { href: "/review",     label: "Review",  icon: "📚" },
  { href: "/group",      label: "Group",   icon: "👥" },
  { href: "/progress",   label: "Progress",icon: "📊" },
];

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="min-h-screen bg-secondary">
      {/* ── Desktop top nav ──────────────────────────────────────────── */}
      <nav className="hidden sm:flex bg-primary text-secondary shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto w-full px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="font-heading text-xl font-bold text-secondary tracking-tight">
            Kōrero Companion
          </Link>
          <div className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-body text-sm text-secondary/70 hover:text-secondary hover:bg-white/10 transition"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
          <form action={signOut}>
            <button type="submit" className="font-body text-xs text-secondary/40 hover:text-secondary/80 transition px-2 py-1">
              Sign out
            </button>
          </form>
        </div>
      </nav>

      {/* ── Mobile top bar ───────────────────────────────────────────── */}
      <div className="sm:hidden sticky top-0 z-40 bg-primary px-4 h-14 flex items-center justify-between">
        <span className="font-heading text-lg font-bold text-secondary">Kōrero Companion</span>
        <form action={signOut}>
          <button type="submit" className="font-body text-xs text-secondary/40">Sign out</button>
        </form>
      </div>

      {/* ── Page content ─────────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>

      {/* ── Mobile bottom nav ────────────────────────────────────────── */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-lg">
        <div className="flex items-stretch h-16">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 font-body text-[10px] text-ink/40 hover:text-primary transition active:scale-95"
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className="leading-none">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
