-- ═══════════════════════════════════════════════════════════════════════════
-- MangoLearningOS V2.0 — Database Migration
-- All changes are additive (nullable columns, CREATE IF NOT EXISTS).
-- Zero breaking changes to V1 tables. Run via Supabase SQL Editor.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Extensions ────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── 1. ALTER existing tables (add nullable columns) ──────────────────────

-- knowledge_notes: track import source + AI summary
alter table if exists public.knowledge_notes
  add column if not exists source_type text default 'manual',
  add column if not exists source_name text,
  add column if not exists summary text;

-- study_plans: AI-generated flag + structured schedule data
alter table if exists public.study_plans
  add column if not exists ai_generated boolean default false,
  add column if not exists schedule_json jsonb;

-- goals: category + progress tracking
alter table if exists public.goals
  add column if not exists category text default 'academic',
  add column if not exists progress_pct numeric default 0,
  add column if not exists linked_project_id uuid;

-- learning_sessions: focus metrics + mood
alter table if exists public.learning_sessions
  add column if not exists focus_score int,
  add column if not exists interruptions int default 0,
  add column if not exists mood_before text,
  add column if not exists mood_after text;

-- reflections: mental wellness fields
alter table if exists public.reflections
  add column if not exists stress_level int,
  add column if not exists motivation_level int,
  add column if not exists ai_response text,
  add column if not exists tags text[] default '{}',
  add column if not exists is_journal boolean default false;

-- ─── 2. CREATE new tables ─────────────────────────────────────────────────

-- learning_goals: structured goal system
create table if not exists public.learning_goals (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text not null,
  subject       text not null,
  category      text not null default 'mastery',
  target_date   date,
  status        text not null default 'active',
  milestones    jsonb default '[]',
  progress_pct  numeric default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- knowledge_documents: uploaded source materials
create table if not exists public.knowledge_documents (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  title             text not null,
  file_type         text not null,
  file_url          text,
  extracted_text    text,
  processed         boolean default false,
  knowledge_node_ids uuid[] default '{}',
  created_at        timestamptz not null default now()
);

-- projects: project-based learning
create table if not exists public.projects (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  title          text not null,
  subject        text not null,
  description    text,
  difficulty     text not null default 'intermediate',
  status         text not null default 'planning',
  learning_goals text[] default '{}',
  resources      jsonb default '[]',
  submission     jsonb default '{}',
  ai_review      jsonb default '{}',
  reflection     text,
  progress_pct   numeric default 0,
  started_at     timestamptz,
  completed_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- learning_analytics_snapshots: daily rollups
create table if not exists public.learning_analytics_snapshots (
  id                      uuid primary key default uuid_generate_v4(),
  user_id                 uuid not null references auth.users(id) on delete cascade,
  snapshot_date           date not null,
  total_minutes           int default 0,
  tasks_completed         int default 0,
  quiz_questions_attempted int default 0,
  quiz_accuracy_pct       numeric,
  flashcards_reviewed     int default 0,
  focus_score_avg         int,
  streak_active           boolean default false,
  xp_earned               int default 0,
  created_at              timestamptz not null default now(),
  unique(user_id, snapshot_date)
);

-- agent_memory: persistent AI agent context
create table if not exists public.agent_memory (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  memory_type   text not null,
  subject       text,
  key           text not null,
  value         jsonb not null,
  importance    numeric default 0.5,
  last_accessed timestamptz default now(),
  created_at    timestamptz not null default now()
);

-- ─── 3. Indexes ───────────────────────────────────────────────────────────
create index if not exists idx_learning_goals_user_status on public.learning_goals(user_id, status);
create index if not exists idx_knowledge_docs_user on public.knowledge_documents(user_id);
create index if not exists idx_projects_user_status on public.projects(user_id, status);
create index if not exists idx_analytics_snapshot_user_date on public.learning_analytics_snapshots(user_id, snapshot_date);
create index if not exists idx_agent_memory_user_type on public.agent_memory(user_id, memory_type);

-- ─── 4. updated_at triggers for new tables ────────────────────────────────
do $$ begin
  create trigger set_updated_at before update on public.learning_goals
    for each row execute function public.set_updated_at();
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger set_updated_at before update on public.projects
    for each row execute function public.set_updated_at();
exception when duplicate_object then null; end $$;

-- ─── 5. RLS for new tables ────────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'learning_goals','knowledge_documents','projects',
    'learning_analytics_snapshots','agent_memory'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "own rows" on public.%I;', t);
    execute format(
      'create policy "own rows" on public.%I
         for all using (auth.uid() = user_id)
         with check (auth.uid() = user_id);', t);
  end loop;
end $$;
