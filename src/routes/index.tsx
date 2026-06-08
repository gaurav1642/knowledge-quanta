import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, Search, Brain, FileLock2, Sparkles, ShieldAlert } from "lucide-react";
import heroImg from "@/assets/vault-hero.jpg";
import { ParticleField } from "@/components/ParticleField";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Infinite Vault — Mysteries, Rabbit Holes & Secret Files" },
      { name: "description", content: "An AI-powered classified archive of mysteries, deep curiosity rabbit holes, and secret knowledge files. Replace doomscrolling with addictive learning." },
      { property: "og:title", content: "The Infinite Vault" },
      { property: "og:description", content: "Enter a secret intelligence database of mysteries, rabbit holes, and hidden knowledge." },
      { property: "og:image", content: "/og-vault.jpg" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden text-foreground">
      <ParticleField />
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-2">
          <Eye className="h-6 w-6 text-primary animate-flicker" />
          <span className="font-mono text-sm tracking-[0.25em] text-glow">THE VAULT</span>
        </div>
        <Link to="/auth" className="text-sm font-mono px-4 py-2 rounded-md border border-border hover:border-primary hover:text-primary transition">
          Request Access
        </Link>
      </header>

      <section className="relative z-10 px-6 md:px-12 pt-10 md:pt-20 pb-24 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/40 bg-primary/5 text-xs font-mono tracking-widest text-primary mb-6">
              <ShieldAlert className="h-3 w-3" /> CLASSIFIED • LEVEL Ω
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              The Infinite <span className="text-glow text-primary">Vault</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              A classified AI archive of unsolved mysteries, deep rabbit holes, and hidden knowledge. Replace mindless scrolling with addictive curiosity.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/auth"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground font-mono text-sm tracking-wide hover:shadow-[0_0_40px_var(--primary)] transition-all animate-pulse-glow"
              >
                <Eye className="h-4 w-4" /> ENTER THE VAULT
              </Link>
              <a href="#features" className="px-6 py-3 rounded-md border border-border text-sm font-mono hover:border-primary hover:text-primary transition">
                Brief Me
              </a>
            </div>
            <div className="mt-10 flex gap-6 text-xs font-mono text-muted-foreground">
              <div><span className="text-primary text-lg block">∞</span>Mysteries</div>
              <div><span className="text-primary text-lg block">5</span>Categories</div>
              <div><span className="text-primary text-lg block">XP</span>Earned per dive</div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-accent/20 blur-3xl rounded-full" />
            <img
              src={heroImg}
              alt="The Vault — a glowing neon classified intelligence archive"
              width={1920} height={1080}
              className="relative rounded-xl glow-border w-full h-auto"
            />
          </div>
        </div>
      </section>

      <section id="features" className="relative z-10 px-6 md:px-12 pb-24 max-w-6xl mx-auto">
        <h2 className="text-xs font-mono tracking-[0.3em] text-primary mb-6">// SYSTEM CAPABILITIES</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { i: Search, t: "Mystery Engine", d: "AI-generated cases. Murder, missing persons, supernatural, sci-fi, historical. Investigate, accuse, solve." },
            { i: Brain, t: "Rabbit Hole", d: "Ask anything. Get an answer plus 5 deeper questions. Branch forever. Build a personal knowledge tree." },
            { i: FileLock2, t: "Secret Files", d: "Unlock classified dossiers on Fermi Paradox, dark matter, lost civilizations, cognitive biases, and more." },
            { i: Sparkles, t: "XP & Ranks", d: "Climb from Curious Human → Investigator → Researcher → Truth Seeker → Vault Master." },
            { i: Eye, t: "Daily Streaks", d: "Login daily. Stack your streak. Every dive deepens the archive." },
            { i: ShieldAlert, t: "Personalized", d: "The Vault learns what fascinates you and pulls deeper signal from the noise." },
          ].map(({ i: Icon, t, d }) => (
            <div key={t} className="glass rounded-xl p-5 hover:border-primary/40 transition-all">
              <Icon className="h-5 w-5 text-primary mb-3" />
              <h3 className="font-mono text-sm tracking-wide mb-1">{t}</h3>
              <p className="text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 px-6 py-6 text-center text-xs font-mono text-muted-foreground border-t border-border/40">
        // THE VAULT • TRANSMISSIONS ENCRYPTED • {new Date().getFullYear()}
      </footer>
    </div>
  );
}
