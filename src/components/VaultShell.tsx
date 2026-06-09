import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { ReactNode } from "react";
import { Eye, Brain, FileLock2, LayoutDashboard, LogOut, Search, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ParticleField } from "./ParticleField";

const nav = [
  { to: "/dashboard", label: "Command", icon: LayoutDashboard },
  { to: "/mysteries", label: "Mysteries", icon: Search },
  { to: "/rabbit-hole", label: "Rabbit Hole", icon: Brain },
  { to: "/vault", label: "Vault Archive", icon: FileLock2 },
  { to: "/reality-check", label: "Reality Check", icon: ShieldCheck },
] as const;

export function VaultShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function signOut() {
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen relative text-foreground">
      <ParticleField />
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 shrink-0 flex-col gap-2 border-r border-border/60 bg-sidebar/80 backdrop-blur-xl min-h-screen p-4 sticky top-0">
          <Link to="/dashboard" className="flex items-center gap-2 px-2 py-3">
            <Eye className="h-6 w-6 text-primary animate-flicker" />
            <span className="font-mono text-sm tracking-[0.2em] text-glow">THE VAULT</span>
          </Link>
          <nav className="flex flex-col gap-1 mt-4">
            {nav.map((n) => {
              const active = pathname.startsWith(n.to);
              const Icon = n.icon;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${
                    active
                      ? "bg-primary/15 text-primary glow-border"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <button
            onClick={signOut}
            className="mt-auto flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Mobile top bar */}
          <div className="md:hidden sticky top-0 z-30 flex items-center justify-between p-3 bg-sidebar/90 backdrop-blur border-b border-border/60">
            <Link to="/dashboard" className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <span className="font-mono text-xs tracking-widest">THE VAULT</span>
            </Link>
            <button onClick={signOut} className="text-xs text-muted-foreground"><LogOut className="h-4 w-4" /></button>
          </div>
          <div className="md:hidden flex gap-1 overflow-x-auto px-3 py-2 border-b border-border/60 bg-background/40">
            {nav.map((n) => {
              const active = pathname.startsWith(n.to);
              return (
                <Link key={n.to} to={n.to} className={`px-3 py-1.5 rounded-md text-xs whitespace-nowrap ${active ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}>
                  {n.label}
                </Link>
              );
            })}
          </div>

          <main className="p-4 md:p-8 max-w-6xl mx-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}