// ═══════════════════════════════════════════════════════════════
// V11 Study Pack Cloud Sync — Supabase queries
// Used when user is logged in and cloud storage is enabled.
// ═══════════════════════════════════════════════════════════════

import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { StudyPackSession } from "@/lib/study-pack-store";

const supabase = () => createClient();

export interface StudyPackRow {
  id: string;
  user_id?: string;
  course_name: string;
  school: string | null;
  exam_scope: string | null;
  sources: unknown;
  outline: unknown;
  generated_handout: unknown;
  quality_score: number;
  status: string;
  created_at: string;
  updated_at: string;
  export_metadata: unknown | null;
}

function toRow(pack: StudyPackSession): Omit<StudyPackRow, "user_id" | "created_at"> {
  return {
    id: pack.id,
    course_name: pack.courseName,
    school: pack.school ?? null,
    exam_scope: pack.examScope ?? null,
    sources: pack.sources,
    outline: pack.outline,
    generated_handout: pack.generatedHandout,
    quality_score: pack.qualityScore,
    status: pack.status,
    updated_at: pack.updatedAt,
    export_metadata: pack.exportMetadata ?? null,
  };
}

function fromRow(row: StudyPackRow): StudyPackSession {
  return {
    id: row.id,
    courseName: row.course_name,
    school: row.school ?? undefined,
    examScope: row.exam_scope ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    sources: (row.sources ?? []) as StudyPackSession["sources"],
    outline: (row.outline ?? {}) as StudyPackSession["outline"],
    generatedHandout: (row.generated_handout ?? {}) as StudyPackSession["generatedHandout"],
    qualityScore: row.quality_score ?? 0,
    status: (row.status as StudyPackSession["status"]) ?? "complete",
    exportMetadata: (row.export_metadata ?? undefined) as StudyPackSession["exportMetadata"],
  };
}

/** Upsert a study pack to Supabase */
export async function upsertStudyPackCloud(pack: StudyPackSession): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    const row = toRow(pack);
    await supabase().from("study_packs").upsert({
      ...row,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });
  } catch {
    // Cloud sync is best-effort — local storage is primary
  }
}

/** Fetch all study packs from Supabase */
export async function fetchStudyPacksCloud(): Promise<StudyPackSession[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const { data } = await supabase()
      .from("study_packs")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(50);
    return (data ?? []).map(fromRow);
  } catch {
    return [];
  }
}

/** Fetch a single study pack by ID */
export async function fetchStudyPackCloud(id: string): Promise<StudyPackSession | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data } = await supabase()
      .from("study_packs")
      .select("*")
      .eq("id", id)
      .single();
    return data ? fromRow(data) : null;
  } catch {
    return null;
  }
}

/** Delete a study pack from Supabase */
export async function deleteStudyPackCloud(id: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  try {
    await supabase().from("study_packs").delete().eq("id", id);
  } catch { /* best effort */ }
}

/** Migrate all localStorage packs to Supabase (called on login) */
export async function migrateLocalToCloud(packs: StudyPackSession[]): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  let count = 0;
  for (const pack of packs) {
    try {
      await upsertStudyPackCloud(pack);
      count++;
    } catch { /* continue */ }
  }
  return count;
}

/** Check if cloud sync is available */
export function isCloudSyncAvailable(): boolean {
  return isSupabaseConfigured();
}

/** SQL to create the study_packs table (run in Supabase SQL editor):
```sql
CREATE TABLE IF NOT EXISTS study_packs (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  course_name TEXT NOT NULL,
  school TEXT,
  exam_scope TEXT,
  sources JSONB DEFAULT '[]'::jsonb,
  outline JSONB DEFAULT '{}'::jsonb,
  generated_handout JSONB DEFAULT '{}'::jsonb,
  quality_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'complete',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  export_metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_study_packs_user ON study_packs(user_id);
CREATE INDEX IF NOT EXISTS idx_study_packs_updated ON study_packs(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_packs_status ON study_packs(status);

-- RLS
ALTER TABLE study_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own packs" ON study_packs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own packs" ON study_packs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own packs" ON study_packs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own packs" ON study_packs
  FOR DELETE USING (auth.uid() = user_id);
```
*/
