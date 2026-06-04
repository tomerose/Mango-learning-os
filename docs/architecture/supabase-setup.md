# Supabase 接入指南 — AI Learning OS

> 当前状态：客户端骨架已就位（`lib/supabase/client.ts` / `server.ts` / `middleware.ts`），
> 完整 schema 在 `docs/architecture/database-schema.sql`。数据层目前走 localStorage
> （`lib/store.tsx`）。接入 Supabase = 建项目 → 跑 schema → 填环境变量 → 建认证 UI →
> 把 store 的本地操作换成 Supabase 查询。下面是逐步操作。

---

## 步骤 1 — 创建 Supabase 项目

1. 打开 https://supabase.com → 注册/登录 → New Project
2. 记下：
   - Project URL（形如 `https://xxxx.supabase.co`）
   - `anon` public key（Settings → API → Project API keys → `anon` `public`）
   - `service_role` key（同页，**仅服务端用，绝不暴露到客户端**）

## 步骤 2 — 跑数据库 Schema

1. Supabase 控制台 → SQL Editor → New query
2. 把 `docs/architecture/database-schema.sql` 全文粘贴 → Run
3. 确认无报错。这会建好 16 张表 + RLS 策略 + 触发器 + 成就种子数据。
   - 关键：每张用户表都开了 Row-Level Security，策略是「只能读写 `auth.uid() = user_id` 的行」，
     用户之间数据天然隔离。
   - `profiles` 表有 `on_auth_user_created` 触发器：用户注册时自动建档。

## 步骤 3 — 填环境变量

编辑 `.env.local`（已在 `.gitignore`，不入库）：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<你的 anon key>
SUPABASE_SERVICE_ROLE_KEY=<你的 service_role key>
```

填好后 middleware 自动从 no-op 切到真实会话刷新（`lib/supabase/middleware.ts` 已写好这个判断）。

## 步骤 4 — 认证 UI（待建）

需要新建（目前没有）：
- `app/(auth)/login/page.tsx` — 邮箱密码登录
- `app/(auth)/signup/page.tsx` — 注册
- `app/auth/callback/route.ts` — OAuth/邮件确认回调（如启用）
- 在 `lib/supabase/middleware.ts` 加路由保护：未登录访问 `(dashboard)/*` → 重定向 `/login`

登录调用示例（客户端组件）：
```ts
import { createClient } from "@/lib/supabase/client";
const supabase = createClient();
const { error } = await supabase.auth.signInWithPassword({ email, password });
```

## 步骤 5 — 把数据层从 localStorage 换成 Supabase

这是最关键的一步。当前 `lib/store.tsx` 用 localStorage；`lib/mock-data.ts` 的 `getXxx()`
已经是 async 接口（当初就为这步留的）。两种迁移路径：

**路径 A（推荐，渐进）**：保留 store 的 React 接口，把内部实现换掉。
- `loadPersisted()` → 改成从 Supabase 查（`supabase.from('tasks').select()` 等）
- `toggleTask` / `addNote` / `reviewCard` 等动作 → 在 setState 后加一句 `supabase.from(...).upsert(...)`
- 好处：所有 UI 组件（`useStore()`）一行不用改。

**路径 B（彻底）**：用 Server Components 直接查 Supabase + Server Actions 做写入。
- `lib/mock-data.ts` 的 `getTasks()` 等换成 `await supabase.from('tasks').select()`
- 适合后期重构，MVP 阶段不必。

### 字段映射（camelCase ↔ snake_case）

TS 类型用 camelCase，DB 列用 snake_case，查询时映射一次：

| TS (`lib/types.ts`) | DB 列 | 备注 |
|---|---|---|
| `Flashcard.intervalDays` | `flashcards.interval_days` | SM-2 间隔 |
| `Flashcard.dueOn` | `flashcards.due_on` | `date` 类型 |
| `Flashcard.repetitions` | `flashcards.repetitions` | |
| `Flashcard.ease` | `flashcards.ease` | `numeric` |
| `Task.done` | `tasks.done` | |
| `Note.body` | `knowledge_notes.body` | |

建议在 `lib/supabase/` 下加 `mappers.ts` 集中做 row↔domain 转换，避免散落各处。

## 步骤 6 — 验证

```powershell
npm run dev
```
1. 注册一个账号 → 检查 Supabase 控制台 `profiles` 表是否自动出现一行
2. 建一条笔记 → 检查 `knowledge_notes` 表
3. 复习一张闪卡 → 检查 `flashcards` 行的 `interval_days` / `due_on` 是否按 SM-2 更新
4. 换设备/浏览器登录 → 数据应同步（localStorage 做不到这点，这是接 Supabase 的核心收益）

---

## 部署到生产（Vercel）

1. push 到 GitHub
2. Vercel → Import → 选仓库
3. Environment Variables 填入步骤 3 的三个变量
4. Supabase → Authentication → URL Configuration → 加上 Vercel 域名到 Redirect URLs
5. Deploy

---

## 安全检查清单

- [ ] `service_role` key 只在服务端用（Server Components / Route Handlers），**绝不**出现在 `NEXT_PUBLIC_*`
- [ ] 所有用户表 RLS 已开（schema 已处理，跑完 SQL 后在 Supabase → Authentication → Policies 复核）
- [ ] `.env.local` 在 `.gitignore`（已确认）
- [ ] 生产环境用 Supabase 内置的 email confirmation，防止垃圾注册
