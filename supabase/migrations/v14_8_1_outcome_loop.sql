-- MangoOS V14.8.1 Outcome Loop MVP — Database Schema
-- Safe migration: uses CREATE TABLE IF NOT EXISTS

-- 1. Agent Runs
CREATE TABLE IF NOT EXISTS public.agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  tier TEXT DEFAULT 'guest',
  prompt TEXT,
  task_type TEXT,
  status TEXT DEFAULT 'running' CHECK (status IN ('running','completed','needs_review','failed')),
  quality_score INTEGER DEFAULT 0,
  source_count INTEGER DEFAULT 0,
  citation_count INTEGER DEFAULT 0,
  export_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "读自己的运行记录" ON public.agent_runs FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- 2. Outcome Documents
CREATE TABLE IF NOT EXISTS public.outcome_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  run_id UUID REFERENCES public.agent_runs(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  sections JSONB DEFAULT '[]',
  status TEXT DEFAULT 'completed' CHECK (status IN ('completed','needs_review','failed')),
  quality_score INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'guest',
  latest_version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.outcome_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "读自己的文档" ON public.outcome_documents FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- 3. Outcome Versions
CREATE TABLE IF NOT EXISTS public.outcome_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.outcome_documents(id) ON DELETE CASCADE,
  version_number INTEGER DEFAULT 1,
  content TEXT,
  sections JSONB DEFAULT '[]',
  quality_score INTEGER DEFAULT 0,
  source_count INTEGER DEFAULT 0,
  citation_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.outcome_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "读自己的版本" ON public.outcome_versions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.outcome_documents WHERE id = document_id AND (user_id = auth.uid() OR user_id IS NULL))
);

-- 4. Outcome Sources
CREATE TABLE IF NOT EXISTS public.outcome_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.outcome_documents(id) ON DELETE CASCADE,
  title TEXT,
  url TEXT,
  platform TEXT,
  summary TEXT,
  relevance_reason TEXT,
  used BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.outcome_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "读自己的来源" ON public.outcome_sources FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.outcome_documents WHERE id = document_id AND (user_id = auth.uid() OR user_id IS NULL))
);

-- 5. Outcome Exports
CREATE TABLE IF NOT EXISTS public.outcome_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES public.outcome_documents(id) ON DELETE CASCADE,
  export_type TEXT CHECK (export_type IN ('html','pdf')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','completed','failed')),
  file_url TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.outcome_exports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "读自己的导出" ON public.outcome_exports FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.outcome_documents WHERE id = document_id AND (user_id = auth.uid() OR user_id IS NULL))
);

-- Admin policies (service_role bypasses RLS, but these allow admin reads via anon key)
CREATE POLICY "Admin读所有运行" ON public.agent_runs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Admin读所有文档" ON public.outcome_documents FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);
