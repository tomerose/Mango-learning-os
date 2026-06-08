# GITHUB REFERENCE NOTES — MangoOS V14.8 Weekend Closeout

> Date: 2026-06-08 | Context: MangoOS research sprint — 6 projects audited for pattern borrowing, dependency decisions, architecture reference.

---

## 1. diegomura/react-pdf (`@react-pdf/renderer`)

### Basic Info
- **Repo:** https://github.com/diegomura/react-pdf
- **Stars:** 16.6k
- **License:** MIT
- **Latest:** v4.x (monorepo, Lerna + Yarn, 82% TypeScript)
- **Bundle size:** No precise bundlephobia data available, but issue #632 labels it "huge" — includes yoga-layout (flexbox engine), fontkit, and crypto polyfills. Estimated min+gz > 200KB for core. Server-only usage (API routes) avoids client bundle impact entirely.

### What Problem It Solves
Creates PDF documents using React component primitives (`Document`, `Page`, `Text`, `View`, `StyleSheet`). Declarative Flexbox-based layout system. Targets both browser (via `<PDFViewer>`) and Node.js server (via `renderToBuffer` / `renderToStream` / `renderToFile`).

### Key Pattern to Borrow
The **StyleSheet.create()** pattern for typed, composable document styling:

```ts
import { StyleSheet } from '@react-pdf/renderer';
const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12 },
  title: { fontSize: 24, marginBottom: 10, fontWeight: 'bold' },
});
```

### Next.js 15 Compatibility: BROKEN (as of 2026-06)
Multiple unresolved issues:
- **#2994** — `renderToStream` broken (React 19 Symbol mismatch: "Minified React error #31")
- **#3074** — `renderToBuffer` throws `PDFDocument is not a constructor` in App Router
- **#3163** — Official Next.js 15 example is non-functional (dep conflicts + runtime errors)
- **#2935** — React 19 support is still an open feature request
- **#2992** — ESM import issues in Next.js

### Markdown Rendering
**NOT natively supported.** `@react-pdf/renderer` uses its own primitives (`Text`, `View`, `Image`) — incompatible with `react-markdown`'s DOM output. Workaround exists via **`react-md2pdf`** (parses markdown AST with Remark, maps to react-pdf components), but the library was last updated 3+ years ago and is unmaintained.

