-- ═══════════════════════════════════════════
-- MangoOS V14.7.5 — Supabase 一键建表
-- 在 Supabase SQL Editor 中粘贴全部执行
-- ═══════════════════════════════════════════

-- 1. Profiles 表（用户等级、Admin 识别）
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT DEFAULT 'Learner',
  email TEXT,
  plan TEXT DEFAULT 'standard' CHECK (plan IN ('guest', 'standard', 'pro', 'admin')),
  plan_expires_at TIMESTAMPTZ,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "读自己" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "改自己" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "插入自己" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. 新用户注册时自动创建 profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, plan)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Learner'), 'standard');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Agent 任务历史
CREATE TABLE IF NOT EXISTS public.agent_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  intent TEXT NOT NULL,
  task_type TEXT,
  quality_score INTEGER DEFAULT 0,
  sources_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.agent_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "管理自己的任务" ON public.agent_tasks FOR ALL USING (auth.uid() = user_id);

-- 4. Artifacts 成品库
CREATE TABLE IF NOT EXISTS public.artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  task_type TEXT,
  quality_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "管理自己的成品" ON public.artifacts FOR ALL USING (auth.uid() = user_id);

-- 5. 给自己设为 Admin（替换为你的邮箱）
-- 先注册登录一次，然后运行下面这行：
-- UPDATE public.profiles SET plan = 'admin', is_admin = true WHERE email = '你的邮箱';
