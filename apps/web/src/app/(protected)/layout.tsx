import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

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
      <nav className="bg-primary text-secondary shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/dashboard" className="font-heading text-xl font-bold text-secondary tracking-tight">
            Kōrero Companion
          </a>
          <div className="flex items-center gap-6 text-sm font-body">
            <a href="/practice"   className="text-secondary/70 hover:text-secondary transition">Practice</a>
            <a href="/progress"   className="text-secondary/70 hover:text-secondary transition">Progress</a>
            <a href="/challenges" className="text-secondary/70 hover:text-secondary transition">Challenges</a>
            <form action={signOut}>
              <button type="submit" className="text-secondary/50 hover:text-secondary transition text-xs">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
