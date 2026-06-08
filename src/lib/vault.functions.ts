import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { xpToLevel, levelToRank, XP_REWARDS } from "@/lib/levels";

// ---------- XP helper ----------
async function awardXp(
  supabase: Awaited<ReturnType<typeof getSupabase>>,
  userId: string,
  source: keyof typeof XP_REWARDS,
  extra: Partial<Record<"mysteries_solved" | "rabbit_holes_explored" | "secret_files_unlocked" | "reality_checks_completed", number>> = {},
) {
  const amount = XP_REWARDS[source];
  await supabase.from("xp_events").insert({ user_id: userId, source, amount });
  const { data: prof } = await supabase
    .from("profiles")
    .select("xp,mysteries_solved,rabbit_holes_explored,secret_files_unlocked,reality_checks_completed")
    .eq("id", userId)
    .maybeSingle();
  if (!prof) return;
  const newXp = (prof.xp ?? 0) + amount;
  const newLevel = xpToLevel(newXp);
  await supabase
    .from("profiles")
    .update({
      xp: newXp,
      level: newLevel,
      rank: levelToRank(newLevel),
      mysteries_solved: (prof.mysteries_solved ?? 0) + (extra.mysteries_solved ?? 0),
      rabbit_holes_explored: (prof.rabbit_holes_explored ?? 0) + (extra.rabbit_holes_explored ?? 0),
      secret_files_unlocked: (prof.secret_files_unlocked ?? 0) + (extra.secret_files_unlocked ?? 0),
      reality_checks_completed: (prof.reality_checks_completed ?? 0) + (extra.reality_checks_completed ?? 0),
    })
    .eq("id", userId);
}

// helper for typing
type SbCtx = { supabase: unknown; userId: string };
async function getSupabase(): Promise<never> { throw new Error("typing only"); }

// ---------- DAILY LOGIN / STREAK ----------
export const recordDailyLogin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as unknown as { supabase: any; userId: string };
    const today = new Date().toISOString().slice(0, 10);
    const { data: prof } = await supabase.from("profiles").select("last_active_date,streak,xp").eq("id", userId).maybeSingle();
    if (!prof) return { awarded: false };
    if (prof.last_active_date === today) return { awarded: false, streak: prof.streak };
    const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const newStreak = prof.last_active_date === y ? (prof.streak ?? 0) + 1 : 1;
    await supabase.from("profiles").update({ last_active_date: today, streak: newStreak }).eq("id", userId);
    await awardXp(supabase, userId, "daily_login");
    return { awarded: true, streak: newStreak };
  });

// ---------- PROFILE ----------
export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as unknown as { supabase: any; userId: string };
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    return data;
  });

// ---------- MYSTERIES ----------
const MYSTERY_CATEGORIES = ["Murder Mystery","Missing Person","Supernatural Mystery","Sci-Fi Mystery","Historical Mystery"] as const;

export const createMystery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ category: z.enum(MYSTERY_CATEGORIES) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as unknown as { supabase: any; userId: string };
    const { callAIJson } = await import("@/lib/vault-ai.server");
    const prompt = `Generate a unique, immersive ${data.category} case file. Return STRICT JSON with keys:
title (string, evocative),
background (string, 2-3 paragraphs of atmospheric setting),
suspects (array of 4 objects: {name, description, motive, alibi}),
evidence (array of 5 objects: {label, detail}),
witnesses (array of 3 objects: {name, statement}),
timeline (array of 5 strings, chronological),
clues (array of 4 short strings, subtle hints),
solution (object: {culprit: name of one suspect, explanation: how & why}).
Be original, vivid, classified-file tone. No preamble.`;
    const json = await callAIJson<any>({
      messages: [
        { role: "system", content: "You are the Vault's master case-generator. Output only valid JSON." },
        { role: "user", content: prompt },
      ],
    });
    const { data: row, error } = await supabase.from("mysteries").insert({
      user_id: userId, category: data.category, title: json.title ?? "Untitled Case", case_file: json, status: "open",
    }).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

export const listMysteries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as unknown as { supabase: any; userId: string };
    const { data } = await supabase.from("mysteries").select("id,title,category,status,created_at,solved_correctly").eq("user_id", userId).order("created_at", { ascending: false });
    return data ?? [];
  });

export const getMystery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as unknown as { supabase: any; userId: string };
    const { data: row } = await supabase.from("mysteries").select("*").eq("id", data.id).eq("user_id", userId).maybeSingle();
    return row;
  });

export const askMystery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), message: z.string().min(1).max(800) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as unknown as { supabase: any; userId: string };
    const { data: row } = await supabase.from("mysteries").select("case_file,conversation,status").eq("id", data.id).eq("user_id", userId).maybeSingle();
    if (!row) throw new Error("Case not found");
    if (row.status !== "open") throw new Error("Case closed.");
    const { callAI } = await import("@/lib/vault-ai.server");
    const convo = (row.conversation as { role: string; content: string }[]) ?? [];
    const reply = await callAI({
      messages: [
        { role: "system", content: `You are the Vault Investigator AI guiding the user through a ${"case"}. You know the full case file (including the solution) but NEVER reveal the solution unless the user has officially accused. Respond as an in-world archivist: atmospheric, terse, classified-file tone. Provide useful but partial information; encourage deeper investigation. Case file (private): ${JSON.stringify(row.case_file).slice(0, 6000)}` },
        ...convo.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user", content: data.message },
      ],
      temperature: 0.8,
    });
    const newConvo = [...convo, { role: "user", content: data.message }, { role: "assistant", content: reply }];
    await supabase.from("mysteries").update({ conversation: newConvo }).eq("id", data.id);
    return { reply };
  });

