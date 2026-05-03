import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware handles most redirects, but this is a belt-and-suspenders check
  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-tangaroa-800 text-white">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/dashboard" className="font-bold text-lg tracking-tight">
            Kōrero Companion
          </a>
          <div className="flex items-center gap-6 text-sm">
            <a href="/practice" className="text-tangaroa-200 hover:text-white transition">
              Practice
            </a>
            <a href="/progress" className="text-tangaroa-200 hover:text-white transition">
              Progress
            </a>
            <a href="/challenges" className="text-tangaroa-200 hover:text-white transition">
              Challenges
            </a>
            <form action={signOut}>
              <button
                type="submit"
                className="text-tangaroa-300 hover:text-white transition text-xs"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
