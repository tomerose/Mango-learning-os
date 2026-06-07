-- MangoOS V14.3 — Artifact Cloud Sync
-- Enables Supabase-backed artifact storage for authenticated users.
-- Guest users remain local-only.

-- Artifact table
CREATE TABLE IF NOT EXISTS public.artifacts (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'draft',
  title TEXT NOT NULL DEFAULT '',
  summary TEXT DEFAULT '',
  content TEXT DEFAULT '',
  sections JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}',
  subject TEXT,
  course TEXT,
  school TEXT,
  quality_score INTEGER DEFAULT 0,
  quality_breakdown JSONB,
  sources JSONB DEFAULT '[]'::jsonb,
  origin_task TEXT DEFAULT '',
  generation_trace JSONB,
  identity_context TEXT,
  export_formats TEXT[] DEFAULT '{markdown,html}',
  storage_mode TEXT NOT NULL DEFAULT 'cloud',
  plan_tier TEXT NOT NULL DEFAULT 'standard',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_artifacts_user_id ON public.artifacts(user_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_type ON public.artifacts(type);
CREATE INDEX IF NOT EXISTS idx_artifacts_status ON public.artifacts(status);
CREATE INDEX IF NOT EXISTS idx_artifacts_updated_at ON public.artifacts(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_artifacts_quality ON public.artifacts(quality_score DESC);

-- RLS policies
ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;

-- Users can read their own artifacts
CREATE POLICY "Users can read own artifacts" ON public.artifacts
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own artifacts
CREATE POLICY "Users can insert own artifacts" ON public.artifacts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own artifacts
CREATE POLICY "Users can update own artifacts" ON public.artifacts
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own artifacts
CREATE POLICY "Users can delete own artifacts" ON public.artifacts
  FOR DELETE USING (auth.uid() = user_id);

-- Admin can read all artifacts
CREATE POLICY "Admins can read all artifacts" ON public.artifacts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );
