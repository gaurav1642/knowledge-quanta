import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listRealityChecks, runRealityCheck } from "@/lib/vault.functions";
import { VaultShell } from "@/components/VaultShell";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck, AlertTriangle, Sparkles, EyeOff, Lightbulb, ArrowRight, Loader2, History } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/reality-check")({
  head: () => ({ meta: [{ title: "AI Reality Check — The Vault" }] }),
  component: RealityCheckPage,
});

type Critique = { title: string; detail: string; severity?: "low" | "medium" | "high" };
type Check = {
  id: string;
  plan: string;
  context: string | null;
  success_score: number;
  risk_score: number;
  confidence_score: number;
  verdict: string;
  summary: string;
  strengths: Critique[];
  risks: Critique[];
  blind_spots: Critique[];
  suggestions: Critique[];
  next_actions: string[];
  created_at: string;
};

function RealityCheckPage() {
  const run = useServerFn(runRealityCheck);
  const list = useServerFn(listRealityChecks);
  const [plan, setPlan] = useState("");
  const [context, setContext] = useState("");
  const [active, setActive] = useState<Check | null>(null);

  const history = useQuery({ queryKey: ["reality-checks"], queryFn: () => list() });

  const mut = useMutation({
    mutationFn: (v: { plan: string; context: string }) => run({ data: v }),
    onSuccess: (r) => {
      setActive(r as Check);
      toast.success("+75 XP — Reality check filed.");
      history.refetch();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Analysis failed"),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (plan.trim().length < 10) {
      toast.error("Describe your plan in at least 10 characters.");
      return;
    }
    mut.mutate({ plan: plan.trim(), context: context.trim() });
  }

  return (
    <VaultShell>
      <header className="mb-6">
        <p className="text-xs font-mono tracking-widest text-primary">// REALITY CHECK PROTOCOL</p>
        <h1 className="text-3xl font-bold mt-1 flex items-center gap-2"><ShieldCheck className="h-7 w-7 text-primary" /> AI Reality Check</h1>
        <p className="text-muted-foreground text-sm">Submit a plan, decision, or idea. The Vault stress-tests it for risk, success likelihood, and blind spots.</p>
      </header>

      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6">
        <form onSubmit={submit} className="glass rounded-2xl p-5 space-y-4 h-fit">
          <div>
            <label className="text-xs font-mono tracking-widest text-primary">// THE PLAN</label>
            <Textarea
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              placeholder="e.g. Quit my job in 30 days to launch an AI tutoring startup with $8k savings."
              className="mt-2 min-h-[140px] bg-background/60"
              maxLength={2000}
              disabled={mut.isPending}
            />
          </div>
          <div>
            <label className="text-xs font-mono tracking-widest text-primary">// CONTEXT (OPTIONAL)</label>
            <Input
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Constraints, timeline, who's involved…"
              className="mt-2 bg-background/60"
              maxLength={1000}
              disabled={mut.isPending}
            />
          </div>
          <Button type="submit" disabled={mut.isPending} className="w-full">
            {mut.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Stress-testing…</> : <>Run Reality Check <ArrowRight className="h-4 w-4 ml-2" /></>}
          </Button>
          <p className="text-[10px] font-mono tracking-widest text-muted-foreground">REWARD: +75 XP PER SUBMISSION</p>
        </form>

        <div>
          {active ? (
            <Report check={active} />
          ) : (
            <div className="glass rounded-2xl p-10 text-center text-muted-foreground h-full flex flex-col items-center justify-center">
              <ShieldCheck className="h-12 w-12 mx-auto mb-3 text-primary animate-flicker" />
              <div className="font-mono text-xs tracking-widest text-primary mb-2">// AWAITING SUBMISSION</div>
              No active analysis. Submit a plan to receive your dossier.
            </div>
          )}
        </div>
      </div>

      {history.data && history.data.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-primary mb-3"><History className="h-3 w-3" /> PRIOR CHECKS</div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {(history.data as Check[]).map((c) => (
              <button key={c.id} onClick={() => setActive(c)} className="text-left glass rounded-lg p-3 hover:border-primary/60 transition">
                <div className="text-[10px] font-mono text-muted-foreground">{new Date(c.created_at).toLocaleString()}</div>
                <div className="text-sm font-medium line-clamp-2 mt-1">{c.plan}</div>
                <div className="mt-2 flex gap-1 text-[10px] font-mono">
                  <Pill label="S" value={c.success_score} tone="success" />
                  <Pill label="R" value={c.risk_score} tone="risk" />
                  <Pill label="C" value={c.confidence_score} tone="info" />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </VaultShell>
  );
}

function Report({ check }: { check: Check }) {
  return (
    <article className="glass rounded-2xl p-6 space-y-6">
      <div>
        <div className="text-xs font-mono tracking-widest text-primary">// VERDICT</div>
        <h2 className="text-2xl font-bold mt-1">{check.verdict || "Analysis Complete"}</h2>
        <p className="text-muted-foreground text-sm mt-1">{check.summary}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <ScoreDial label="Success" value={check.success_score} tone="success" />
        <ScoreDial label="Risk" value={check.risk_score} tone="risk" />
        <ScoreDial label="Confidence" value={check.confidence_score} tone="info" />
      </div>

      <CritiqueGroup title="Strengths" icon={Sparkles} items={check.strengths} accent="text-emerald-400" />
      <CritiqueGroup title="Risks" icon={AlertTriangle} items={check.risks} accent="text-rose-400" showSeverity />
      <CritiqueGroup title="Blind Spots" icon={EyeOff} items={check.blind_spots} accent="text-amber-400" />
      <CritiqueGroup title="Suggestions" icon={Lightbulb} items={check.suggestions} accent="text-primary" />

      {check.next_actions?.length ? (
        <div>
          <div className="text-xs font-mono tracking-widest text-primary mb-2">// NEXT ACTIONS</div>
          <ol className="space-y-1.5">
            {check.next_actions.map((a, i) => (
              <li key={i} className="text-sm flex gap-2"><span className="text-primary font-mono">{String(i + 1).padStart(2, "0")}</span>{a}</li>
            ))}
          </ol>
        </div>
      ) : null}
    </article>
  );
}

function CritiqueGroup({
  title, icon: Icon, items, accent, showSeverity,
}: { title: string; icon: any; items: Critique[]; accent: string; showSeverity?: boolean }) {
  if (!items?.length) return null;
  return (
    <div>
      <div className={`text-xs font-mono tracking-widest mb-2 flex items-center gap-2 ${accent}`}>
        <Icon className="h-3 w-3" /> // {title.toUpperCase()}
      </div>
      <div className="grid sm:grid-cols-2 gap-2">
        {items.map((c, i) => (
          <div key={i} className="rounded-lg border border-border/60 bg-background/40 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="text-sm font-medium">{c.title}</div>
              {showSeverity && c.severity ? <SeverityTag severity={c.severity} /> : null}
            </div>
            <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{c.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SeverityTag({ severity }: { severity: "low" | "medium" | "high" }) {
  const map = {
    low: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    high: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  } as const;
  return <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${map[severity]}`}>{severity}</span>;
}

function ScoreDial({ label, value, tone }: { label: string; value: number; tone: "success" | "risk" | "info" }) {
  const color =
    tone === "success" ? "from-emerald-500 to-emerald-300"
    : tone === "risk" ? "from-rose-500 to-rose-300"
    : "from-primary to-accent";
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="glass rounded-xl p-4 text-center">
      <div className="text-[10px] font-mono tracking-widest text-muted-foreground">{label.toUpperCase()}</div>
      <div className="text-3xl font-bold mt-1">{v}<span className="text-xs text-muted-foreground">/100</span></div>
      <div className="h-1.5 mt-2 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${color}`} style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

function Pill({ label, value, tone }: { label: string; value: number; tone: "success" | "risk" | "info" }) {
  const color =
    tone === "success" ? "text-emerald-400 border-emerald-500/30"
    : tone === "risk" ? "text-rose-400 border-rose-500/30"
    : "text-primary border-primary/30";
  return <span className={`px-1.5 py-0.5 rounded border ${color}`}>{label}{value}</span>;
}