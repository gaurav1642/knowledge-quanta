import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Eye } from "lucide-react";
import { toast } from "sonner";
import { ParticleField } from "@/components/ParticleField";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Access Terminal — The Vault" }, { name: "description", content: "Sign in to The Infinite Vault." }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin + "/dashboard" },
        });
        if (error) throw error;
        toast.success("Welcome, Agent. Check your inbox to confirm.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard", replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
    if (result.error) { toast.error("Google sign-in failed"); setLoading(false); return; }
    if (result.redirected) return;
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 text-foreground">
      <ParticleField />
      <div className="relative z-10 w-full max-w-md glass rounded-2xl p-8 glow-border">
        <Link to="/" className="flex items-center gap-2 mb-6">
          <Eye className="h-6 w-6 text-primary animate-flicker" />
          <span className="font-mono text-xs tracking-[0.25em] text-glow">THE VAULT</span>
        </Link>
        <h1 className="text-2xl font-semibold mb-1">{mode === "signin" ? "Access Terminal" : "Request Clearance"}</h1>
        <p className="text-sm text-muted-foreground mb-6 font-mono">// {mode === "signin" ? "Identify yourself, Agent." : "New recruit registration"}</p>

        <button onClick={onGoogle} disabled={loading} className="w-full mb-4 px-4 py-2.5 rounded-md border border-border bg-secondary/40 hover:border-primary hover:bg-secondary text-sm font-mono transition disabled:opacity-50">
          Continue with Google
        </button>
        <div className="flex items-center gap-3 my-4 text-xs text-muted-foreground font-mono">
          <div className="flex-1 h-px bg-border" /> OR <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="agent@vault.gov" className="w-full px-3 py-2.5 rounded-md bg-input border border-border focus:border-primary outline-none font-mono text-sm" />
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-3 py-2.5 rounded-md bg-input border border-border focus:border-primary outline-none font-mono text-sm" />
          <button type="submit" disabled={loading} className="w-full px-4 py-2.5 rounded-md bg-primary text-primary-foreground font-mono text-sm hover:shadow-[0_0_30px_var(--primary)] transition disabled:opacity-50">
            {loading ? "Authenticating…" : mode === "signin" ? "Enter Vault" : "Create Identity"}
          </button>
        </form>

        <p className="mt-4 text-xs text-center text-muted-foreground">
          {mode === "signin" ? "No clearance yet?" : "Already registered?"}{" "}
          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-primary hover:underline">
            {mode === "signin" ? "Request clearance" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}