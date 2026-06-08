export function ParticleField() {
  const particles = Array.from({ length: 24 });
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
      <div className="absolute inset-0 vault-grid opacity-30" />
      <div className="absolute inset-0 scanline opacity-40" />
      {particles.map((_, i) => {
        const left = (i * 37) % 100;
        const size = 2 + ((i * 7) % 4);
        const delay = (i * 1.3) % 12;
        const dur = 14 + ((i * 3) % 18);
        return (
          <span
            key={i}
            className="absolute rounded-full bg-primary/60"
            style={{
              left: `${left}%`,
              width: size,
              height: size,
              boxShadow: "0 0 12px var(--primary)",
              animation: `float-up ${dur}s linear ${delay}s infinite`,
            }}
          />
        );
      })}
    </div>
  );
}