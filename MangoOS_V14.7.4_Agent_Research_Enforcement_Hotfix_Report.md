# MangoOS V14.7.4 · Agent Research Enforcement & Mobile Readability Hotfix

**2026-06-08** · 内测版 v0.1 · Build 94/94, 0 TS errors ✅

---

## 1. 为什么 V14.7.3 报告显示通过但真机仍失败

V14.7.3 只验证了"Pro Agent 显示了研究阶段 UI 和来源卡片"，但没有验证：
- **后端是否真的进入了 Research Pipeline**
- **网络搜索是否真的被执行**
- **用户测试账号是否被识别为 Pro**

代码审查通过 ≠ 真实运行通过。

---

## 2. Agent 未真实研究/未显示来源的根因

经过逐文件排查，锁定 **5 个根因**：

### 根因 1：`resolveSession()` 将所有未认证用户视为 Guest
- 文件：`lib/auth/session.ts:27`
- `isSupabaseConfigured()` → false → `plan: "guest"`
- `getUser()` → null → `plan: "guest"`
- **Supabase 未配置时，所有用户都是 Guest，isPro 永远为 false**

### 根因 2：API route 中 Standard 用户完全不走搜索
- 文件：`app/api/agent/execute/route.ts:206-241`（旧代码）
- Standard 路径直接调用 `generateArtifact()` 无任何搜索
- `generalArtifactGenerator()` 用 `completeChat()` 直接生成，无 sources

### 根因 3：`source-adapter.ts` DuckDuckGo API 对中文查询几乎无返回
- 文件：`lib/outcome/source-adapter.ts`
- DuckDuckGo Instant Answer API (`api.duckduckgo.com`) 对中文搜索不返回 `AbstractText`
- 只有 Wikipedia API 对中文有较好支持

### 根因 4：前端 plan 从 localStorage 读默认 "standard"，后端从 session 返 "guest"
- 前端：`localStorage.getItem("mango-user-plan") || "standard"`
- 后端：`resolveSession()` → `plan: "guest"`
- **前后端 plan 不一致，用户看到 "Standard" 标签但实际被当 Guest 处理**

### 根因 5：Guest 模式可能走 mock 响应
- `lib/ai/client.ts` 有 `mockStream()` 和 `mockCompletion()` 当 API key 未配置时返回演示内容
- Guest 用户无 AI_API_KEY → 浅层演示内容

---

## 3. 修改文件列表

| 文件 | 改动 |
|------|------|
| `app/api/agent/execute/route.ts` | **核心修复** — Standard 路径加入轻量搜索；Guest 路径明确分离 |
| `app/(dashboard)/agent/page.tsx` | Standard 来源卡片展示；来源逻辑修复 |
| `components/layout/mobile-nav-v2.tsx` | More 抽屉可读性：底部导航 42→65 对比度，抽屉文字修复，`opacity-60` 移除 |
| `components/agent/outcome-document.tsx` | 正文 `text-white/55`→`text-white/80`，强制 `font-sans` |
| `lib/version.ts` | 内部版本 → 14.7.4 |

---

## 4. Research Pipeline 强制逻辑说明

**新的三层路由**：

| 用户层级 | 搜索 | 来源数 | 生成方式 |
|----------|------|--------|----------|
| **Pro** | 完整 Research Pipeline（7 阶段） | 5-8 条 | 研究增强 prompt + 质量门 |
| **Standard** | 轻量搜索（Wikipedia + DuckDuckGo，2 查询） | 0-3 条 | 搜索增强 prompt |
| **Guest** | 无搜索 | 0 | 本地演示 / AI 直接生成 |

**Standard 新逻辑**：
```
1. 拆解搜索方向（2 个查询词）
2. 调用 Wikipedia + DuckDuckGo
3. 如有结果 → 注入 prompt → AI 生成
4. 如无结果 → 标注 "本次搜索未获得可用来源"
5. 返回 sources 数组 → 前端渲染可点击来源卡片
```

---

## 5. Run Log 阶段反馈

运行视图（`view === "running"`）已实时显示 timeline 事件：
- ✅ 阶段名 + 状态图标（spinner/check/alert）
- ✅ 阶段说明文字
- ✅ 工具名 badge
- ✅ 已收集来源数量
- ✅ Guest 模式警告

---

## 6. Sources Panel 可点击来源验证

- Pro 模式：来源卡片显示 `Pro Research` 翡翠绿标签
- Standard 模式：来源卡片显示 `Standard 搜索` 灰色标签
- 每条来源：平台标签 + 可点击标题 → `target="_blank"` + snippet + ExternalLink
- 无来源时：Pro 无来源 = 警告；Standard 无来源 = 说明
- 网络不可用时：琥珀色 `networkAvailable:false` 提示

---

## 7. 内容质量提升

- Standard 用户：搜索到的资料注入 AI prompt → 内容基于真实搜索结果
- Pro 用户：完整 evidence map + source ranking → 深度内容
- AI prompt 要求最低 1500 中文字 + 结构化章节
- 质量评分始终可见（OutcomeDocument 质量 badge）

---

## 8. More drawer / Agent 可读性修复

| 位置 | Before | After |
|------|--------|-------|
| 底部导航非激活文字 | `text-white/42` | `text-white/65` |
| More 按钮文字 | `text-white/42` | `text-white/65` |
| 抽屉标题 | "More modules" | "更多模块" |
| 抽屉 secondary 项 | `text-muted-foreground/50` | `text-fg-muted/90` |
| 抽屉 Beta 项 | `opacity-60` | 正常对比度 + `text-fg-muted/90` |
| 抽屉分隔线 | `border-border/30` | `border-border/50` |
| OutcomeDocument 正文 | `text-white/55` | `text-white/80` |
| OutcomeDocument 标题 | `text-white/80` | `text-white/90` |
| OutcomeDocument 字体 | 未指定 | `font-sans`（禁止手写体） |

---

## 9. Pro / Standard / Guest 三种模式测试

| 测试 | Pro | Standard | Guest |
|------|:--:|:--:|:--:|
| 联网搜索 | ✅ 7阶段 pipeline | ✅ 轻量 2查询 | ❌ 无 |
| 来源显示 | ✅ 3-8条可点击 | ✅ 0-3条可点击 | ❌ 无 |
| 模式标签 | Pro Research | Standard 搜索 | 游客演示 |
| 无网络处理 | networkAvailable:false | networkAvailable:false | 本地演示 |
| 假来源 | 无 | 无 | 无 |

---

## 10. 网络不可用测试

- `collectSources()` 超时/异常 → `networkAvailable: false`
- 前端显示琥珀色警告
- 不生成虚假来源

---

## 11. Library 保存与导出

- 保存含 parsed sections ✅
- 导出 Markdown 含完整内容 ✅
- 导出 HTML 含 markdown→HTML 转换 ✅

---

## 12. Build 结果

```
94/94 pages, 0 TypeScript errors ✅
```

---

## 13. 剩余风险

1. **Supabase 未配置时所有用户为 Guest** — 需要配置 `NEXT_PUBLIC_SUPABASE_URL` + `ANON_KEY` 才能真正测试 Pro/Standard
2. **DuckDuckGo API 中文返回少** — 需要添加中文搜索源（Baidu、Bing API）
3. **Standard 搜索仅 2 查询** — 对复杂主题可能不足
4. **真机截图需在配置了 API Key 的环境执行**

---

**第三自习室出品 · 把焦虑变成准备**
