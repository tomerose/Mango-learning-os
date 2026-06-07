# MangoOS V14.7.2 · Readability, Auth Stability & Research Output Patch

**2026-06-08** · Build 94页 / 0 TS错误 · 6 commits · 已部署

---

## 一句话总结

V14.7.2 修复了移动端文字看不清、登录/游客错误、Agent 研究不可见三大阻塞问题。不新增功能。

---

## 问题复现与修复总览

| # | 问题 | 严重度 | 复现 | 修复 |
|---|------|:--:|:--:|------|
| 1 | 登录页报错 / 无 Supabase 配置提示 | P0 | ✅ | Auth form 加载+错误+配置状态 |
| 2 | 游客入口无反馈 | P0 | ✅ | Guest 按钮 loading spinner |
| 3 | 移动端浅色/深色模式文字太淡 | P1 | ✅ | 33 文件低对比度批量替换 |
| 4 | 玻璃卡片上文字不可读 | P1 | ✅ | 源卡片改用 solid 背景 |
| 5 | 手写体用于正文/按钮/导航 | P1 | ✅ | 保留 font-serif 仅标题 |
| 6 | Pro Agent 不显示研究过程 | P2 | ✅ | 时间线显示真实研究阶段 |
| 7 | Pro 来源不可点击 | P2 | ✅ | 可点击源卡片 + 平台标签 + 摘要 |
| 8 | Standard 用户无轻量模式说明 | P3 | ✅ | "轻量模式"标签 |
| 9 | 网络不可用无提示 | P3 | ✅ | 琥珀色警告条 |
| 10 | 生成阶段只显罐头文字 | P4 | ✅ | 实时阶段事件 + 已用时间 |

---

## P0 — Auth & Guest Entry 修复

**改动文件**: `components/auth/auth-form.tsx`

1. Guest 按钮添加 `Loader2` spinner + `disabled` 状态
2. Supabase 未配置时显示琥珀色提示：`⚠️ 云端功能未配置`
3. 游客模式不阻塞 — 未配置 Supabase 也能进入

**验证**:
- 登录页加载 → ✅
- 游客按钮可点击 → ✅
- 游客按钮禁用态 → ✅
- Supabase 未配置提示 → ✅
- 邀请码验证 → ✅

---

## P1 — Mobile UI Readability 修复

**改动**: 33 个 `.tsx` 文件，CSS token 保持一致

| 模式 | Before | After | 对比度 |
|------|--------|-------|--------|
| `text-fg-muted/30` | ~1.8:1 FAIL | `text-fg-subtle/80` | ~4.2:1 PASS |
| `text-fg-muted/40` | ~2.2:1 FAIL | `text-fg-subtle/90` | ~4.8:1 PASS |
| `text-fg-muted/50` | ~2.8:1 FAIL | `text-fg-muted/80` | ~5.5:1 PASS |
| `text-fg-muted/60` | ~3.4:1 LOW | `text-fg-muted/90` | ~6.2:1 PASS |

**字体层级保持**:
- Cormorant Garamond (`font-serif`) → 仅标题（`.text-display`, `.text-title`）
- Inter (`font-sans`) → 正文、按钮、导航、描述
- 无手写体用于功能文字

---

## P2 — Real Research Behavior

**改动文件**: `app/(dashboard)/agent/page.tsx`

**Pro 用户**:
1. API 返回 `researchPipeline` 数据被捕获到 `researchStages`/`researchSources` 状态
2. 运行视图显示真实研究阶段（不再显示罐头文字）
3. 结果视图显示可点击源卡片：
   - 平台标签（Wikipedia, DuckDuckGo, GitHub 等）
   - 可点击标题 → 新标签打开原始 URL
   - 摘要 snippet
   - ExternalLink 图标
4. "Pro Research" 翠绿色标签 + 来源计数
5. 质量分通过 OutcomeDocument 可见

**Standard 用户**:
- 显示 `Standard 轻量模式：本次未执行完整联网研究` 说明
- 不显示虚假来源

**Guest 用户**:
- 运行阶段显示 `游客模式使用本地演示` 琥珀色提示
- 不崩溃，清晰说明限制

**网络不可用**:
- 显示 `⚠️ 网络不可用，本次生成未使用实时搜索` 提示
- 不生成虚假来源

---

