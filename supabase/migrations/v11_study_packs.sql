-- V11: Study Packs cloud sync table
-- Run in Supabase SQL Editor: https://app.supabase.com/project/_/sql

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

CREATE INDEX IF NOT EXISTS idx_study_packs_user ON study_packs(user_id);
CREATE INDEX IF NOT EXISTS idx_study_packs_updated ON study_packs(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_study_packs_status ON study_packs(status);

ALTER TABLE study_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own packs" ON study_packs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own packs" ON study_packs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own packs" ON study_packs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own packs" ON study_packs
  FOR DELETE USING (auth.uid() = user_id);
