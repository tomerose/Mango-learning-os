# MangoLearningOS — Regression Checklist

> Run before every push. All must pass.

## Quick Smoke Test
```bash
for url in /hub /agent /exam /grow /planner /dna /profile; do
  curl -s -o /dev/null -w "%{http_code}" http://localhost:3030$url
done
```

## Feature Integrity

### v7 New Features (MUST CHECK)
- [ ] `/exam` → 期末备考 tab visible and loads
- [ ] Exam Review: input form renders (course name, scope, file upload)
- [ ] Exam Review: generate button → researching state → preview
- [ ] Exam Review: Word (.doc) export downloads
- [ ] Exam Review: PDF export opens print dialog
- [ ] Exam Review: Markdown export downloads
- [ ] Exam Review: source cards visible after generation
- [ ] Knowledge Forest: sidebar renders (official + community forests)
- [ ] Knowledge Forest: topic cards expandable
- [ ] Knowledge Forest: notes/resources/path/flashcards tabs work
- [ ] Knowledge Forest: community upload modal with file/URL/manual modes
- [ ] Notes: RichEditor toolbar visible
- [ ] Notes: edit/preview toggle works
- [ ] Notes: properties panel toggles

### API (v7)
- [ ] `/api/exam-review/generate` returns valid JSON with sections
- [ ] `/api/exam-review/export?format=docx` returns .doc file
- [ ] `/api/exam-review/export?format=md` returns .md file
- [ ] `/api/mind-garden/reflect` crisis detection works
- [ ] `/api/mind-garden/reflect` journal mode returns structured output
- [ ] `/api/forest/enrich` returns topics/notes/resources

### Mangoing (/exam)
- [ ] 5 tabs: 期末备考/知识森林/知识网络/笔记/资源
- [ ] NotesTab: create/edit/delete still works
- [ ] KnowledgeForest: official forests load with rich content

### Mango Friend (/grow)
- [ ] Mind Garden tabs visible
- [ ] CbtReframer + JournalEditor still work

### Cross-cutting
- [ ] Guest mode: all modules show demo data
- [ ] Cloud mode: all modules start empty
- [ ] `npx next build --no-lint` = ✓ Compiled successfully
- [ ] Static pages generated (77/77)

## API (Legacy — unchanged)
- [ ] `/api/ai/magic` returns valid JSON
- [ ] `/api/ai/chat` streams SSE
- [ ] `/api/ai/quiz` returns questions array

## Known Limitations
- YouTube provider requires YOUTUBE_API_KEY for video details
- GitHub provider rate-limited to 60 req/h without GITHUB_TOKEN
- Mind Garden PHQ-9-style self-check not yet wired to UI form
- PDF export uses browser print dialog (not server-side PDF generation)

## Auth Invite Codes (v7.3)
- [x] Guest entry → sillyfind2025 works, tokentome222 rejected
- [x] Login/Register → tokentome222 works, sillyfind2025 rejected
- [x] No tokentome111 references in source

## Last Checked
2026-06-06 — v7.3 内测版 deployment
