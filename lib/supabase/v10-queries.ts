// ═══════════════════════════════════════════════════════════════
// V10 Knowledge Base — Supabase queries for new tables
// content_raw, cognitive_units, learning_sessions, decision_logs
// ═══════════════════════════════════════════════════════════════

import { createClient } from "@/lib/supabase/client";

const supabase = () => createClient();

// ═══ Content Raw ═══

export async function insertContent(data: {
  source: string; url?: string; title: string; content: string; category?: string;
}) {
  return supabase().from("content_raw").insert({
    source: data.source,
    url: data.url ?? null,
    title: data.title,
    content: data.content,
    category: data.category ?? "learning",
    status: "pending",
  }).select("*").single();
}

export async function fetchContent(limit = 20) {
  const { data } = await supabase().from("content_raw").select("*").order("ingested_at", { ascending: false }).limit(limit);
  return data ?? [];
}

// ═══ Cognitive Units ═══

export async function insertCognitiveUnit(data: {
  type: string; key_concept: string; structured_data: Record<string, unknown>; source_url?: string;
}) {
  return supabase().from("cognitive_units").insert({
    type: data.type,
    key_concept: data.key_concept,
    structured_data: data.structured_data,
    source_url: data.source_url ?? null,
  }).select("*").single();
}

export async function fetchCognitiveUnits(limit = 20) {
  const { data } = await supabase().from("cognitive_units").select("*").order("created_at", { ascending: false }).limit(limit);
  return data ?? [];
}

// ═══ Learning Sessions ═══

export async function logSession(data: {
  flow: string; duration_sec: number; cards_completed?: number;
}) {
  return supabase().from("learning_sessions").insert({
    flow: data.flow,
    duration_sec: data.duration_sec,
    cards_completed: data.cards_completed ?? 0,
  }).select("*").single();
}

export async function fetchSessions(limit = 5) {
  const { data } = await supabase().from("learning_sessions").select("*").order("created_at", { ascending: false }).limit(limit);
  return data ?? [];
}

// ═══ Decision Logs ═══

export async function logDecision(data: {
  recommendation: string; user_action: string; feedback?: string; autonomy_level?: string;
}) {
  return supabase().from("decision_logs").insert({
    recommendation: data.recommendation,
    user_action: data.user_action,
    feedback: data.feedback ?? "neutral",
    autonomy_level: data.autonomy_level ?? "assisted",
  }).select("*").single();
}
