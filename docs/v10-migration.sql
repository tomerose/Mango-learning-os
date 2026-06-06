-- ═══════════════════════════════════════════════════════════════
-- V10 Database Migration — Cognitive Replacement System
-- Tables: content_raw, cognitive_units, learning_sessions, decision_logs
-- ═══════════════════════════════════════════════════════════════

-- ═══ Content Raw — ingested source material ═══
CREATE TABLE IF NOT EXISTS content_raw (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  url TEXT,
  title TEXT NOT NULL,
  content TEXT,
  category TEXT CHECK (category IN ('english', 'world', 'tech', 'learning')),
  status TEXT DEFAULT 'pending',
  ingested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- ═══ Cognitive Units — structured knowledge cards/chains/trees ═══
CREATE TABLE IF NOT EXISTS cognitive_units (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('card', 'chain', 'tree')),
  key_concept TEXT,
  structured_data JSONB NOT NULL DEFAULT '{}',
  -- embedding vector(768), -- requires: CREATE EXTENSION vector;
  source_ref UUID REFERENCES content_raw(id),
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ Learning Sessions — user interaction tracking ═══
CREATE TABLE IF NOT EXISTS learning_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  flow TEXT CHECK (flow IN ('english', 'world', 'planning')),
  duration_sec INTEGER,
  cards_completed INTEGER DEFAULT 0,
  metrics JSONB DEFAULT '{}',
  outcomes JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ Decision Logs — autonomy tracking ═══
CREATE TABLE IF NOT EXISTS decision_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  recommendation TEXT NOT NULL,
  user_action TEXT CHECK (user_action IN ('accepted', 'ignored', 'overridden')),
  feedback TEXT CHECK (feedback IN ('positive', 'negative', 'neutral')),
  autonomy_level TEXT CHECK (autonomy_level IN ('manual', 'assisted', 'autonomous')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ Indexes ═══
CREATE INDEX IF NOT EXISTS idx_content_raw_category ON content_raw(category);
CREATE INDEX IF NOT EXISTS idx_content_raw_status ON content_raw(status);
CREATE INDEX IF NOT EXISTS idx_cognitive_units_user ON cognitive_units(user_id);
CREATE INDEX IF NOT EXISTS idx_cognitive_units_type ON cognitive_units(type);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_user ON learning_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_flow ON learning_sessions(flow);
CREATE INDEX IF NOT EXISTS idx_decision_logs_user ON decision_logs(user_id);

-- ═══ RLS Policies ═══
ALTER TABLE content_raw ENABLE ROW LEVEL SECURITY;
ALTER TABLE cognitive_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE decision_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read content_raw
CREATE POLICY "Users can read content" ON content_raw FOR SELECT TO authenticated USING (true);

-- Users can read/write their own cognitive_units
CREATE POLICY "Users CRUD own units" ON cognitive_units
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can read/write their own learning_sessions
CREATE POLICY "Users CRUD own sessions" ON learning_sessions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can read/write their own decision_logs
CREATE POLICY "Users CRUD own logs" ON decision_logs
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
