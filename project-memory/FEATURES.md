# MangoLearningOS — Features Inventory

> **Rule: NEVER remove or degrade existing features. Always additive.**

## Mangosum (Hub)
- [x] HubWelcome — time-of-day greeting, XP/level/streak display
- [x] Mango Magic Button — rotating mango SVG, breathing glow, particle ring
- [x] Mango Magic Card — full-screen, 5 modes (exam/notes/plan/learn/recommend), 3+2 grid
- [x] LearningGoalsCard — subject goals with progress bars (empty state for cloud)
- [x] UpcomingExamsCard — countdown cards (empty state for cloud)
- [x] ActiveCoursesList — subject mastery list (empty state for cloud)
- [x] WeeklyOverviewChart — recharts bar chart (empty for cloud)
- [x] AI Recommendations — 3 suggestion cards
- [x] QuickActions — 4 action buttons (agent/exam/grow)
- [x] Planner CTA — `/planner` entry card

## Mango Tutor (Agent)
- [x] AgentChat — streaming SSE chat with DeepSeek
- [x] AgentSuggestions — 4 contextual prompt pills
- [x] ConceptExplainer — 6-part structured explanation
- [x] ExerciseGenerator — AI quiz generation + inline checking
- [x] MistakeAnalyzer — root cause analysis of wrong answers
- [x] SubjectManager — add/remove custom subjects
- [x] AgentContextPanel — subject/weak areas/goals context sidebar
- [x] DocumentImporter — upload PDF/DOCX → extract text → save as note
- [x] Agent memory — persistent context across sessions

## Mangoing (Exam + Knowledge Base)
- [x] ExamWorkspace — 6-step: upload→configure→AI generate→review→practice→export PDF
- [x] MaterialUploader — drag-drop PDF/DOCX/PPTX/TXT
- [x] Web Search — AI-powered topic search for materials
- [x] URL Fetch — import content from URLs
- [x] ReviewBooklet — chapter summaries, formulas, common mistakes
- [x] KnowledgeMapView — nested topic hierarchy
- [x] PracticeSession — MCQ/fill-blank/problem with scoring
- [x] MockExamPlayer — timed mock exam with countdown
- [x] PDFExportButton — print-friendly export
- [x] NotesTab — full note CRUD with tags, import dialog
- [x] FlashcardsTab — SM-2 spaced repetition (again/hard/good/easy)
- [x] ResourcesTab — external resource links by subject
- [x] GraphTab — knowledge graph concept nodes + edges

## Mango Friend (Growth Garden)
- [x] JournalEditor — mood selector, stress/motivation sliders, entry save
- [x] MoodTracker — 7-day emoji timeline with trend
- [x] CbtReframer — AI-powered cognitive distortion reframing
- [x] AiCompanionChat — anonymous emotional support AI (rose theme)
- [x] ProjectCard — status/difficulty/progress display
- [x] ProjectBuilder — create project wizard (name/subject/description/goals)
- [x] ProjectWorkspace — 3-tab: Learn/Build/Submit + AI review
- [x] ProjectGallery — completed project showcase

## Mango Plan (Planner)
- [x] AI Plan Generation — prompt-based + file upload (PDF/Word/image)
- [x] Task Management — add task (title/subject/priority/due), checkbox toggle
- [x] Daily/Weekly/Done views
- [x] Subject + timeframe selectors for AI generation

## Voice Soul Distillation (NEW — Mango DNA 旗舰功能)
- [x] UploadStage — chat records / text / file upload
- [x] DistillationEngine — 6-step animated progress (language→personality→thinking→emotion→voice→profile)
- [x] PersonalityCard — name, MBTI, traits, energy level, emotional pattern
- [x] ThinkingModel — logic style, decision pattern, values, catchphrases, topics
- [x] CommunicationStyle — formality, response length, humor, emoji, warmth (0-100)
- [x] VoiceProfile — estimated pace, energy, pause style, filler words (from text)
- [x] InteractionSnapshot — greeting, farewell, encouragement, conflict response
- [x] DigitalFriendChat — streaming chat with distilled personality as system prompt
- [x] Voice waveform visualization
- [x] `/api/ai/voice-soul` — DeepSeek-powered personality distillation
- [x] Chinese→English key mapper for AI response normalization
- [ ] Future: ASR voice input, TTS output, real-time voice conversation

## Mango DNA
- [x] MangoDNAContent — AI persona profile, agent gallery, features

## Mango (Profile)
- [x] Avatar, XP/level display, progress bar
- [x] Stats cards: streak, total XP, minutes, completed tasks
- [x] Achievement wall (6 achievements, lock/unlock)
- [x] Reflections history

## Onboarding (NEW)
- [x] LogoReveal — opacity 0→1, scale 0.9→1, 1200ms Apple-style
- [x] WelcomeMessage — bilingual fade-up, elegant typography
- [x] FeatureCards — 6 cards sequential reveal (120ms delay), spring hover
- [x] ParticleBackground — 30 low-opacity floating dots, mouse-follow
- [x] GradientLights — orange/purple/blue slow-moving ambient glows
- [x] LearningHubPreview — blurred → sharp, real dashboard preview
- [x] EnterButton — breathing animation, exit fade
- [x] localStorage persistence — 7-day hide after completion

## Cross-cutting
- [x] Dual-mode persistence (guest localStorage / cloud Supabase)
- [x] Guest cookie middleware bypass
- [x] Login with clean slate (cloud = empty, no demo data migration)
- [x] Guest mode shows demo data for feature showcase
- [x] 301 redirects for v1 routes
- [x] Responsive desktop/mobile layout
- [x] Dark mode support (next-themes)
- [x] PWA manifest + service worker
- [x] Apple-style design: rounded-2xl cards, glassmorphism, 8px grid

---

## Agent Collaboration and Synchronization Rules

- **ClaudeCoda** owns: product implementation, UI/UX refinement, interaction polish, visual consistency, new experience construction, feature output contracts.
- **Codex** owns: engineering audit, production readiness, bug fixing, regression testing, TypeScript/data-flow hardening, export reliability, persistence verification, mock/fake logic detection, necessary architecture cleanup.
- Synchronization through Git commits, branches, and project-memory files.
- No two agents on same branch. No overlapping directory edits without coordination.
- Codex first task = audit-only. Codex changes = diff review before merge.
- Production readiness = lint + typecheck + build + core workflow verification.
- Stability > visual decoration.

## Current Auth Codes (v7.3)
- Guest / First entry: `sillyfind2025`
- Login / Register: `tokentome222`