### Decision: **REJECT**
- Too many unresolved Next.js 15 breakages
- No React 19 support timeline
- Markdown → PDF requires a fragile AST bridge
- **Alternative:** Puppeteer HTML→PDF pipeline (see project #5 below)

---

## 2. vercel/ai (AI SDK)

### Basic Info
- **Repo:** https://github.com/vercel/ai
- **NPM:** `ai`
- **Stars:** 24.7k
- **License:** Apache-2.0 (assumed — standard Vercel OSS)
- **Latest:** v6.x (2025-2026). Two API generations co-exist: v5 (`generateObject`) and v6 (`generateText` + `Output.object()`)

### What Problem It Solves
Provider-agnostic, type-safe AI toolkit for TypeScript. Unified API across OpenAI, Anthropic, Google, and 20+ providers. Structured output, streaming, tool calling, agents — all with Zod schema validation built-in.

### Key Patterns to Borrow

#### A. Structured Output / Quality Scoring with `generateObject` (v5 API)

```ts
import { generateObject } from 'ai';
import { z } from 'zod';

const QualityScoreSchema = z.object({
  relevance: z.number().min(0).max(5).describe('How relevant the output is to the query'),
  accuracy: z.number().min(0).max(5).describe('Factual correctness'),
  clarity: z.number().min(0).max(5).describe('Readability and structure'),
  overall: z.number().min(0).max(5),
  reasoning: z.string().describe('Chain-of-thought justification for scores'),
});

const { object: scores } = await generateObject({
  model: openai('gpt-4o-mini'), // cheap model for scoring
  schema: QualityScoreSchema,
  prompt: `Evaluate this AI-generated content against the query.\n\nQUERY: ${query}\n\nOUTPUT: ${output}`,
});
```

#### B. Streaming Pattern for Real-Time UX

```ts
const { partialObjectStream } = streamObject({
  model: openai('gpt-4o'),
  schema: MySchema,
  prompt: 'Generate...',
});

for await (const partial of partialObjectStream) {
  // Progressive UI updates as the model generates
}
```

#### C. Error Handling with Typed Errors

```ts
import { AI_NoObjectGeneratedError, AI_APICallError } from 'ai';

try {
  const { object } = await generateObject({ ... });
} catch (error) {
  if (AI_NoObjectGeneratedError.isInstance(error)) {
    // Schema validation failed — retry or fallback
  } else if (AI_APICallError.isInstance(error)) {
    // Provider API error — exponential backoff retry
  }
}
```

#### D. V6 API: Unified `Output.object()` Pattern

```ts
import { generateText, Output } from 'ai';

const { output } = await generateText({
  model: 'openai/gpt-5.4',
  output: Output.object({
    schema: z.object({
      recipe: z.object({
        name: z.string(),
        ingredients: z.array(z.object({ name: z.string(), amount: z.string() })),
        steps: z.array(z.string()),
      }),
    }),
  }),
  prompt: 'Generate a lasagna recipe.',
});
```

#### E. Retry Pattern (Custom Wrapper)

The SDK does not provide built-in retry middleware, but typed errors enable:

```ts
async function generateWithRetry(params: Parameters<typeof generateObject>[0], maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await generateObject(params);
    } catch (error) {
      if (AI_APICallError.isInstance(error) && error.isRetryable && attempt < maxRetries - 1) {
        await new Promise(r => setTimeout(r, 2 ** attempt * 1000));
        continue;
      }
      throw error;
    }
  }
}
```

### Decision: **ADAPT — Install as Dependency**
- Core infrastructure for any AI pipeline in MangoOS
- Use v5 `generateObject` for quality scoring (proven, stable)
- Use Zod `.describe()` extensively — these hints are passed to the LLM
- For scoring: use cheapest model (gpt-4o-mini / claude-haiku) to keep costs minimal
- For streaming chat: use `streamObject` with `partialObjectStream`

---

## 3. firecrawl/firecrawl-mcp-server

### Basic Info
- **Repo:** https://github.com/firecrawl/firecrawl-mcp-server
- **NPM:** `firecrawl-mcp` (run via `npx -y firecrawl-mcp`)
- **Stars:** 6.5k
- **License:** MIT
- **Lang:** JavaScript 83% / TypeScript 15.9%

### What Problem It Solves
Web scraping, crawling, search, and AI-powered extraction exposed as MCP tools for LLM clients (Claude, Cursor, VS Code). 11 tools covering the full research pipeline: single-page scrape, batch scrape, recursive crawl, site mapping, web search, structured LLM extraction, and autonomous multi-source research agent.

### API Surface (11 MCP Tools)

| Tool | Purpose |
|------|---------|
| `firecrawl_scrape` | Single URL → markdown / JSON / branding |
| `firecrawl_batch_scrape` | Parallel multi-URL scraping |
| `firecrawl_check_batch_status` | Poll batch job |
| `firecrawl_map` | Discover all indexed URLs on a domain |
| `firecrawl_search` | Web search + optional page scraping |
| `firecrawl_search_feedback` | Submit relevance feedback (refunds 1 credit) |
| `firecrawl_crawl` | Async recursive crawl with depth/limit |
| `firecrawl_check_crawl_status` | Poll crawl job |
| `firecrawl_extract` | LLM-powered structured data extraction |
| `firecrawl_agent` | Autonomous multi-source research agent |
| `firecrawl_agent_status` | Poll agent job |
| `firecrawl_monitor_*` | Scheduled page monitoring + webhooks |

### Free Tier
- **500 credits** (may be one-time, not monthly renewal)
- **No credit card required**
- Rate limits: 10 req/min (scrape), 1/min (crawl), 5/min (search), 2 concurrent
- `/extract` (AI extraction) billed separately via token model (~$89/mo for 18M tokens)
- Paid from $16/mo (Hobby: 3K credits)

### Key Pattern: JSON Schema for Structured Extraction

```json
// With firecrawl_scrape + extractorOptions
{
  "formats": ["markdown"],
  "extractorOptions": {
    "mode": "llm-extraction",
    "extractionSchema": {
      "type": "object",
      "properties": {
        "title": { "type": "string" },
        "key_points": { "type": "array", "items": { "type": "string" } },
        "technical_stack": { "type": "array", "items": { "type": "string" } }
      }
    }
  }
}
```

### MCP Setup for Claude

```json
{
  "mcpServers": {
    "firecrawl": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": { "FIRECRAWL_API_KEY": "fc-YOUR_KEY" }
    }
  }
}
```

### Decision: **ADAPT — Install as MCP Server**
- Free tier sufficient for research and prototyping
- Use `firecrawl_search` + `firecrawl_scrape` for competitive research
- Use `firecrawl_extract` for structured data extraction from target sites
- Self-hosted option available via `FIRECRAWL_API_URL` (avoid credit costs)
- Pattern to borrow: the **search → scrape → extract** pipeline for automated research

---

## 4. upstash/ratelimit-js (`@upstash/ratelimit`)

### Basic Info
- **Repo:** https://github.com/upstash/ratelimit-js
- **NPM:** `@upstash/ratelimit`
- **Stars:** 2k
- **License:** MIT

### What Problem It Solves
Connectionless (HTTP-based) rate limiting for serverless runtimes. Uses Upstash Redis as backing store via HTTP — no persistent TCP connections. Sliding window algorithm. Targets Lambda, Cloudflare Workers, Vercel Edge, Next.js.

### API Surface

```ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),                     // UPSTASH_REDIS_REST_URL + TOKEN
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 req / 10s window
  analytics: true,                              // track usage
  prefix: '@mangoos/ratelimit',                 // namespace isolation
});

const { success, limit, remaining, reset } = await ratelimit.limit(userId);
if (!success) {
  return Response.json({ error: 'Too many requests' }, { status: 429 });
}
```

### Local Fallback: NOT BUILT-IN
- **Requires Upstash Redis** even in development — no in-memory LRU-cache fallback
- Development requires either: (a) an Upstash Redis instance, or (b) a custom wrapper that swaps implementations
- Alternative pattern: **local-first with `lru-cache` + Upstash adapter**

### Recommended Wrapper Pattern (Local Fallback)

```ts
// lib/rate-limit.ts
import { LRUCache } from 'lru-cache';

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// Local in-memory fallback (no Redis needed in dev)
class LocalRateLimiter {
  private cache = new LRUCache<string, { count: number; resetAt: number }>({ max: 10000 });

  constructor(private maxRequests: number, private windowMs: number) {}

  async limit(identifier: string): Promise<RateLimitResult> {
    const now = Date.now();
    const entry = this.cache.get(identifier);
    if (!entry || now > entry.resetAt) {
      this.cache.set(identifier, { count: 1, resetAt: now + this.windowMs });
      return { success: true, limit: this.maxRequests, remaining: this.maxRequests - 1, reset: now + this.windowMs };
    }
    entry.count++;
    const remaining = Math.max(0, this.maxRequests - entry.count);
    return { success: entry.count <= this.maxRequests, limit: this.maxRequests, remaining, reset: entry.resetAt };
  }
}

// Factory: swap implementations based on environment
export function createRateLimiter() {
  if (process.env.UPSTASH_REDIS_REST_URL) {
    // Production: use Upstash distributed rate limiter
    const { Ratelimit } = require('@upstash/ratelimit');
    const { Redis } = require('@upstash/redis');
    return new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, '10 s'),
    });
  }
  // Development: use local LRU cache
  return new LocalRateLimiter(10, 10_000);
}
```

### Decision: **PARTIAL ADAPT — Architecture Reference + Local Fallback**
- Install `@upstash/ratelimit` only as optional dependency
- **Core pattern:** local LRU-cache rate limiter as default, Upstash adapter for production
- Borrow the `{ success, limit, remaining, reset }` response interface
- Borrow the `prefix` namespace isolation concept
- Local fallback is critical — hitting Redis on every dev request is wasteful and introduces a hard external dependency

---

## 5. Production Pattern: Next.js Server-Side Markdown → PDF

### Source Pattern (Synthesized from 5+ production references)

**Key sources:**
- dev.to: "Creating a Next.js API to Convert HTML to PDF with Puppeteer (Vercel-Compatible)"
- dev.to: "PDF Generation in Next.js 15 with Puppeteer" (blog.devgenius.io)
- nextjs-forum.com: "Generate PDF on NextJS"
- Vercel Community: "sparticuz/chromium-min working with Vercel for PDF"

### Architecture

```
Markdown String → marked/remark → HTML Template → @sparticuz/chromium-min + puppeteer-core → PDF Buffer → Response
```

### Dependencies

```bash
npm install @sparticuz/chromium-min puppeteer-core marked
```

**Critical version pair (proven working together):**
- `@sparticuz/chromium-min`: v131.0.1+ (v133+ available)
- `puppeteer-core`: v23.5.0 - v24.5.0
- Next.js: 15.x

### API Route: `app/api/pdf/route.ts`

```ts
import { NextRequest, NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium-min';
import puppeteerCore from 'puppeteer-core';
import { marked } from 'marked';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // seconds (requires Pro plan on Vercel)

function markdownToHtml(markdown: string): string {
  const body = marked.parse(markdown);
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          @page { size: A4; margin: 2cm; }
          body {
            font-family: 'Georgia', 'Noto Serif SC', serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #1a1a1a;
          }
          h1 { font-size: 24pt; margin-bottom: 0.5cm; }
          h2 { font-size: 18pt; margin-top: 0.8cm; }
          pre { background: #f5f5f5; padding: 12px; border-radius: 4px; }
          code { font-family: 'JetBrains Mono', monospace; font-size: 10pt; }
          img { max-width: 100%; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>${body}</body>
    </html>`;
}

