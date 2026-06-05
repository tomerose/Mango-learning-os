# MangoLearningOS — Project State

**Updated:** 2026-06-06 | **Version:** v6 Warm Paper Wellness

## Stack (v6)
Next.js 15.5 (App Router) · React 19 · TypeScript 5.8 · Tailwind CSS 4.1
shadcn/ui (New York) · Supabase (PostgreSQL + RLS) · DeepSeek AI · Vercel

## Design System (v6 Warm Paper Wellness)
- Palette: oklch(0.978 0.005 60) bg | oklch(0.58 0.16 75) primary | oklch(0.85 0.04 140) accent
- Typography: Cormorant Garamond (serif display) + Inter (geometric sans)
- Surface: 6-level (paper/card/floating/glass/focus/hero)
- Shadow: 0 8px 30px rgb(0,0,0,0.04)
- Key components: AmbientOrbs, LearningCards, StepWizard, SkillTree, MotionSystem

## Architecture
- **Dual-mode persistence:** guest (localStorage) / cloud (Supabase + RLS)
- **AI layer:** `lib/ai/client.ts` — pluggable OpenAI-compatible (`streamChat`, `completeChat`, `extractJson`)
- **Store:** `lib/store.tsx` — React Context, dual-mode, actions with side-effects outside setState
- **Guest cookie:** `mango_guest=1` — middleware bypass for unauthenticated visitors

## Routes (7 windows + 2 aux)

| Route | Window | Key Modules |
|-------|--------|-------------|
| `/hub` | Mangosum | HubWelcome, MagicButton+MagicCard, LearningGoals, UpcomingExams, ActiveCourses, WeeklyChart, AI Recs, QuickActions, Planner CTA |
| `/agent` | Mango Tutor | AgentChat, ConceptExplainer, ExerciseGenerator, MistakeAnalyzer, DocumentImporter, SubjectManager, AgentContextPanel |
| `/exam` | Mangoing | ExamWorkspace (search→generate→review→practice→export), NotesTab, FlashcardsTab, ResourcesTab, GraphTab |
| `/grow` | Mango Friend | Mind (JournalEditor, MoodTracker, CbtReframer), AI CompanionChat, Projects (Builder+Workspace+Gallery+AI Review) |
| `/planner` | Mango Plan | AI plan generation (prompt + file upload), Task management (today/week/done) |
| `/dna` | Mango DNA | MangoDNAContent (persona profile, agent gallery) |
| `/profile` | Mango | ProfileTab (XP, level, achievements, stats, reflections) |

## Database (Supabase)
- 21 tables: profiles, tasks, study_plans, goals, knowledge_notes, flashcards, resources, learning_sessions, quiz_attempts, achievements, user_achievements, reflections, ai_conversations, knowledge_graph_nodes, knowledge_graph_edges, exam_questions, exam_results, learning_goals, knowledge_documents, projects, learning_analytics_snapshots, agent_memory
- All tables RLS-protected
- Migration: `docs/architecture/v2-migration.sql`

## API Routes (25+)
Auth: `/auth/callback`, `/auth/signout`, `/api/guest`
AI: `/api/ai/chat`, `/api/ai/agent`, `/api/ai/quiz`, `/api/ai/magic`, `/api/ai/exam-package`, `/api/ai/exam-search`, `/api/ai/knowledge-extract`, `/api/ai/flashcard-generate`, `/api/ai/summary-generate`, `/api/ai/mind-journal`, `/api/ai/project-review`
Data: `/api/analytics`, `/api/exam/*`, `/api/notes/*`, `/api/knowledge-tree/*`, `/api/projects/*`

## Navigation
- Desktop: 280px collapsible sidebar (7 items, 🥭 icon + "Mango OS" brand)
- Mobile: 5-tab floating glass pill + "更多" drawer
- 301 redirects: all v1 routes → v2 routes in next.config.ts