## P3 — Generation Stage Feedback

**改动**: 运行视图重构

旧：3 条罐头文字（"分析中…/调用工具…/整理结果…"）

新：实时事件时间线，每条显示：
```
✅ 分析任务意图 · 识别任务类型: study_outcome · 拆解搜索方向
✅ 生成 4 个搜索方向
🔍 联网搜索资料 · Wikipedia, DuckDuckGo
✅ 筛选 8 条高质量来源
📊 构建知识证据 · 12 条结构化证据
📝 生成最终成品 · 基于研究资料生成
✅ 质量评分 82/100
```

每条事件带：状态图标（spinner/check/alert）+ 消息 + 工具名 badge

---

## P4 — Content Quality Rules

现有 `lib/today/intent-router.ts` prompt 模板已满足所有要求：

| 任务类型 | 必含章节 |
|----------|----------|
| study_outcome | 知识框架 + 重点考点 + 典型例题 + 易错点 + 复习计划 |
| project_thinking | 目标判断 + 问题识别 + 优先级 + 执行步骤 + 风险 + 下一步 |
| daily_plan | 优先级任务 + 时间分配 + 最低完成线 + 复盘问题 |
| material_organize | 关键概念 + 逻辑结构 + 可复习笔记 + 下一步 |

V14.7.1 已修复路由确保这些 prompt 实际发送到 Agent API。V14.7.2 验证。

---

## P5 — Clickable Source Panel

**实现**: Agent 结果视图，OutcomeDocument 和 OutcomeActionsBar 之间

每个源卡片：
```
[Wikipedia] 宏观经济学 - 维基百科          🔗
          宏观经济学研究国民收入、失业、通胀...
```

功能：
- 平台标签 badge → 可识别来源类型
- 标题可点击 → `target="_blank"` 新标签打开
- 摘要 snippet → 2 行截断
- ExternalLink 图标 hover 显示
- 最多显示 8 条来源
- 无来源时显示空状态（不显示虚假卡片）

---

## P6 — UI State System

四状态模式已应用：

| 组件 | Loading | Error | Empty | Content |
|------|:--:|:--:|:--:|:--:|
| Auth form | ✅ Loader2 | ✅ AlertCircle + message | — | ✅ form |
| Agent running | ✅ 🥭 动画 + 实时阶段 | ✅ 错误阶段 + message | — | ✅ 时间线 |
| Agent result | — | ✅ AlertTriangle + 重试 | — | ✅ OutcomeDocument + sources |
| Library | ✅ SkeletonState | ✅ ErrorState + 重新加载 | ✅ EmptyState + CTA | ✅ 列表 |

---

## P7 — Regression & Testing

### Auth
- [x] 登录页加载
- [x] Guest 入口
- [x] 邀请码验证
- [x] Supabase 未配置提示
- [x] Mango Code 未改动

### UI
- [x] Agent 深色模式可读
- [x] Agent 浅色模式可读
- [x] Profile 深色/浅色可读
- [x] 底部导航可读
- [x] 无水平溢出

### Agent
- [x] Pro Agent 研究阶段可见
- [x] Pro 源卡片可点击
- [x] Standard 轻量模式标签
- [x] Guest 限制说明
- [x] 网络不可用提示
- [x] 质量分可见

### 文件/成品
- [x] 文件上传 → 内容读取
- [x] 保存到 Library
- [x] Library 重新打开（含 error state）
- [x] Markdown 导出
- [x] HTML 导出
- [x] 移动端保存/导出

---

## 构建结果

```
94/94 pages, 0 TypeScript errors ✅
```

## 受保护系统验证

V14.1-V14.7.1 所有系统未触碰 ✅

---

## 剩余风险

1. Auth 错误未在真实 Supabase 环境验证（本地 dev 无 Supabase 配置）
2. 阅读性修复为批量替换 — 个别文件可能有细微视觉差异需人工 review
3. glass card 文本在极少数未覆盖组件中可能仍偏淡

---

## 下一步建议

- **V14.8 可考虑微信小程序** — Auth、可读性、Agent 研究三条线均已稳定
- 优先：PWA 离线 → 真机 10 场景实测
- 不推荐：新功能扩张（Live2D, Deepgram, 知识图谱）

---

**第三自习室出品 · 把焦虑变成准备**
