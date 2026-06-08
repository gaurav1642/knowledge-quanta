import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMystery, askMystery, accuseMystery } from "@/lib/vault.functions";
import { VaultShell } from "@/components/VaultShell";
import { toast } from "sonner";
import { ArrowLeft, Send, Gavel } from "lucide-react";

export const Route = createFileRoute("/_authenticated/mysteries/$id")({
  head: () => ({ meta: [{ title: "Case File — The Vault" }] }),
  component: MysteryDetail,
});

function MysteryDetail() {
  const { id } = Route.useParams();
  const get = useServerFn(getMystery);
  const ask = useServerFn(askMystery);
  const accuse = useServerFn(accuseMystery);
  const { data: c, isLoading, refetch } = useQuery({ queryKey: ["mystery", id], queryFn: () => get({ data: { id } }) });
  const [msg, setMsg] = useState("");
  const askMut = useMutation({
    mutationFn: (m: string) => ask({ data: { id, message: m } }),
    onSuccess: () => { setMsg(""); refetch(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  const accuseMut = useMutation({
    mutationFn: (name: string) => accuse({ data: { id, suspectName: name } }),
    onSuccess: (r) => { toast[r.correct ? "success" : "error"](r.correct ? "+100 XP — Case solved." : "Wrong suspect. Case closed."); refetch(); },
  });

  if (isLoading || !c) return <VaultShell><div className="h-40 bg-muted/30 rounded animate-pulse" /></VaultShell>;
  const cf = c.case_file as any;
  const convo = (c.conversation as { role: string; content: string }[]) ?? [];

  return (
    <VaultShell>
      <Link to="/mysteries" className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-primary mb-4"><ArrowLeft className="h-3 w-3" /> ALL CASES</Link>
      <div className="mb-6">
        <p className="text-xs font-mono tracking-widest text-primary">// CASE FILE #{id.slice(0,8).toUpperCase()}</p>
        <h1 className="text-3xl font-bold mt-1">{c.title}</h1>
        <p className="text-xs font-mono text-muted-foreground">{c.category}</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-4">
          <section className="glass rounded-xl p-5">
            <h2 className="text-xs font-mono tracking-widest text-primary mb-2">// BACKGROUND</h2>
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{cf.background}</p>
          </section>

          <section className="glass rounded-xl p-5">
            <h2 className="text-xs font-mono tracking-widest text-primary mb-3">// INVESTIGATION TERMINAL</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
              {convo.length === 0 && <p className="text-sm text-muted-foreground italic">Ask a question, examine evidence, or interrogate a witness…</p>}
              {convo.map((m, i) => (
                <div key={i} className={`text-sm p-3 rounded-md ${m.role === "user" ? "bg-secondary/60 ml-8" : "bg-primary/10 border border-primary/20 mr-8"}`}>
                  <div className="text-xs font-mono text-muted-foreground mb-1">{m.role === "user" ? "AGENT" : "ARCHIVIST"}</div>
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
              ))}
              {askMut.isPending && <div className="text-xs font-mono text-primary animate-pulse">// Archivist processing…</div>}
            </div>
            {c.status === "open" ? (
              <form onSubmit={(e) => { e.preventDefault(); if (msg.trim()) askMut.mutate(msg); }} className="flex gap-2">
                <input value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="What do you want to know?" className="flex-1 px-3 py-2 rounded-md bg-input border border-border focus:border-primary outline-none text-sm" />
                <button disabled={askMut.isPending} className="px-4 rounded-md bg-primary text-primary-foreground disabled:opacity-50"><Send className="h-4 w-4" /></button>
              </form>
            ) : (
              <div className="p-3 rounded-md bg-accent/10 border border-accent/30">
                <div className="text-xs font-mono text-accent mb-1">// SOLUTION DECLASSIFIED</div>
                <p className="text-sm">Culprit: <strong>{c.solution_revealed?.culprit}</strong></p>
                <p className="text-sm mt-1 text-muted-foreground">{c.solution_revealed?.explanation}</p>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-3">
          <Panel title="SUSPECTS">
            {cf.suspects?.map((s: any) => (
              <div key={s.name} className="text-sm border-b border-border/40 last:border-0 py-2">
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.description}</div>
                {c.status === "open" && (
                  <button onClick={() => { if (confirm(`Accuse ${s.name}? This closes the case.`)) accuseMut.mutate(s.name); }} className="mt-1 text-xs inline-flex items-center gap-1 text-destructive hover:underline">
                    <Gavel className="h-3 w-3" /> Accuse
                  </button>
                )}
              </div>
            ))}
          </Panel>
          <Panel title="EVIDENCE">{cf.evidence?.map((e: any, i: number) => <div key={i} className="text-xs py-1.5 border-b border-border/40 last:border-0"><strong>{e.label}:</strong> <span className="text-muted-foreground">{e.detail}</span></div>)}</Panel>
          <Panel title="WITNESSES">{cf.witnesses?.map((w: any, i: number) => <div key={i} className="text-xs py-1.5 border-b border-border/40 last:border-0"><strong>{w.name}:</strong> <span className="text-muted-foreground italic">"{w.statement}"</span></div>)}</Panel>
          <Panel title="TIMELINE">{cf.timeline?.map((t: string, i: number) => <div key={i} className="text-xs py-1 text-muted-foreground">→ {t}</div>)}</Panel>
          <Panel title="CLUES">{cf.clues?.map((t: string, i: number) => <div key={i} className="text-xs py-1 text-primary">• {t}</div>)}</Panel>
        </aside>
      </div>
    </VaultShell>
  );
}
function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="glass rounded-xl p-4"><h3 className="text-xs font-mono tracking-widest text-primary mb-2">// {title}</h3>{children}</div>;
}