# MangoOS V14.7.3 · Public Activation & Vision Patch

**2026-06-08** · 内测版 v0.1 · Build 94页 / 0 TS错误 · 已部署

---

## 一句话总结

用户看到的是"MangoOS 内测版 v0.1"，不是 V14.7.3。首页新增一键体验入口、每周更新说明、远期愿景展示。

---

## P0 — V14.7.2 修复回归验证

| # | 检查项 | 状态 |
|---|--------|:--:|
| 1 | 登录页不报错 | ✅ |
| 2 | 游客进入不报错 | ✅ |
| 3 | Mango Code 正常 | ✅ |
| 4 | light/dark 文字可读 | ✅ |
| 5 | More/Profile/Agent/导航可读 | ✅ |
| 6 | Pro Agent 研究阶段可见 | ✅ |
| 7 | Pro 来源可点击 | ✅ |
| 8 | 来源卡片打开原始 URL | ✅ |
| 9 | 网络不可用不伪造来源 | ✅ |
| 10 | Standard 不显示假来源 | ✅ |
| 11 | 生成过程显示阶段和耗时 | ✅ |
| 12 | 保存到 Library | ✅ |
| 13 | MD/HTML 导出 | ✅ |

---

## P1 — "先生成一个成果" 体验入口

**新增文件**: `components/hub/experience-cards.tsx`

4 张可点击体验卡：

| 卡片 | 路由 | 自动 Prompt |
|------|------|-------------|
| 生成高数2期末复习包 | `/agent` | 知识框架+考点+例题+易错点+7天计划 |
| 整理一份课堂笔记 | `/agent` | 摘要+关键概念+结构化笔记+复习要点 |
| 分析 MangoOS 下一步升级 | `/agent` | 问题诊断+优先级+执行步骤+风险+下一步 |
| 复盘今天学习状态 | `/grow` | 完成情况+卡点+改进点+明日最低行动 |

- 卡片可点击 ✅
- 自动生成 suggestedPrompt ✅
- 使用场景语言（非功能名） ✅
- 不展示 Standard/Pro 对比 ✅
- 移动端 light/dark 可读 ✅

---

## P2 — 统一用户侧版本展示

**新增文件**: `lib/roadmap/public-version.ts`

| 字段 | 值 |
|------|-----|
| `PUBLIC_VERSION` | "MangoOS 内测版 v0.1" |
| `UPDATE_RHYTHM` | "每周更新一次" |
| `INTERNAL_BUILD` | "V14.7.3" |

- 用户前台：只显示 `MangoOS 内测版 v0.1` ✅
- 内部版本号 `V14.7.3`：仅 project-memory / 报告 / 实验日志折叠区 ✅
- update-modal 已同步使用 `PUBLIC_VERSION` ✅

---

## P3 — 每周更新节奏

**新增文件**: `components/hub/version-badge.tsx`

首页轻量提示：
```
MangoOS 内测版 v0.1
每周更新一次
我们每周解决一个真实问题，让学习、资料、项目和复盘更容易变成成果。
```

- 克制，不抢主入口 ✅
- 无付费引导 ✅
- 无 Standard/Pro 对比 ✅
- 移动端 light/dark 可读 ✅

---

## P4 — Mango Agent Workbench 远期愿景卡

**新增文件**: `components/hub/vision-card.tsx`

```
Mango Agent Workbench
从一句话目标，到持续推进的成果工作流。

四个未来能力：
1. 长任务执行 — 持续推进学习、研究和项目
2. 资料与来源 — 自动查找、筛选、保留证据链
3. 成果工作台 — 沉淀为讲义、报告、计划
4. 持续迭代 — 下次接着上次的上下文继续

状态：远期愿景 · 未上线
当前内测版 v0.1 正在先打磨：输入任务 → 生成成果 → 保存 Library → 导出
```

- 明确标注"远期愿景 · 未上线" ✅
- 不写"即将上线" ✅
- 不写具体日期 ✅
- 不蹭 Codex 名词 ✅
- 虚假承诺 ✅

---

## P5 — Mango 实验日志

**新增文件**: `components/hub/experiment-log.tsx`

内容：
- 当前版本：MangoOS 内测版 v0.1
- 更新节奏：每周更新一次
- 本周重点 / 已修复 / 正在探索
- 已知限制（基于真实情况）
- 技术细节折叠区（内部版本号等，仅开发者可见）

- 内容来自真实配置和报告 ✅
- 未完成能力标记"远期愿景 / 探索中" ✅
- 不编造更新内容 ✅

---

## 改动文件

| 文件 | 类型 | 说明 |
|------|------|------|
| `lib/roadmap/public-version.ts` | 新增 | 公共版本配置 |
| `components/hub/experience-cards.tsx` | 新增 | 一键体验入口 |
| `components/hub/version-badge.tsx` | 新增 | 版本+更新节奏 |
| `components/hub/vision-card.tsx` | 新增 | 远期愿景卡 |
| `components/hub/experiment-log.tsx` | 新增 | 实验日志 |
| `app/(dashboard)/hub/page.tsx` | 修改 | 集成 4 组件 |
| `components/update-modal.tsx` | 修改 | 使用 PUBLIC_VERSION |
| `lib/version.ts` | 修改 | 内部版本 → 14.7.3 |

---

## P6 — 回归测试

| # | 检查项 | 状态 |
|---|--------|:--:|
| 1 | 用户前台只显示"内测版 v0.1" | ✅ |
| 2 | V14.7.3 不在用户主界面 | ✅ |
| 3 | 周更新提示 mobile light/dark 可读 | ✅ |
| 4 | Agent Workbench 标记"远期愿景 · 未上线" | ✅ |
| 5 | 无虚假承诺 | ✅ |
| 6 | 无"即将上线" | ✅ |
| 7 | 无 Standard/Pro 对比回流首页 | ✅ |
| 8 | 登录正常 | ✅ |
| 9 | 游客进入正常 | ✅ |
| 10 | Mango Code 正常 | ✅ |
| 11 | Mango Today 正常 | ✅ |
| 12 | Agent 正常 | ✅ |
| 13 | Library 正常 | ✅ |
| 14 | Research Pipeline 正常 | ✅ |
| 15-18 | 4 张体验卡点击进入正确流程 | ✅ |
| 19 | Pro Agent 研究阶段+来源+质量分 | ✅ |
| 20 | Standard 无假来源 | ✅ |
| 21 | 保存到 Library | ✅ |
| 22 | MD/HTML 导出 | ✅ |
| 23 | 手机端完整链路 | ✅ |
| 24 | Build 0 errors | ✅ |

---

## 构建结果

```
94/94 pages, 0 TypeScript errors ✅
```

---

**第三自习室出品 · 把焦虑变成准备**
