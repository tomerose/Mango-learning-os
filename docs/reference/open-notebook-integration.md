# Open Notebook Integration Reference

**Source:** https://github.com/lfnovo/open-notebook (28K ★, MIT)
**Purpose:** Future enhancement for MangoOS Knowledge Hub — multi-speaker podcast generation

---

## Architecture

Open Notebook is a self-hosted Google NotebookLM alternative:
- **Backend:** Python (FastAPI) + LangChain + SurrealDB
- **Frontend:** Next.js + React (independent from MangoOS)
- **AI:** 18+ providers (OpenAI, Anthropic, Ollama, LM Studio)
- **Deploy:** Docker Compose (one command)

## Integration Paths

### Option A: Standalone (Recommended for MVP)
- Deploy Open Notebook separately via `docker compose up`
- MangoOS links to it as an external service ("AI Podcast Studio")
- Students upload course materials → generate multi-speaker review podcasts

### Option B: API Integration (Future)
- Open Notebook exposes full REST API
- MangoOS calls `/api/open-notebook/podcast/generate` behind the scenes
- Unified UX: user uploads a PDF in MangoOS → podcast appears in Library

### Option C: Embedded (Advanced)
- Open Notebook's Next.js frontend is a separate app
- Embed via iframe or reverse proxy under `/podcast` route
- Share authentication via Supabase JWT

## Key Features for MangoOS Users

| Feature | MangoOS Value |
|---------|--------------|
| Multi-speaker podcast (1-4 speakers) | Students listen to review material on-the-go |
| PDF/Video/Web ingestion | Same content types as Exam Review |
| 18+ AI providers | Can use DeepSeek (same as MangoOS) |
| Docker deploy | Works on same VPS as MangoOS |

## Quick Deploy

```bash
git clone https://github.com/lfnovo/open-notebook.git
cd open-notebook
docker compose up -d
# → http://localhost:8501
```

## Status

📋 Planned for post-MVP phase. Current MangoOS focus is Agent + Exam Review core loop.
