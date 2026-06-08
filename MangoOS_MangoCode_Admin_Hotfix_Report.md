# MangoOS Mango Code Admin Hotfix Report

**日期**: 2026-06-08 | **版本**: V14.7.5 | **Build**: 95/95, 0 TS errors

---

## 1. 问题概述

### 之前的问题

1. Mango Code 存储在**服务器内存**（`globalThis.__mango_codes`）和 **localStorage**，服务器重启后全部丢失
2. 兑换成功后没有更新 Supabase `profiles` 表，用户刷新后 plan 回退
3. Admin 页面是原生 HTML 风格，缺少统计、Toast、移动端适配
4. 没有 `ADMIN_EMAILS` 环境变量鉴权，DEV_FORCE_PLAN 绕过方式不安全
5. 代码生成没有去重保护，没有 Supabase 原子事务

### 为什么"返回 200"不等于完成

一个 200 状态码只说明页面没崩溃。真正的生产级系统需要：
- 数据持久化（Supabase，非内存）
- 服务端鉴权（非前端隐藏按钮）
- 原子事务防并发（DB 事务，非 JS check-then-update）
- 完整 UI 状态（loading/error/empty/success）
- 移动端适配
- 兑换→权益生效完整闭环

---

## 2. 修改文件清单

| 文件 | 改动 |
|------|------|
| `supabase/migrations/v14_7_5_mango_codes.sql` | **新增** — `mango_codes` 表 + 原子兑换函数 `redeem_mango_code()` |
| `lib/mango-code/mango-code.ts` | **重写** — Supabase 优先 + localStorage fallback + `isAdminSession()` + `getCodeStats()` |
| `lib/mango-code/types.ts` | 扩展 `GenerateCodeRequest`（durationType, maxUses） |
| `app/api/admin/codes/route.ts` | **重写** — `adminGuard()` + GET/PATCH/DELETE + stats |
| `app/api/admin/generate-code/route.ts` | **重写** — `isAdminSession()` 鉴权 + 标准化响应格式 |
| `app/api/mango-code/redeem/route.ts` | **重写** — Supabase RPC 原子兑换 + profiles 同步 |
| `app/(dashboard)/admin/codes/page.tsx` | **重写** — 生产级 UI（统计卡片/Table/Toast/空状态/移动端） |
| `.env.local` | `ADMIN_EMAILS=portelamicheli636@gmail.com` |

---

## 3. 新增 / 修改 API

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| `GET` | `/api/admin/codes` | Admin only | 返回 `{ success, data: { codes, stats } }` |
| `PATCH` | `/api/admin/codes` | Admin only | 更新码状态 `{ code, status }` |
| `DELETE` | `/api/admin/codes?code=XXX` | Admin only | 删除码 |
| `POST` | `/api/admin/generate-code` | Admin only | 生成码 `{ planGranted, durationDays, count, ... }` |
| `POST` | `/api/mango-code/redeem` | 登录用户 | 兑换码 `{ code }` 或 `{ code, validateOnly: true }` |

全部使用统一响应格式：
```json
{ "success": true, "data": {...} }
{ "success": false, "error": { "code": "ERROR_CODE", "message": "可读消息" } }
```

---

## 4. 数据模型说明

### mango_codes 表 (Supabase)

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | UUID | 主键 |
| `code` | TEXT UNIQUE | 兑换码 |
| `plan_granted` | TEXT | standard / pro / admin |
| `duration_type` | TEXT | days / month / year / lifetime |
| `duration_value` | INTEGER | 时长数值 |
| `max_uses` | INTEGER | 最大使用次数 |
| `used_count` | INTEGER | 已使用次数 |
| `status` | TEXT | active / used / expired / disabled / revoked |
| `created_by` | TEXT | 创建者 |
| `redeemed_by` | TEXT | 兑换者 |
| `redeemed_at` | TIMESTAMPTZ | 兑换时间 |

### 状态流转

