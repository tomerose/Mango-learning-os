# P1-P6 Research Notes — 2026-06-07

## GitHub Repos Inspected

### Open-LLM-VTuber (10.2k ★)
- **Pattern**: Live2D avatar + voice interaction + LLM backend
- **Takeaway for MangoOS**: Voice interaction architecture (ASR→LLM→TTS pipeline), Live2D too heavy for now
- **Action**: Voice-to-Task input (P5), no real-time avatar yet

### PaddleOCR (80.9k ★)
- **Pattern**: Lightweight OCR toolkit, 100+ languages, PDF/image→structured data
- **Takeaway**: Already have PaddleOCR client in lib/paddleocr/client.ts
- **Action**: Wire OCR into multimodal input composer (P2), image→mistake extraction

### knowledge-work-plugins (19.3k ★)
- **Pattern**: Plugin architecture for document workflows, task-specific tools, structured output
- **Takeaway**: Tool Registry pattern, strict whitelist, human-in-the-loop review
- **Action**: Agent Tool Registry with whitelist (P1), structured output contracts

### motion-canvas (18.6k ★)
- **Pattern**: Programmatic animation generation, educational visual explainers
- **Takeaway**: Timeline-based animation, concept visualization
- **Action**: Architecture hooks for future animated explanations (P5), not now

### public-apis (439.8k ★)
- **Pattern**: Massive free API directory — academic, books, dictionary, finance
- **Takeaway**: Existing Research Orchestrator already covers: DuckDuckGo, arXiv, Open Library, Free Dictionary, Gutendex
- **Action**: Expand with more academic APIs (Semantic Scholar, OpenAlex) — P6

## Design References
- **Mobbin/Awwwards**: Premium learning apps use warm paper + serif + glass nav + generous whitespace
- **Calm/Headspace**: Breathing animations, slow transitions, nature-inspired palette
- **Notion/Craft**: Block-based editor, properties panel, database views
- **Linear**: Clean task lists, status transitions, keyboard shortcuts

## Implementation Decisions
1. Agent runs on existing DeepSeek (no new AI deps)
2. Tool Registry: TypeScript module with whitelist, no runtime plugin loading
3. Mistake Bank: localStorage + Supabase, same dual-mode as Study Packs
4. Review Engine: Rule-based + AI hybrid (rules for scheduling, AI for content)
5. Learning Memory: localStorage profile, Supabase for cloud users
6. Feature Gates: Check at API level, UI is cosmetic only
7. No new npm deps unless essential
