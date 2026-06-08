# MangoOS V14.8 · Weekend Closeout Report

**2026年6月8日** · 内测版 v0.1 · Build 97/97, 0 TS errors · 已部署

---

## 一、本周总结

| 内部版本 | 用户版本 | 页面 | TS 错误 | 部署 |
|----------|----------|:--:|:--:|:--:|
| V14.7.1 → V14.8 | MangoOS 内测版 v0.1 | 97 | 0 | https://mangoleaningos.top |

23 commits, 6个版本迭代，从实机验证到 Admin 系统到质量门禁。

---

## 二、V14.8 本日改动

### Quality Gate v4 Hard Gate (`lib/agent/quality-gate-v3.ts`)
- 新增 `requiredFixes` — 每项失败维度的具体修复建议
- 新增 `needsAdminReview` — Pro/Admin 经2轮深化仍不达标，标记需 Admin 审查
- 新增 `citationCount` — 输出中检测到的引用计数
- 新增 `sourceCount` — 使用的来源数量
- 评分维度保持 9 维不变，返回结构更完整

### GitHub 参考研究 (`project-memory/GITHUB_REFERENCE_NOTES_V14.8.md`)
6 个项目审查完成：

| 项目 | 决策 |
|------|------|
| @react-pdf/renderer | REJECT — Next.js 15 兼容性问题 |
| vercel/ai (generateObject) | ADAPT — 用于质量评分结构化输出 |
| firecrawl-mcp-server | ADAPT — 500免费积分 |
| @upstash/ratelimit | PARTIAL — 借鉴接口，本地 fallback |
| Puppeteer HTML-to-PDF | ADAPT — 生产级 PDF 路径 |
| LLM Quality Scoring | ADAPT — 轻量启发式+结构化评分 |

### 其他保持
- Rate limiter 原实现保持不变（已有 9 个 API 路由使用）
- 所有现有路由无回归
- Auth/Guest/Mango Code/Admin 入口正常

---

## 三、当前完整能力

### Agent
- Pro/Admin: 7阶段 Pipeline + 90分 Gate + 自动深化≤2轮 + needsAdminReview
- Standard: 轻量搜索 + 75分 Gate
- Guest: 本地演示 + 60分 Gate

### Admin
- /admin Console: 6卡片
- /admin/codes: Mango Code 管理
- API 鉴权: service_role key + session 验证

### 用户体验
- 4 张一键体验卡
- 版本展示 + 更新节奏
- Mango Agent Workbench 愿景
- 移动端可读性达标

---

## 四、已知提醒

1. **PDF 导出** — 当前浏览器打印。@react-pdf/renderer 在 Next.js 15 上有兼容性问题，建议下版本用 Puppeteer HTML-to-PDF
2. **DuckDuckGo 中文搜索弱** — 中文 Wikipedia 已补偿
3. **Admin 卡片 4/6 接入** — Mango Code + Agent Review 已可操作
4. **PostgREST schema cache** — 偶发问题，已用 SQL Editor 手工方式绕过

---

## 五、Git 提交（今日）

```
ae79d3e fix: match actual mango_codes table columns
483a94e fix: admin API — explicit schema public in Supabase client
af581d8 fix: raw REST API to bypass PostgREST schema cache issue
8369bdf fix: admin API — detailed error messages for debugging
348787b admin: change admin email to 1211000567@qq.com
464c290 fix: admin codes — server-side API with service_role auth bypasses RLS
b0b299c fix: admin check — email check first, then profiles table
3da3cc2 fix: admin pages — check profiles table for admin status
f7858f9 fix: V14.7.5 admin/codes — use shared Supabase SSR client
...
```

---

**第三自习室出品 · 把焦虑变成准备**
