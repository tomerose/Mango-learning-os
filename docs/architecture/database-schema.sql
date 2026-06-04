-- ═══════════════════════════════════════════════════════════════════════════
-- AI Learning OS — PostgreSQL Schema (Supabase)
-- ───────────────────────────────────────────────────────────────────────────
-- Design principles:
--   • Every user-owned table carries user_id → auth.users(id) and RLS ON.
--   • RLS policies enforce "owner-only" access by default.
--   • Timestamps are timestamptz; updated_at maintained by trigger.
--   • Enums model closed sets (subjects, priorities) for type-safety parity
--     with lib/types.ts.
-- Apply via: supabase db push  (or paste into the SQL editor).
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Extensions ────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Enums ─────────────────────────────────────────────────────────────────
do $$ begin
  create type subject_id as enum ('ai','economics','finance','math','english');
exception when duplicate_object then null; end $$;

do $$ begin
  create type priority_level as enum ('low','medium','high');
exception when duplicate_object then null; end $$;

do $$ begin
  create type plan_horizon as enum ('daily','weekly','monthly','semester');
exception when duplicate_object then null; end $$;

do $$ begin
  create type activity_kind as enum ('study','quiz','note','achievement','reflection');
exception when duplicate_object then null; end $$;

-- ─── updated_at trigger fn ─────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- profiles — extends auth.users with learning-OS state
-- ═══════════════════════════════════════════════════════════════════════════
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text not null default 'Learner',
  university    text,
  major         text,
  level         int  not null default 1,
  total_xp      int  not null default 0,
  streak_days   int  not null default 0,
  last_active   date,
  theme         text not null default 'system',
  locale        text not null default 'zh-CN',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-provision a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', 'Learner'));
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ═══════════════════════════════════════════════════════════════════════════
-- study_plans + tasks
-- ═══════════════════════════════════════════════════════════════════════════
create table if not exists public.study_plans (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  horizon     plan_horizon not null,
  title       text not null,
  starts_on   date,
  ends_on     date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.tasks (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  plan_id       uuid references public.study_plans(id) on delete set null,
  title         text not null,
  subject       subject_id not null,
  priority      priority_level not null default 'medium',
  done          boolean not null default false,
  due_at        timestamptz,
  estimated_min int not null default 30,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- goals
-- ═══════════════════════════════════════════════════════════════════════════
create table if not exists public.goals (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  subject     subject_id,
  title       text not null,
  horizon     plan_horizon not null default 'weekly',
  current_val numeric not null default 0,
  target_val  numeric not null,
  unit        text not null default 'hrs',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- knowledge_notes + flashcards (spaced repetition) + resources
-- ═══════════════════════════════════════════════════════════════════════════
create table if not exists public.knowledge_notes (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  subject     subject_id not null,
  title       text not null,
  body        text not null default '',
  tags        text[] not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.flashcards (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  subject       subject_id not null,
  deck          text not null default 'default',
  front         text not null,
  back          text not null,
  -- SM-2 spaced-repetition state
  ease          numeric not null default 2.5,
  interval_days int not null default 0,
  repetitions   int not null default 0,
  due_on        date not null default current_date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.resources (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  subject     subject_id,
  title       text not null,
  url         text,
  kind        text not null default 'article',
  created_at  timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- learning_sessions + quiz_attempts
-- ═══════════════════════════════════════════════════════════════════════════
create table if not exists public.learning_sessions (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  subject      subject_id not null,
  minutes      int not null default 0,
  started_at   timestamptz not null default now()
);

create table if not exists public.quiz_attempts (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  subject       subject_id not null,
  topic         text,
  total         int not null,
  correct       int not null,
  detail        jsonb,
  created_at    timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- achievements + user_achievements
-- ═══════════════════════════════════════════════════════════════════════════
create table if not exists public.achievements (
  id          text primary key,        -- e.g. 'streak_7'
  name        text not null,
  description text not null,
  icon        text not null default 'award'
);

create table if not exists public.user_achievements (
  user_id        uuid not null references auth.users(id) on delete cascade,
  achievement_id text not null references public.achievements(id) on delete cascade,
  unlocked_at    timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- reflections
-- ═══════════════════════════════════════════════════════════════════════════
create table if not exists public.reflections (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  horizon     plan_horizon not null default 'daily',
  mood        text,
  body        text not null default '',
  created_at  timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- ai_conversations — AI tutor chat history
-- ═══════════════════════════════════════════════════════════════════════════
create table if not exists public.ai_conversations (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  subject     subject_id not null,
  messages    jsonb not null default '[]',   -- [{role, content}]
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- knowledge graph (concepts + relationships)
-- ═══════════════════════════════════════════════════════════════════════════
create table if not exists public.knowledge_graph_nodes (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  subject     subject_id not null,
  label       text not null,
  note_id     uuid references public.knowledge_notes(id) on delete set null,
  created_at  timestamptz not null default now()
);

create table if not exists public.knowledge_graph_edges (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  source_id   uuid not null references public.knowledge_graph_nodes(id) on delete cascade,
  target_id   uuid not null references public.knowledge_graph_nodes(id) on delete cascade,
  relation    text not null default 'related',
  created_at  timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════════════════════
-- Indexes (hot query paths)
-- ═══════════════════════════════════════════════════════════════════════════
create index if not exists idx_tasks_user_due       on public.tasks(user_id, due_at);
create index if not exists idx_tasks_user_done       on public.tasks(user_id, done);
create index if not exists idx_notes_user_subject    on public.knowledge_notes(user_id, subject);
create index if not exists idx_flashcards_user_due   on public.flashcards(user_id, due_on);
create index if not exists idx_sessions_user_started on public.learning_sessions(user_id, started_at);
create index if not exists idx_quiz_user_created     on public.quiz_attempts(user_id, created_at);

-- ═══════════════════════════════════════════════════════════════════════════
-- updated_at triggers
-- ═══════════════════════════════════════════════════════════════════════════
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','study_plans','tasks','goals','knowledge_notes',
    'flashcards','ai_conversations'
  ] loop
    execute format(
      'drop trigger if exists set_updated_at on public.%I;
       create trigger set_updated_at before update on public.%I
       for each row execute function public.set_updated_at();', t, t);
  end loop;
end $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- Row-Level Security — owner-only access on every user-owned table
-- ═══════════════════════════════════════════════════════════════════════════
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','study_plans','tasks','goals','knowledge_notes','flashcards',
    'resources','learning_sessions','quiz_attempts','user_achievements',
    'reflections','ai_conversations','knowledge_graph_nodes','knowledge_graph_edges'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
  end loop;
end $$;

-- profiles keys on id; all other tables key on user_id.
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

do $$
declare t text;
begin
  foreach t in array array[
    'study_plans','tasks','goals','knowledge_notes','flashcards','resources',
    'learning_sessions','quiz_attempts','user_achievements','reflections',
    'ai_conversations','knowledge_graph_nodes','knowledge_graph_edges'
  ] loop
    execute format('drop policy if exists "own rows" on public.%I;', t);
    execute format(
      'create policy "own rows" on public.%I
         for all using (auth.uid() = user_id)
         with check (auth.uid() = user_id);', t);
  end loop;
end $$;

-- achievements is a public catalog: readable by all authenticated users.
alter table public.achievements enable row level security;
drop policy if exists "read catalog" on public.achievements;
create policy "read catalog" on public.achievements
  for select using (auth.role() = 'authenticated');

-- ═══════════════════════════════════════════════════════════════════════════
-- Seed: achievement catalog
-- ═══════════════════════════════════════════════════════════════════════════
insert into public.achievements (id, name, description, icon) values
  ('streak_7',    '七日连击',   '连续学习 7 天',        'flame'),
  ('hundred_q',   '百题斩',     '完成 100 道练习',      'book-open'),
  ('quiz_ace',    '测验达人',   '测验正确率 90%+',      'brain'),
  ('early_bird',  '早起鸟',     '7 天早于 8 点学习',    'star'),
  ('perfect_mon', '月度全勤',   '30 天不断签',          'award'),
  ('goal_done',   '目标达成者', '完成一个学期目标',      'target')
on conflict (id) do nothing;