async function getBrowser() {
  const executablePath = await chromium.executablePath(
    'https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar'
  );
  return puppeteerCore.launch({
    args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: chromium.headless,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { markdown } = await request.json();
    if (!markdown || typeof markdown !== 'string') {
      return NextResponse.json({ error: 'markdown string required' }, { status: 400 });
    }

    const html = markdownToHtml(markdown);
    const browser = await getBrowser();

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
    });

    await browser.close();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="document.pdf"',
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
```

### `next.config.ts`

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium-min'],
};

export default nextConfig;
```

### Production Considerations

| Issue | Solution |
|-------|----------|
| Vercel 50MB bundle limit | Use `@sparticuz/chromium-min` with remote executableUrl |
| Cold start 2-4s latency | Accept — or use Pro plan for 60s timeout and larger memory |
| Hobby plan 10s timeout | Upgrade to Pro, or optimize HTML complexity, use `waitUntil: 'domcontentloaded'` |
| Styles stripped in PDF | `printBackground: true` + `-webkit-print-color-adjust: exact` in CSS |
| Chinese fonts in PDF | Use Google Fonts (`Noto Serif SC`) or bundle a subset font via `@font-face` |
| Storage for generated PDFs | Vercel Blob `put()` or S3 — don't store in `/tmp` (ephemeral) |
| Local dev without serverless | Use full `puppeteer` package locally, `puppeteer-core` for production: `process.env.NODE_ENV === 'development' ? puppeteer.launch() : puppeteerCore.launch(...)` |

### Decision: **ADAPT — Architecture Reference**
- Do NOT use `@react-pdf/renderer` (broken with Next.js 15)
- **Core pattern:** `marked` + `@sparticuz/chromium-min` + `puppeteer-core` → API Route
- HTML→PDF via Puppeteer gives full CSS control, fonts, and print media queries
- Borrow the `serverExternalPackages` config pattern
- Borrow the local/production browser launch split
- For MangoOS: implement as `POST /api/export/pdf` accepting `{ markdown: string }`

---

## 6. Pattern: LLM Output Quality Evaluation (Lightweight)

### Source Pattern (Synthesized from 4 references)

**Key sources:**
- Simon Willison: "Using gpt-4o-mini as a reranker" (2024)
- agentic-patterns.com: "Structured Output Specification"
- LLM-as-Judge Skills (TypeScript): `directScore` + `pairwiseCompare` patterns
- Vercel AI SDK `generateObject` structured output docs

### Architecture
A **2-stage scoring pipeline** using Vercel AI SDK + Zod:

```
AI Output → Stage 1: generateObject (cheap model) → Structured Scores → Stage 2 (optional): pairwise comparison for borderline cases
```

### Pattern: `directScore` — Multi-Dimensional Quality Evaluation

```ts
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// ---- Schema ----
const QualityEvaluationSchema = z.object({
  relevance: z.number().min(0).max(5)
    .describe('Does the output directly address the query? 0=off-topic, 5=perfect match'),
  accuracy: z.number().min(0).max(5)
    .describe('Factual correctness. 0=hallucinated, 5=fully verified'),
  clarity: z.number().min(0).max(5)
    .describe('Structure, readability, and conciseness. 0=garbled, 5=crystal clear'),
  completeness: z.number().min(0).max(5)
    .describe('Coverage of all necessary aspects. 0=missing key info, 5=comprehensive'),
  toxicity: z.number().min(0).max(5)
    .describe('0=harmful/toxic content present, 5=completely safe'),
  overall: z.number().min(0).max(5),
  reasoning: z.string()
    .describe('Chain-of-thought: evaluate each dimension step by step before concluding'),
  flags: z.array(z.enum(['hallucination', 'bias', 'off_topic', 'incomplete', 'repetition']))
    .describe('Any quality issues detected'),
});

// ---- Evaluator ----
async function evaluateOutput(output: string, query: string, context?: string) {
  const { object: scores } = await generateObject({
    model: openai('gpt-4o-mini'), // cheap judge model
    schema: QualityEvaluationSchema,
    system: `You are an AI output quality evaluator. Score the output against the query.
      Be strict but fair. Think step by step for each dimension before scoring.
      Always provide chain-of-thought reasoning.`,
    prompt: [
      `QUERY: ${query}`,
      context ? `CONTEXT: ${context}` : '',
      `OUTPUT (to evaluate):\n\`\`\`\n${output}\n\`\`\``,
      `Evaluate across all dimensions. Return structured scores.`,
    ].filter(Boolean).join('\n\n'),
  });

  return scores;
}
```

### Key Techniques

| Technique | Why |
|-----------|-----|
| **`.describe()` on every field** | These descriptions are sent to the LLM — they define the scoring rubric |
| **Chain-of-thought before score** | `reasoning` field forces the model to justify before outputting numbers |
| **Cheapest model for judge** | gpt-4o-mini or claude-haiku — quality evaluation is an easier task than generation |
| **Schema validation** | Zod ensures the judge returns valid JSON with constraints (`min`/`max`) |
| **Flags array** | Binary quality signals alongside numeric scores for downstream filtering |
| **Context injection** | Provide ground-truth context when available to improve accuracy scoring |

### Lightweight Alternative: Pattern-Matching Pre-Screen

For near-zero-cost scoring (no LLM call), pre-screen with heuristics:

```ts
function quickPreScreen(output: string): { passes: boolean; issues: string[] } {
  const issues: string[] = [];

  if (output.length < 20) issues.push('too_short');
  if (output.includes('[object Object]')) issues.push('serialization_error');
  if (/I (don't|cannot|can't|am unable)/i.test(output)) issues.push('refusal');

  // Repetition detection: same 5-gram appearing 3+ times
  const words = output.split(/\s+/);
  const trigrams = new Map<string, number>();
  for (let i = 0; i < words.length - 2; i++) {
    const key = words.slice(i, i + 3).join(' ').toLowerCase();
    trigrams.set(key, (trigrams.get(key) || 0) + 1);
  }
  if ([...trigrams.values()].some(c => c > 3)) issues.push('repetition');

  return { passes: issues.length === 0, issues };
}
```

### Decision: **ADAPT — Architecture Reference**
- **Stage 1:** Cheap heuristic pre-screen (free, ~1ms)
- **Stage 2:** LLM-as-judge `generateObject` (cheap model, ~$0.001-0.01 per eval)
- **Stage 3 (optional):** Pairwise comparison for borderline cases (double cost, but more reliable for subjective dimensions)
- Do NOT install a heavy eval framework (LangSmith, Braintrust) — this ZERO-dependency pattern suffices
- Key architectural insight: **the evaluation prompt IS the rubric** — invest time in crafting `.describe()` strings rather than building complex scoring infrastructure

---

## Summary Matrix

| # | Project | Stars | License | Next.js 15 Ready | Install or Reference | Decision |
|---|---------|-------|---------|------------------|---------------------|----------|
| 1 | `@react-pdf/renderer` | 16.6k | MIT | NO (multiple open issues) | Neither | **REJECT** |
| 2 | `vercel/ai` | 24.7k | Apache-2.0 | Yes | Install as dependency | **ADAPT** |
| 3 | `firecrawl-mcp-server` | 6.5k | MIT | N/A (MCP server) | Install as MCP server | **ADAPT** |
| 4 | `@upstash/ratelimit` | 2k | MIT | Yes (with Redis) | Architecture reference + local fallback | **PARTIAL** |
| 5 | Next.js PDF Export Pattern | N/A | N/A | Yes (puppeteer-core) | Architecture reference | **ADAPT** |
| 6 | LLM Quality Scoring Pattern | N/A | N/A | Yes (vercel/ai) | Architecture reference | **ADAPT** |

## Action Items (Post-Closeout)

- [ ] Install `vercel/ai` (`ai` + `@ai-sdk/openai`) as core MangoOS dependency
- [ ] Configure Firecrawl MCP server in `.claude/mcp.json` for research workflows
- [ ] Implement `app/api/export/pdf/route.ts` using Puppeteer pattern from #5
- [ ] Implement `lib/evaluate.ts` using quality scoring pattern from #6
- [ ] Implement `lib/rate-limit.ts` with local LRU fallback from #4 wrapper pattern
- [ ] Pin `@sparticuz/chromium-min` and `puppeteer-core` versions after testing
- [ ] Set `serverExternalPackages` in `next.config.ts` for Chromium

---

*Generated: 2026-06-08 | Next review: when MangoOS reaches PDF export or AI scoring milestones.*
