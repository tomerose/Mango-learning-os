# Vercel 部署指南（部署到公网，手机/平板可访问）

## 方式 1：一键部署（推荐，最快）

1. **访问你的 GitHub 仓库**：https://github.com/tomerose/Mango-learning-os

2. **点击 README 里的 Deploy with Vercel 按钮**（如果没有，直接访问）：
   https://vercel.com/new/clone?repository-url=https://github.com/tomerose/Mango-learning-os

3. **登录 Vercel**（用 GitHub 账号，免费）

4. **填写环境变量**（在部署页面）：
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://你的项目.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=你的_anon_key
   SUPABASE_SERVICE_ROLE_KEY=你的_service_role_key
   AI_API_KEY=sk-你的DeepSeek密钥
   AI_BASE_URL=https://api.deepseek.com
   AI_MODEL=deepseek-chat
   ```

5. **点击 Deploy** → 等 2 分钟 → 完成！

Vercel 会给你一个域名：`https://mango-learning-os-你的用户名.vercel.app`

---

## 方式 2：Vercel CLI（本地部署）

如果你想从本地命令行部署：

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录
vercel login

# 3. 进入项目目录
cd "D:\Claudecoda学习\AI-Learning-OS"

# 4. 部署（首次会引导配置）
vercel --prod

# 按提示操作：
# - Set up and deploy? Yes
# - Which scope? 选你的账号
# - Link to existing project? No (首次)
# - Project name? mango-learning-os
# - Directory? ./
# - Override settings? No
```

部署完成后，CLI 会显示你的域名。

---

## 添加环境变量（Vercel Dashboard）

部署后需要在 Vercel 控制台添加环境变量：

1. 访问 https://vercel.com/dashboard
2. 选择你的项目 → Settings → Environment Variables
3. 逐个添加：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `AI_API_KEY`
   - `AI_BASE_URL`
   - `AI_MODEL`
4. 勾选 **Production, Preview, Development** 三个环境
5. 点 Save
6. 回到 Deployments → 最新那个 → ⋯ → Redeploy

---

## 绑定自定义域名（可选）

Vercel 免费计划支持自定义域名：

1. Settings → Domains → Add
2. 输入你的域名（如 `mango.你的域名.com`）
3. 按 Vercel 提示到你的域名商（阿里云/腾讯云）添加 DNS 记录：
   - Type: `CNAME`
   - Name: `mango`（或 `@` 如果用根域名）
   - Value: `cname.vercel-dns.com`
4. 等几分钟 DNS 生效 → Vercel 自动配置 HTTPS

---

## 安全检查清单

部署前确认：

- ✅ `.env.local` 被 `.gitignore` 排除（不会推到 GitHub）
- ✅ Supabase RLS 策略已开启（7 张表全部）
- ✅ AI API Key 已设置（或留空用演示模式）
- ✅ 环境变量只在 Vercel Dashboard 配置（不要硬编码到代码）

---

## 部署成功后

**分享给朋友**：发你的 Vercel 域名，他们用手机/平板/电脑访问即可。

**手机添加到主屏幕**（PWA 体验）：
1. Safari（iOS）：分享 → 添加到主屏幕
2. Chrome（Android）：菜单 → 安装应用

**监控和日志**：
- Vercel Dashboard → 你的项目 → Deployments（查看部署日志）
- Analytics（免费流量统计）
- Logs（实时错误日志，调试用）

---

## 更新代码后重新部署

本地改完代码后：

```bash
git add .
git commit -m "你的改动描述"
git push
```

Vercel 会自动检测到 GitHub 推送 → 自动重新构建部署（约 2 分钟）。

---

**完成！现在你的朋友可以在任何设备上访问 Mango Learning OS 了。** 🎉
