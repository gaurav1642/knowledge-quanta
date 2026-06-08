import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listRabbitHoles, startRabbitHole } from "@/lib/vault.functions";
import { VaultShell } from "@/components/VaultShell";
import { toast } from "sonner";
import { Brain, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/rabbit-hole/")({
  head: () => ({ meta: [{ title: "Rabbit Hole — The Vault" }] }),
  component: RHIndex,
});

function RHIndex() {
  const list = useServerFn(listRabbitHoles);
  const start = useServerFn(startRabbitHole);
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const { data, isLoading, refetch } = useQuery({ queryKey: ["holes"], queryFn: () => list() });
  const mut = useMutation({
    mutationFn: (question: string) => start({ data: { question } }),
    onSuccess: (r) => { refetch(); navigate({ to: "/rabbit-hole/$id", params: { id: r.id } }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const seeds = ["Why is the sky blue?", "What is consciousness?", "How do black holes work?", "Why do we dream?"];

  return (
    <VaultShell>
      <header className="mb-6">
        <p className="text-xs font-mono tracking-widest text-primary">// CURIOSITY ENGINE</p>
        <h1 className="text-3xl font-bold mt-1">Rabbit Hole</h1>
        <p className="text-muted-foreground text-sm">Ask anything. Get an answer plus five deeper questions. Branch forever.</p>
      </header>

      <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) mut.mutate(q); }} className="glass rounded-2xl p-5 mb-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="What do you want to know?" className="w-full px-4 py-3 rounded-md bg-input border border-border focus:border-primary outline-none" />
        <button disabled={mut.isPending} className="mt-3 inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-mono text-sm hover:shadow-[0_0_30px_var(--primary)] disabled:opacity-50">
          <Brain className="h-4 w-4" /> {mut.isPending ? "Diving…" : "Descend"}
        </button>
      </form>

      <div className="flex flex-wrap gap-2 mb-8">
        {seeds.map((s) => (
          <button key={s} onClick={() => mut.mutate(s)} className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary hover:text-primary text-muted-foreground transition">{s}</button>
        ))}
      </div>

      <h2 className="text-xs font-mono tracking-widest text-primary mb-3">// RECENT EXPLORATIONS</h2>
      {isLoading ? <div className="h-20 bg-muted/30 rounded animate-pulse" /> : !data?.length ? (
        <p className="text-sm text-muted-foreground">No dives yet.</p>
      ) : (
        <div className="space-y-2">
          {data.map((h: any) => (
            <Link key={h.id} to="/rabbit-hole/$id" params={{ id: h.id }} className="flex items-center justify-between glass rounded-lg p-4 hover:border-primary/60 transition">
              <div>
                <div className="font-medium">{h.root_question}</div>
                <div className="text-xs text-muted-foreground font-mono">{h.depth} node{h.depth !== 1 ? "s" : ""}</div>
              </div>
              <ArrowRight className="h-4 w-4 text-primary" />
            </Link>
          ))}
        </div>
      )}
    </VaultShell>
  );
}