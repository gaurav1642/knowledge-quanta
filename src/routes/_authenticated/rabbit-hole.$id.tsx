import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getRabbitHole, expandRabbitHole } from "@/lib/vault.functions";
import { VaultShell } from "@/components/VaultShell";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/rabbit-hole/$id")({
  head: () => ({ meta: [{ title: "Descent — The Vault" }] }),
  component: RHDetail,
});

function RHDetail() {
  const { id } = Route.useParams();
  const get = useServerFn(getRabbitHole);
  const expand = useServerFn(expandRabbitHole);
  const { data, isLoading, refetch } = useQuery({ queryKey: ["hole", id], queryFn: () => get({ data: { id } }) });
  const [active, setActive] = useState<string | null>(null);
  const mut = useMutation({
    mutationFn: (v: { parentId: string; question: string }) => expand({ data: { id, ...v } }),
    onSuccess: (r) => { setActive(r.node.id); refetch(); toast.success("+50 XP"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  if (isLoading || !data) return <VaultShell><div className="h-40 bg-muted/30 rounded animate-pulse" /></VaultShell>;
  const nodes = (data.nodes as any[]) ?? [];

  return (
    <VaultShell>
      <Link to="/rabbit-hole" className="inline-flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-primary mb-4"><ArrowLeft className="h-3 w-3" /> ALL DIVES</Link>
      <h1 className="text-2xl font-bold mb-6">{data.root_question}</h1>

      <div className="space-y-4">
        {nodes.map((n: any, idx: number) => (
          <div key={n.id} className="relative">
            {idx > 0 && <div className="absolute -top-4 left-6 w-px h-4 bg-primary/40" />}
            <div className="glass rounded-xl p-5">
              <div className="text-xs font-mono text-primary mb-1">// QUERY</div>
              <h3 className="font-medium mb-3">{n.question}</h3>
              <p className="text-sm whitespace-pre-wrap text-muted-foreground leading-relaxed">{n.answer}</p>
              <div className="mt-4">
                <div className="text-xs font-mono text-primary mb-2 flex items-center gap-1"><ChevronDown className="h-3 w-3" /> DEEPER</div>
                <div className="grid md:grid-cols-2 gap-2">
                  {n.next?.map((q: string) => (
                    <button key={q} disabled={mut.isPending} onClick={() => mut.mutate({ parentId: n.id, question: q })} className="text-left text-sm px-3 py-2 rounded-md border border-border hover:border-primary hover:bg-primary/5 disabled:opacity-50 transition">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
        {mut.isPending && <div className="text-xs font-mono text-primary animate-pulse">// Vault descending…</div>}
      </div>
    </VaultShell>
  );
}