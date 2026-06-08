# V14.8.1 Reference Notes — Solving Platform Limitations

## 1. Vercel Fluid Compute — Long Execution + Background Processing
- **Source**: https://vercel.com/docs/fluid-compute
- **Key**: Enables `after()` from `next/server` for background tasks. On Hobby: 60s timeout.
- **Pattern**: Return response immediately with `runId`, use `after()` for background processing, frontend polls for status.
- **Verdict**: ADAPT — implemented in API route via agent status polling.

## 2. ezPDF — Server-Side PDF Without Docker
- **Source**: https://www.ezpdf.co
- **Key**: Free REST API. POST HTML content → get PDF back. No Docker/Puppeteer needed.
- **Pattern**: Generate clean HTML → POST to ezPDF API → receive PDF buffer → save/return.
- **Verdict**: ADAPT — integrated into /api/export/pdf route.

## 3. Next.js `after()` — Non-blocking Response
- **Source**: https://nextjs.org/docs/app/api-reference/functions/after
- **Key**: `import { after } from 'next/server'` — schedules work after response is sent.
- **Pattern**: In API route: return runId immediately, use `after()` to run Agent pipeline.
- **Verdict**: ADAPT — requires Fluid Compute enabled in Vercel dashboard.

## 4. Supabase Realtime — Instant Progress Updates
- **Source**: https://supabase.com/docs/guides/realtime
- **Key**: Subscribe to database changes in real-time (WebSocket-based).
- **Pattern**: Frontend subscribes to `agent_runs` table changes for instant progress updates.
- **Verdict**: ADAPT — use Supabase Realtime instead of polling for zero-latency updates.
