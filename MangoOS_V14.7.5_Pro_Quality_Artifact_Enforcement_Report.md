# MangoOS V14.7.5 · Pro Quality Gate 90 & Artifact Delivery Enforcement

**2026-06-08** · 内测版 v0.1 · Build 94/94, 0 TS errors ✅

---

## 1. 为什么 63 分内容会被展示

V14.7.4 及之前版本中：
- Pro 质量检查使用 `proContentQualityGate()` 返回 `passed: score >= 75`
- 没有与 tier 绑定的最低门槛
- Pro 用户可以生成 63 分内容并显示为"完成"
- 没有自动深化机制

**根因**: Quality Gate 未按 tier 区分门禁，Pro/Admin 没有更高标准。

---

## 2. 新质量门槛

| 用户层级 | 最低分 | 不达标行为 |
|----------|:------:|------|
| Guest | 60 | 显示"游客演示" |
| Standard | 75 | 显示"Standard 轻量" |
| Pro | **90** | 自动深化 ≤2 次；仍不达标 → "未达标草稿" |
| Admin | **90** | 同 Pro |

### 9 维度评分

| 维度 | 权重 | 说明 |
|------|:--:|------|
| 用户需求覆盖度 | 12 | 输入关键词覆盖 |
| 联网研究完成度 | 14 | 来源数量 + 网络状态 |
| 来源质量 | 10 | 来源数量 |
| 证据引用密度 | 10 | 正文引用标记 [1] [2] |
| 结构完整性 | 12 | ## 标题 + 例题 + 摘要 |
| 内容深度 | 12 | 字符数 ≥4000 |
| 可执行性 | 10 | 行动计划 + 时间线 |
| 导出可用性 | 8 | PDF/MD/HTML 可用 |
| Library 保存 | 4 | 已保存 |

满分 92 → 百分比 = 得分/92 × 100

---

## 3. Pro/Admin 90 分强制逻辑

```
Pro/Admin 生成 → Quality Gate v3 评估
  ├─ ≥90 分 → "完成"· 来源+质量分+保存 ✅
  ├─ <90 分 → 自动深化 (第 1 轮)
  │   ├─ 定向改进提示 → regenerated with deepen prompt
  │   ├─ 再评估
  │   ├─ ≥90 → 完成 ✅
  │   └─ <90 → 自动深化 (第 2 轮)
  │       ├─ ≥90 → 完成 ✅
  │       └─ <90 → "未达标草稿" · 建议补充资料
  └─ 最多深化 2 次
```

实现位置：`app/api/agent/execute/route.ts` — Pro 路径 auto-deepen loop

---

## 4. Research Pipeline 强制执行

Pro/Admin 高价值任务强制走 9 阶段流程：
1. 理解任务
2. 拆解搜索方向
3. 联网查询资料（≥2 轮）
4. 来源筛选 + 评分
5. 证据提取
6. 结构生成
7. 正文生成
8. 质量检查 → 不达标自动深化
9. 准备保存/导出

来源要求：Pro/Admin ≥5 条（最低 3），每条含 title/url/domain/snippet/relevanceScore

---

## 5. 自动继续深化机制

- 低于门槛 → `buildDeependPrompt()` 生成定向改进 prompt
- 基于失败维度生成具体改进建议
- 每次深化重新调用 `generateArtifact()`
- 前端显示深化轮次和质量变化

---

## 6. PDF 导出实现

使用浏览器打印模式：`window.open()` + `document.write()` + `window.print()`
- 文件命名：`MangoOS_任务标题_YYYY-MM-DD.pdf`
- 包含：标题、摘要、正文、来源、质量分、生成时间
- 不破坏 MD/HTML 导出

---

## 7. 生成历史

每次 Agent 生成保存到 artifact history（localStorage）：
- generationId, createdAt, taskType, originalPrompt
- qualityScore, passStatus, researchMode
- sourcesCount, evidenceCount, deepenRounds
- exportedPdf, savedToLibrary, ownerMode

---

## 8. 修改文件

| 文件 | 改动 |
|------|------|
| `lib/agent/quality-gate-v3.ts` | **新增** — 9维度 tier 门禁 + 自动深化 prompt |
| `app/api/agent/execute/route.ts` | Pro 路径 auto-deepen loop + DEV_FORCE_PLAN |
| `app/(dashboard)/agent/page.tsx` | 质量 V3 维度展示 + PDF 导出 + 深化轮次 |
| `components/agent/outcome-actions-bar.tsx` | PDF 导出按钮 |
| `docs/V14.7.5_GITHUB_REFERENCE_NOTES.md` | 参考笔记 |
| `lib/version.ts` | → V14.7.5 |

---

## 9. Pro/Admin/Standard/Guest 测试

| 测试 | Pro/Admin | Standard | Guest |
|------|:--:|:--:|:--:|
| 研究管道 | 7阶段完整 | 轻量搜索 | 本地演示 |
| 质量门槛 | 90 | 75 | 60 |
| 自动深化 | ≤2次 | 无 | 无 |
| 来源要求 | ≥5条 | ≥0条 | 0 |
| PDF 导出 | ✅ | ✅ | ✅ |
| MD/HTML 导出 | ✅ | ✅ | ✅ |

---

## 10. Build 结果

```
94/94 pages, 0 TypeScript errors ✅
```

---

## 11. 剩余风险

1. **DEV_FORCE_PLAN 仅开发环境生效** — 生产环境需真实 Supabase 配置才能识别 Pro
2. **PDF 为浏览器打印模式** — 非服务端 Puppeteer，排版依赖浏览器
3. **自动深化增加生成时间** — Pro 任务可能 60-180 秒
4. **中文搜索源不足** — DuckDuckGo 中文返回少，建议后续添加 Bing/Baidu API

---

**第三自习室出品 · 把焦虑变成准备**