export const accuseMystery = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), suspectName: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as unknown as { supabase: any; userId: string };
    const { data: row } = await supabase.from("mysteries").select("case_file,status").eq("id", data.id).eq("user_id", userId).maybeSingle();
    if (!row) throw new Error("Case not found");
    if (row.status !== "open") throw new Error("Already closed");
    const correct = String((row.case_file as any)?.solution?.culprit ?? "").trim().toLowerCase() === data.suspectName.trim().toLowerCase();
    await supabase.from("mysteries").update({
      status: "solved", accused_suspect: data.suspectName, solved_correctly: correct, solution_revealed: (row.case_file as any).solution,
    }).eq("id", data.id);
    await awardXp(supabase, userId, correct ? "mystery_solved" : "mystery_attempted", { mysteries_solved: correct ? 1 : 0 });
    return { correct, solution: (row.case_file as any).solution };
  });

// ---------- RABBIT HOLE ----------
export const startRabbitHole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ question: z.string().min(3).max(300) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as unknown as { supabase: any; userId: string };
    const { callAIJson } = await import("@/lib/vault-ai.server");
    const json = await callAIJson<{ answer: string; next: string[] }>({
      messages: [
        { role: "system", content: "You are the Vault's curiosity engine. Return JSON {answer: string (3-5 paragraphs, vivid, accurate, mind-expanding), next: string[] (exactly 5 deeper, distinct follow-up questions)}" },
        { role: "user", content: data.question },
      ],
    });
    const node = { id: crypto.randomUUID(), parentId: null as string | null, question: data.question, answer: json.answer, next: json.next };
    const { data: row, error } = await supabase.from("rabbit_holes").insert({
      user_id: userId, root_question: data.question, nodes: [node],
    }).select("id").single();
    if (error) throw new Error(error.message);
    await awardXp(supabase, userId, "rabbit_hole", { rabbit_holes_explored: 1 });
    return { id: row.id as string };
  });

export const expandRabbitHole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid(), parentId: z.string(), question: z.string().min(1).max(300) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as unknown as { supabase: any; userId: string };
    const { data: row } = await supabase.from("rabbit_holes").select("nodes").eq("id", data.id).eq("user_id", userId).maybeSingle();
    if (!row) throw new Error("Not found");
    const { callAIJson } = await import("@/lib/vault-ai.server");
    const json = await callAIJson<{ answer: string; next: string[] }>({
      messages: [
        { role: "system", content: "You are the Vault's curiosity engine. Return JSON {answer: string (3-5 paragraphs), next: string[] of 5 deeper follow-ups}" },
        { role: "user", content: data.question },
      ],
    });
    const newNode = { id: crypto.randomUUID(), parentId: data.parentId, question: data.question, answer: json.answer, next: json.next };
    const nodes = [...(row.nodes as any[]), newNode];
    await supabase.from("rabbit_holes").update({ nodes }).eq("id", data.id);
    await awardXp(supabase, userId, "rabbit_hole", { rabbit_holes_explored: 1 });
    return { node: newNode };
  });

export const listRabbitHoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as unknown as { supabase: any; userId: string };
    const { data } = await supabase.from("rabbit_holes").select("id,root_question,updated_at,nodes").eq("user_id", userId).order("updated_at", { ascending: false });
    return (data ?? []).map((r: any) => ({ id: r.id, root_question: r.root_question, updated_at: r.updated_at, depth: (r.nodes ?? []).length }));
  });

export const getRabbitHole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as unknown as { supabase: any; userId: string };
    const { data: row } = await supabase.from("rabbit_holes").select("*").eq("id", data.id).eq("user_id", userId).maybeSingle();
    return row;
  });

// ---------- SECRET FILES ----------
export const unlockSecretFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    category: z.string().min(1).max(40),
    topic: z.string().min(1).max(120),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as unknown as { supabase: any; userId: string };
    const { callAIJson } = await import("@/lib/vault-ai.server");
    const json = await callAIJson<{ summary: string; deep_explanation: string; related_concepts: string[]; rabbit_hole_links: string[] }>({
      messages: [
        { role: "system", content: "You are the Vault's classified-archive AI. Return JSON {summary: 2 sentences, deep_explanation: 4-6 vivid paragraphs, related_concepts: string[] (5), rabbit_hole_links: string[] (3 deep questions worth exploring)}. Tone: classified intelligence dossier." },
        { role: "user", content: `Category: ${data.category}\nTopic: ${data.topic}` },
      ],
    });
    const { data: row, error } = await supabase.from("secret_files").insert({
      user_id: userId, category: data.category, topic: data.topic,
      summary: json.summary, deep_explanation: json.deep_explanation,
      related_concepts: json.related_concepts ?? [], rabbit_hole_links: json.rabbit_hole_links ?? [],
    }).select("*").single();
    if (error) throw new Error(error.message);
    await awardXp(supabase, userId, "secret_file", { secret_files_unlocked: 1 });
    return row;
  });

export const listSecretFiles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as unknown as { supabase: any; userId: string };
    const { data } = await supabase.from("secret_files").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    return data ?? [];
  });