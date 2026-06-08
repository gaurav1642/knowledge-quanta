import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listSecretFiles, unlockSecretFile } from "@/lib/vault.functions";
import { VaultShell } from "@/components/VaultShell";
import { FileLock2, Unlock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/vault")({
  head: () => ({ meta: [{ title: "Dark Knowledge Vault — The Vault" }] }),
  component: VaultPage,
});

const CATEGORIES: Record<string, string[]> = {
  SCIENCE: ["Fermi Paradox", "Dyson Spheres", "Quantum Immortality", "Dark Matter", "Time Dilation"],
  HISTORY: ["Lost Civilizations", "The Voynich Manuscript", "The Dancing Plague"],
  PSYCHOLOGY: ["Cognitive Biases", "Social Manipulation", "The Bystander Effect"],
  TECHNOLOGY: ["Emerging AI", "Quantum Computing", "Brain-Computer Interfaces"],
  SPACE: ["Cosmic Mysteries", "Alien Theories", "Black Hole Information Paradox"],
};

function VaultPage() {
  const list = useServerFn(listSecretFiles);
  const unlock = useServerFn(unlockSecretFile);
  const { data, refetch } = useQuery({ queryKey: ["files"], queryFn: () => list() });
  const [active, setActive] = useState<any | null>(null);
  const mut = useMutation({
    mutationFn: (v: { category: string; topic: string }) => unlock({ data: v }),
    onSuccess: (r) => { setActive(r); refetch(); toast.success("+20 XP — File declassified."); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <VaultShell>
      <header className="mb-6">
        <p className="text-xs font-mono tracking-widest text-primary">// DARK KNOWLEDGE ARCHIVE</p>
        <h1 className="text-3xl font-bold mt-1">Secret Files</h1>
        <p className="text-muted-foreground text-sm">Unlock classified dossiers across science, history, psychology, technology, and space.</p>
      </header>

      <div className="grid md:grid-cols-[280px_1fr] gap-6">
        <aside className="space-y-4">
          {Object.entries(CATEGORIES).map(([cat, topics]) => (
            <div key={cat} className="glass rounded-xl p-4">
              <h2 className="text-xs font-mono tracking-widest text-primary mb-2">// {cat}</h2>
              <div className="space-y-1">
                {topics.map((t) => (
                  <button key={t} disabled={mut.isPending} onClick={() => mut.mutate({ category: cat, topic: t })} className="w-full text-left text-sm px-2 py-1.5 rounded hover:bg-primary/10 hover:text-primary disabled:opacity-50 flex items-center gap-2 transition">
                    <FileLock2 className="h-3 w-3 text-muted-foreground" /> {t}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </aside>

        <section>
          {active ? (
            <article className="glass rounded-2xl p-6">
              <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-primary mb-2"><Unlock className="h-3 w-3" /> DECLASSIFIED • {active.category}</div>
              <h2 className="text-2xl font-bold mb-2">{active.topic}</h2>
              <p className="text-sm text-muted-foreground italic mb-4">{active.summary}</p>
              <div className="text-sm whitespace-pre-wrap leading-relaxed">{active.deep_explanation}</div>
              {active.related_concepts?.length ? (
                <div className="mt-6">
                  <div className="text-xs font-mono text-primary mb-2">// RELATED</div>
                  <div className="flex flex-wrap gap-2">{active.related_concepts.map((r: string) => <span key={r} className="text-xs px-2 py-1 rounded-full bg-secondary/60">{r}</span>)}</div>
                </div>
              ) : null}
            </article>
          ) : (
            <div className="glass rounded-2xl p-10 text-center text-muted-foreground">
              <FileLock2 className="h-10 w-10 mx-auto mb-3 text-primary" />
              Select a topic to declassify your first file.
            </div>
          )}

          {data && data.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xs font-mono tracking-widest text-primary mb-3">// PREVIOUSLY UNLOCKED</h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {data.map((f: any) => (
                  <button key={f.id} onClick={() => setActive(f)} className="text-left glass rounded-lg p-3 hover:border-primary/60 transition">
                    <div className="text-xs text-muted-foreground font-mono">{f.category}</div>
                    <div className="text-sm font-medium">{f.topic}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </VaultShell>
  );
}