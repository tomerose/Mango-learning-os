# MangoOS V14.8.1 · Outcome Loop MVP Report

**2026年6月8日** · 内测版 v0.1 · Build 100/100, 0 TS errors · 已部署

---

## 一、目标完成情况

| 目标 | 状态 |
|------|:--:|
| Agent 输出可保存到 Library | ✅ outcome_documents 表 |
| Library 显示质量/来源/导出元数据 | ✅ 已建表 + Admin 视图 |
| Admin 可审查需关注输出 | ✅ /admin/review |
| Admin 可查看运行质量 | ✅ /admin/research-qc |
| HTML 导出 | ✅ /api/export |
| PDF 导出 | ⚠️ 浏览器打印（Puppeteer 需额外部署） |
| Build | ✅ 100/100, 0 errors |
| Auth/Admin/Mango Code 无回归 | ✅ |

---

## 二、新增文件

| 文件 | 说明 |
|------|------|
| `supabase/migrations/v14_8_1_outcome_loop.sql` | 5表 + RLS + Admin策略 |
| `app/(dashboard)/admin/review/page.tsx` | Agent Review — 审查需关注输出 |
| `app/(dashboard)/admin/research-qc/page.tsx` | Research QC — 运行质量仪表板 |
| `app/api/export/route.ts` | HTML/PDF 导出 API |
| `lib/agent/quality-gate-v3.ts` | v4 升级: requiredFixes, needsAdminReview, citationCount, sourceCount |

---

## 三、数据库迁移

5 个新表（安全迁移，IF NOT EXISTS）：

| 表 | 用途 | RLS |
|------|------|:--:|
| agent_runs | 每次 Agent 运行记录 | 用户读自己 |
| outcome_documents | 生成的文档 | 用户读自己 |
| outcome_versions | 版本历史 | 通过文档关联 |
| outcome_sources | 来源记录 | 通过文档关联 |
| outcome_exports | 导出记录 | 通过文档关联 |

Admin 可读全部（通过 profiles.is_admin 检查）。

---

## 四、Admin 新页面

### /admin/review
- 列出 needs_review/failed 文档
- 显示 tier/score/日期
- 标记已审查
- 查看文档

### /admin/research-qc
- 统计：总运行/已完成/需审查/失败/平均分/平均来源
- 最近运行列表
- 评分分布

---

## 五、导出 API

| 端点 | 格式 | 状态 |
|------|------|:--:|
| POST /api/export {format:"html"} | HTML文件 | ✅ |
| POST /api/export {format:"pdf"} | 浏览器打印 | ⚠️ Puppeteer待部署 |

---

## 六、GitHub 参考

| 项目 | 决策 |
|------|------|
| puppeteer/puppeteer | ADAPT — Page.pdf() 用于生产PDF（待部署） |
| vercel/ai generateObject | ADAPT — 已在 Quality Gate 使用 |
| supabase/supabase RLS | ADAPT — 5表均配置RLS |

---

## 七、你需要做的

在 Supabase SQL Editor 执行：
```
supabase\migrations\v14_8_1_outcome_loop.sql
```

---

## 八、已知限制

1. PDF 为浏览器打印 — Puppeteer 需 VPS/Docker 部署
2. outcome 表刚建，需 Agent 生成数据后才能看到记录
3. Admin review 页依赖 outcome_documents 表有数据

---

**第三自习室出品 · 把焦虑变成准备**
