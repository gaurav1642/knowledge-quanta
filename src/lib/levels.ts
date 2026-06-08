export const RANKS: { level: number; rank: string }[] = [
  { level: 1, rank: "Curious Human" },
  { level: 10, rank: "Investigator" },
  { level: 25, rank: "Researcher" },
  { level: 50, rank: "Truth Seeker" },
  { level: 100, rank: "Vault Master" },
];

export function xpToLevel(xp: number): number {
  return Math.max(1, Math.floor(xp / 100) + 1);
}

export function levelToRank(level: number): string {
  let rank = RANKS[0].rank;
  for (const r of RANKS) if (level >= r.level) rank = r.rank;
  return rank;
}

export function progressInLevel(xp: number): { current: number; needed: number; pct: number } {
  const current = xp % 100;
  return { current, needed: 100, pct: current };
}

export const XP_REWARDS = {
  mystery_solved: 100,
  mystery_attempted: 25,
  rabbit_hole: 50,
  secret_file: 20,
  reality_check: 75,
  daily_login: 10,
};