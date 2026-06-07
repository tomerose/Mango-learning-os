# MangoOS Supabase 配置完整指南

> **目标**: 让 MangoOS 从纯游客模式变为完整云端模式，支持账号注册/登录、Pro/Admin 等级、RLS 数据隔离。

---

## 一、为什么需要 Supabase

当前 MangoOS 在**没有 Supabase** 时：
- 所有用户都是 Guest（游客模式）
- AI Agent 使用本地演示，不走 Research Pipeline
- 数据存在 localStorage，换设备就丢失
- Pro/Admin 无法识别 → Quality Gate 90 无法生效

配置 Supabase 后：
- 用户可注册/登录账号
- Pro/Admin 等级可识别 → Agent 走真实 Research Pipeline
- 数据云端同步 + RLS 物理隔离
- Quality Gate 90 强制执行

---

## 二、Step 1: 创建 Supabase 项目

1. 打开 https://supabase.com
2. 点击 "Start your project"（用 GitHub 登录）
3. 点击 "New project"
4. 填写：
   - **Name**: `mango-learning-os`（或任意名称）
   - **Database Password**: 生成一个强密码，**记下来**
   - **Region**: 选离用户最近的（亚洲选 Singapore 或 Tokyo）
   - **Pricing Plan**: Free（免费层完全够用）
5. 点击 "Create project"，等待 2-5 分钟

---

## 三、Step 2: 获取 API Keys

1. 项目创建完成后，左侧菜单 → **Settings** → **API**
2. 复制以下两个值：

| 需要的值 | Supabase 中的名称 | 用途 |
|----------|-------------------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | **Project URL** | 格式: `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **anon public key** | 以 `eyJ...` 开头的长字符串 |

3. **重要**: 不要复制 `service_role` key 到前端！那个有全部权限。

---

## 四、Step 3: 配置环境变量

在项目根目录 `D:\Claudecoda学习\AI-Learning-OS\` 找到 `.env.local` 文件。

如果没有，复制模板：
```bash
copy .env.local.example .env.local
```

编辑 `.env.local`，填入：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://你的项目ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.你的anonkey...

# AI Provider（DeepSeek）
AI_API_KEY=sk-你的DeepSeek密钥
AI_BASE_URL=https://api.deepseek.com
AI_MODEL=deepseek-chat
```

保存文件。

---

## 五、Step 4: 创建数据库表

在 Supabase 控制台：

1. 左侧菜单 → **SQL Editor**
2. 点击 "New query"
3. 复制以下 SQL 并执行：

### 4.1 核心用户表

```sql
-- 用户 profiles 表
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT DEFAULT 'Learner',
  email TEXT,
  plan TEXT DEFAULT 'standard' CHECK (plan IN ('guest', 'standard', 'pro', 'admin')),
  plan_expires_at TIMESTAMPTZ,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: 用户只能读自己的 profile
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 新用户注册时自动创建 profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, plan)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'Learner'),
    'standard'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 触发器
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 4.2 Agent 任务历史表（可选）

```sql
CREATE TABLE IF NOT EXISTS public.agent_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  intent TEXT NOT NULL,
  task_type TEXT,
  quality_score INTEGER DEFAULT 0,
  sources_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.agent_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own tasks"
  ON public.agent_tasks FOR ALL
  USING (auth.uid() = user_id);
```

### 4.3 Artifacts 表（可选）

```sql
CREATE TABLE IF NOT EXISTS public.artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  task_type TEXT,
  quality_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own artifacts"
  ON public.artifacts FOR ALL
  USING (auth.uid() = user_id);
```

点击 "Run" 执行。

---

## 六、Step 5: 配置认证

1. 左侧菜单 → **Authentication** → **Providers**
2. 确认 **Email** provider 已启用
3. 可选：启用 Google / GitHub OAuth（需要额外配置）
4. 向下滚动到 **Email Auth** 部分：
   - **Confirm email**: 如果你想用户注册后立即能用，改为 **Disabled**
   - 否则保持 Enabled（用户会收到确认邮件）

---

## 七、Step 6: 给自己设为 Admin

在 SQL Editor 执行：

```sql
-- 先找到你的用户 ID（注册后）
SELECT id, email FROM auth.users;

-- 把这个用户设为 admin
UPDATE public.profiles
SET plan = 'admin', is_admin = true
WHERE id = '你的用户UUID';
```

---

## 八、Step 7: 验证配置

重启 dev server：
```bash
npm run dev
```

打开 http://localhost:3000/login：
- 如果看到登录表单（非"云端功能未配置"提示）→ Supabase 已连接 ✅
- 注册一个账号 → 登录 → 应该进入 /hub
- 打开 Agent → 如果 `plan = admin` → 应该走 Pro Research Pipeline

### 验证 Pro 模式

在浏览器 Console：
```js
localStorage.getItem("mango-user-plan")  // 应该返回 "pro" 或 "admin"
```

在 SQL Editor 查询：
```sql
SELECT plan FROM public.profiles WHERE id = '你的用户ID';
```

如果返回 `admin` → Agent API 会走完整 Research Pipeline + Quality Gate 90。

---

## 九、开发调试

如果生产环境未配置 Supabase 但仍想测试 Pro 模式：

```bash
# 设置环境变量（仅开发环境生效）
set DEV_FORCE_PLAN=pro
npm run dev
```

Agent 页面左上角会显示 "开发调试模式" 标签。

---

## 十、常见问题

### Q: 登录报错 "Invalid login credentials"
**A**: 检查邮箱和密码是否正确。如果刚注册，确认 Email Confirmation 是否已关闭。

### Q: 登录后还是 Guest
**A**: 检查 `localStorage.getItem("mango-user-plan")`。如果为空，说明 `profiles` 表没有自动创建记录。检查 Step 4 的触发器是否执行成功。

### Q: Agent 还是没有 Pro Research
**A**: 三个条件缺一不可：
1. Supabase 已配置（`.env.local` 有 URL + ANON_KEY）
2. 用户已登录（不是 Guest）
3. `profiles.plan = 'pro'` 或 `'admin'`

检查 SQL：
```sql
SELECT id, email, plan, is_admin FROM public.profiles;
```

### Q: RLS 策略阻止了数据读写
**A**: 检查 RLS 策略是否正确创建。在 SQL Editor 执行：
```sql
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

---

## 十一、费用

Supabase Free 层包含：
- 500MB 数据库
- 50,000 月活用户
- 2GB 存储
- 2 个项目

对个人/小团队完全够用。不需要付费。

---

配置完成后，MangoOS 将从"游客演示"变为完整的"Pro 学习操作系统"。