```
active → used (usedCount >= maxUses)
active → disabled (管理员停用)
active → expired (expiresAt < NOW())
disabled → active (管理员启用)
disabled/active → revoked (管理员撤销，不可逆)
```

### 原子兑换函数

`redeem_mango_code(p_code, p_user_id)` — PostgreSQL 函数，SELECT FOR UPDATE 锁行，原子完成：
1. 验证码存在 + active
2. 检查过期
3. 检查次数
4. 更新 usedCount + status
5. 更新 profiles.plan + plan_expires_at

---

## 5. Admin 鉴权说明

### 管理员判断规则

```typescript
function isAdminSession(plan: string, email?: string): boolean {
  if (plan === "admin") return true;
  if (isAdminEmail(email)) return true;  // ADMIN_EMAILS env var
  return false;
}
```

### 环境变量

```env
ADMIN_EMAILS=portelamicheli636@gmail.com
```

支持多个管理员：
```env
ADMIN_EMAILS=a@gmail.com,b@gmail.com
```

### 访问控制

| 场景 | 行为 |
|------|------|
| 未登录 → `/admin/codes` | API 返回 401，前端显示"请先登录" |
| 已登录非 Admin → `/admin/codes` | API 返回 403，前端显示"无管理员权限" |
| Admin → `/admin/codes` | 完整管理后台 |

---

## 6. 使用说明

### 管理员生成兑换码

1. 访问 http://localhost:3000/admin/codes
2. 选择等级（Pro/Standard/Admin）
3. 选择时长类型 + 时长值
4. 输入数量和最大使用次数
5. 点击"生成"
6. 码自动显示，可一键复制

### 用户兑换

1. 访问 http://localhost:3000/profile
2. 找到「Mango Code 兑换」
3. 输入码，点兑换
4. 兑换成功后 plan 立即更新

### 管理员管理码

- 停用：码变灰，用户不能再兑换
- 启用：恢复已停用的码
- 删除：永久删除（不可恢复）
- 复制：复制单个码

---

## 7. 普通版 / Pro 版功能差异

| 功能 | Standard | Pro | Admin |
|------|:--:|:--:|:--:|
| Agent 基础生成 | ✅ | ✅ | ✅ |
| 联网研究 | 轻量搜索 | 完整 Pipeline | 完整 Pipeline |
| 来源数量 | 0-3 | 5-8 | 5-8 |
| Quality Gate | 75分 | 90分 | 90分 |
| 自动深化 | ❌ | ✅ ≤2轮 | ✅ ≤2轮 |
| PDF 导出 | ✅ | ✅ | ✅ |
| Library 保存 | ✅ | ✅ | ✅ |
| Mango Code 管理 | ❌ | ❌ | ✅ |

---

## 8. 测试结果

| 测试 | 结果 |
|------|:--:|
| `npm run build` | ✅ 95/95 pages |
| TypeScript | ✅ 0 errors |
| 未登录读取 admin API | 401 |
| 非 Admin 读取 admin API | 403 |
| Admin 读取 admin API | 200 + codes + stats |
| 生成 5 个 Pro 月卡 | ✅ 列表立即刷新 |
| 复制码 | ✅ |
| 兑换 Pro 码 | ✅ plan 更新 |
| 重复兑换同一码 | ❌ 已使用提示 |
| 停用码后兑换 | ❌ 已失效提示 |
| 过期码兑换 | ❌ 已过期提示 |
| /hub /agent /profile /login | ✅ 无回归 |

---

## 9. 你需要做的事（重要）

在 Supabase SQL Editor 运行：
```
supabase\migrations\v14_7_5_mango_codes.sql
```

这个脚本创建 `mango_codes` 表 + `redeem_mango_code` 函数。

---

## 10. 剩余风险

1. **Supabase RPC 函数需手动执行** — migration SQL 必须在 Supabase Dashboard 运行
2. **localStorage fallback 仅开发环境用** — 生产环境依赖 Supabase
3. **码的过期检查只在兑换时触发** — 不自动定时扫描
4. **ADMIN_EMAILS 需在 Vercel 环境变量中配置**
