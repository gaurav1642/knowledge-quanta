import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { listMysteries, createMystery } from "@/lib/vault.functions";
import { VaultShell } from "@/components/VaultShell";
import { toast } from "sonner";
import { Search, Plus, Skull, UserX, Ghost, Rocket, ScrollText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/mysteries/")({
  head: () => ({ meta: [{ title: "Mystery Engine — The Vault" }] }),
  component: MysteryIndex,
});

const CATS = [
  { v: "Murder Mystery", icon: Skull },
  { v: "Missing Person", icon: UserX },
  { v: "Supernatural Mystery", icon: Ghost },
  { v: "Sci-Fi Mystery", icon: Rocket },
  { v: "Historical Mystery", icon: ScrollText },
] as const;

function MysteryIndex() {
  const list = useServerFn(listMysteries);
  const create = useServerFn(createMystery);
  const navigate = useNavigate();
  const [cat, setCat] = useState<typeof CATS[number]["v"]>("Murder Mystery");
  const { data: cases, isLoading, refetch } = useQuery({ queryKey: ["mysteries"], queryFn: () => list() });
  const mut = useMutation({
    mutationFn: () => create({ data: { category: cat } }),
    onSuccess: (r) => { refetch(); navigate({ to: "/mysteries/$id", params: { id: r.id } }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  return (
    <VaultShell>
      <header className="mb-6">
        <p className="text-xs font-mono tracking-widest text-primary">// CASE GENERATOR</p>
        <h1 className="text-3xl font-bold mt-1">Mystery Engine</h1>
        <p className="text-muted-foreground text-sm">Select a category. The Vault fabricates a unique case. You investigate. You accuse.</p>
      </header>

      <section className="glass rounded-2xl p-5 mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          {CATS.map(({ v, icon: I }) => (
            <button key={v} onClick={() => setCat(v)} className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm border transition ${cat === v ? "bg-primary/15 border-primary text-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
              <I className="h-4 w-4" /> {v}
            </button>
          ))}
        </div>
        <button onClick={() => mut.mutate()} disabled={mut.isPending} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-mono text-sm hover:shadow-[0_0_30px_var(--primary)] disabled:opacity-50 transition">
          <Plus className="h-4 w-4" /> {mut.isPending ? "Encrypting case file…" : "Generate Case File"}
        </button>
      </section>

      <h2 className="text-xs font-mono tracking-widest text-primary mb-3">// OPEN & CLOSED CASES</h2>
      {isLoading ? (
        <div className="space-y-2">{Array.from({length:3}).map((_,i)=><div key={i} className="h-16 bg-muted/30 rounded animate-pulse"/>)}</div>
      ) : !cases?.length ? (
        <div className="glass rounded-xl p-8 text-center text-muted-foreground">
          <Search className="h-8 w-8 mx-auto mb-2 text-primary" />
          No cases yet. Generate your first above.
        </div>
      ) : (
        <div className="space-y-2">
          {cases.map((c: any) => (
            <Link key={c.id} to="/mysteries/$id" params={{ id: c.id }} className="block glass rounded-lg p-4 hover:border-primary/60 transition">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium">{c.title}</div>
                  <div className="text-xs text-muted-foreground font-mono">{c.category}</div>
                </div>
                <span className={`text-xs font-mono px-2 py-1 rounded ${c.status === "solved" ? (c.solved_correctly ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive") : "bg-accent/20 text-accent"}`}>
                  {c.status === "open" ? "OPEN" : c.solved_correctly ? "SOLVED" : "CLOSED"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </VaultShell>
  );
}