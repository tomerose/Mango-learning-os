# MangoLearningOS — Regression Checklist

> Run before every push. All must pass.

## Quick Smoke Test
```bash
# 7 windows return 200
for url in /hub /agent /exam /grow /planner /dna /profile; do
  curl -s -o /dev/null -w "%{http_code}" http://localhost:3030$url
done
```

## Feature Integrity

### Mangosum (/hub)
- [ ] Onboarding: 5-stage flow on first visit (logo→welcome→features→hub→enter)
- [ ] Onboarding: skipped on return visits (7-day persistence)
- [ ] Onboarding: enter button → hub dashboard, fade transition
- [ ] HubWelcome renders with greeting + streak
- [ ] Mango Magic button visible, opens card on click
- [ ] LearningGoals — empty state in cloud, demo in guest
- [ ] UpcomingExams — empty state in cloud, 3 exams in guest
- [ ] WeeklyChart — empty in cloud, bars in guest
- [ ] AI Recommendations — 3 cards visible
- [ ] QuickActions — 4 buttons, links work
- [ ] Planner CTA — links to /planner

### Mango Tutor (/agent)
- [ ] 4 tabs: 对话/概念讲解/智能练习/知识导入
- [ ] Subject selector pills + SubjectManager
- [ ] AgentChat sends and receives messages
- [ ] ConceptExplainer: input concept → generates explanation
- [ ] ExerciseGenerator: generates questions, scores answers
- [ ] DocumentImporter: upload file → preview → save note

### Mangoing (/exam)
- [ ] 5 tabs: 考试备战/笔记/闪卡/资源/图谱
- [ ] ExamWorkspace: upload materials → generate → preview
- [ ] Web search input works
- [ ] NotesTab: create/edit/delete notes
- [ ] FlashcardsTab: review flow (front→flip→grade)
- [ ] ResourcesTab: resource list by subject
- [ ] GraphTab: nodes visible

### Mango Friend (/grow)
- [ ] 3 tabs: 心灵花园/AI 陪伴/项目实践
- [ ] JournalEditor: mood + stress + text → saves
- [ ] MoodTracker: 7-day timeline renders (no crash)
- [ ] CbtReframer: input → AI reframe
- [ ] AiCompanionChat: sends/receives messages
- [ ] ProjectBuilder: create new project
- [ ] ProjectWorkspace: 3 tabs functional

### Mango Plan (/planner)
- [ ] AI generation: text input → generates plan
- [ ] File upload: accepts PDF/Word/image
- [ ] Task tabs: today/week/done
- [ ] Add task dialog: subject + priority + due date

### Mango DNA (/dna)
- [ ] Page renders without crash
- [ ] Personality profile visible

### Mango (/profile)
- [ ] Avatar + level + XP display
- [ ] Stats cards: streak/XP/minutes/tasks
- [ ] Achievements wall: 6 items
- [ ] Reflections section visible

## Cross-cutting
- [ ] Guest mode (no login): all modules show demo data
- [ ] Cloud mode (logged in): all modules start empty
- [ ] Sidebar: 🥭 icon + "Mango OS" visible, 7 items
- [ ] Mobile: 5-tab bottom nav + "更多" drawer
- [ ] v1 route redirects work (e.g. /dashboard → /hub)
- [ ] TypeScript: `npx tsc --noEmit` = zero errors

## API
- [ ] `/api/ai/magic` returns valid JSON for all 5 modes
- [ ] `/api/ai/chat` streams SSE
- [ ] `/api/ai/quiz` returns questions array
- [ ] `/api/ai/exam-package` generates package
- [ ] `/api/notes/import/file` extracts text from PDF/DOCX
- [ ] `/api/notes/import/url` fetches URL content
