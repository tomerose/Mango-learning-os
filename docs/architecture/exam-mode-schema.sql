-- ═══════════════════════════════════════════════════════════════
-- Exam Mode — user question bank + detailed results
-- ═══════════════════════════════════════════════════════════════

create table if not exists public.exam_questions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  subject     text not null,
  topic       text not null,
  type        text not null check (type in ('mcq','fill_blank','problem')),
  question    text not null,
  options     jsonb not null default '[]',
  answer      text not null,
  explanation text not null default '',
  difficulty  text not null default 'medium' check (difficulty in ('easy','medium','hard')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.exam_results (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  subject     text not null,
  topic       text not null,
  score       int not null default 0,
  total       int not null default 0,
  details     jsonb not null default '[]',
  created_at  timestamptz not null default now()
);

-- Indexes
create index if not exists idx_exam_questions_user on exam_questions(user_id, subject);
create index if not exists idx_exam_results_user   on exam_results(user_id, created_at);

-- RLS
alter table public.exam_questions enable row level security;
alter table public.exam_results   enable row level security;

drop policy if exists "own questions" on public.exam_questions;
create policy "own questions" on public.exam_questions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own results" on public.exam_results;
create policy "own results" on public.exam_results
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- updated_at trigger
drop trigger if exists set_updated_at on public.exam_questions;
create trigger set_updated_at before update on public.exam_questions
  for each row execute function public.set_updated_at();
