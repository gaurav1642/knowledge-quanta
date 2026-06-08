import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyProfile, recordDailyLogin } from "@/lib/vault.functions";
import { VaultShell } from "@/components/VaultShell";
import { progressInLevel } from "@/lib/levels";
import { Eye, Brain, FileLock2, Search, Flame, Trophy, Zap } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Command Center — The Vault" }] }),
  component: Dashboard,
});

function Dashboard() {
  const fetchProfile = useServerFn(getMyProfile);
  const checkIn = useServerFn(recordDailyLogin);
  const { data: profile, isLoading, refetch } = useQuery({ queryKey: ["profile"], queryFn: () => fetchProfile() });
  const dailyMut = useMutation({ mutationFn: () => checkIn(), onSuccess: (r) => { if (r?.awarded) toast.success(`+10 XP • Streak ${r.streak}`); refetch(); } });

  useEffect(() => { dailyMut.mutate(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  return (
    <VaultShell>
      {isLoading || !profile ? (
        <div className="space-y-4">
          <div className="h-10 w-64 bg-muted/40 rounded animate-pulse" />
          <div className="h-32 bg-muted/30 rounded-xl animate-pulse" />
        </div>
      ) : (
        <div className="space-y-8">
          <header>
            <p className="text-xs font-mono tracking-widest text-primary">// IDENTITY CONFIRMED</p>
            <h1 className="text-3xl md:text-4xl font-bold mt-2">Welcome, <span className="text-primary text-glow">{profile.codename}</span></h1>
            <p className="text-muted-foreground mt-1">Rank: <span className="text-foreground">{profile.rank}</span> • Level {profile.level}</p>
          </header>

          <section className="glass rounded-2xl p-6 glow-border">
            <div className="flex items-end justify-between mb-3">
              <div className="text-xs font-mono text-muted-foreground tracking-widest">PROGRESS TO LEVEL {profile.level + 1}</div>
              <div className="font-mono text-sm"><span className="text-primary">{profile.xp}</span> XP</div>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-accent transition-all" style={{ width: `${progressInLevel(profile.xp).pct}%` }} />
            </div>
          </section>

          <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat icon={Flame} label="Streak" value={profile.streak} />
            <Stat icon={Search} label="Mysteries" value={profile.mysteries_solved} />
            <Stat icon={Brain} label="Rabbit Holes" value={profile.rabbit_holes_explored} />
            <Stat icon={FileLock2} label="Secret Files" value={profile.secret_files_unlocked} />
          </section>

          <Link to="/mysteries" className="block group">
            <div className="relative glass rounded-2xl p-8 overflow-hidden hover:border-primary/60 transition-all">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono tracking-widest text-primary mb-2">// PRIMARY DIRECTIVE</p>
                  <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3"><Eye className="h-7 w-7 text-primary animate-flicker" /> ENTER THE VAULT</h2>
                  <p className="text-muted-foreground mt-2">Open a new case file, descend a rabbit hole, or unlock a classified dossier.</p>
                </div>
                <Zap className="h-10 w-10 text-primary hidden md:block group-hover:scale-110 transition" />
              </div>
            </div>
          </Link>

          <div className="grid md:grid-cols-3 gap-4">
            <QuickLink to="/mysteries" icon={Search} title="Mystery Engine" desc="Generate a new case" />
            <QuickLink to="/rabbit-hole" icon={Brain} title="Rabbit Hole" desc="Chase a question" />
            <QuickLink to="/vault" icon={FileLock2} title="Archive" desc="Unlock secret files" />
          </div>

          <section className="glass rounded-xl p-5">
            <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-primary mb-3"><Trophy className="h-3 w-3" /> XP REWARDS</div>
            <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
              <li>Solve Mystery <span className="text-primary">+100</span></li>
              <li>Rabbit Hole <span className="text-primary">+50</span></li>
              <li>Secret File <span className="text-primary">+20</span></li>
              <li>Reality Check <span className="text-primary">+75</span></li>
              <li>Daily Login <span className="text-primary">+10</span></li>
            </ul>
          </section>
        </div>
      )}
    </VaultShell>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="glass rounded-xl p-4">
      <Icon className="h-4 w-4 text-primary mb-2" />
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground font-mono">{label}</div>
    </div>
  );
}
function QuickLink({ to, icon: Icon, title, desc }: { to: string; icon: any; title: string; desc: string }) {
  return (
    <Link to={to} className="glass rounded-xl p-5 hover:border-primary/60 transition group">
      <Icon className="h-5 w-5 text-primary mb-3 group-hover:scale-110 transition" />
      <div className="font-mono text-sm">{title}</div>
      <div className="text-xs text-muted-foreground">{desc}</div>
    </Link>
  );
}