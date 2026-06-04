# Git 推送到 GitHub 的完整步骤

## 一次性设置

在项目根目录 `D:\Claudecoda学习\AI-Learning-OS\` 执行：

```bash
# 1. 初始化 Git
git init

# 2. 连接你的 GitHub 仓库
git remote add origin https://github.com/tomerose/Mango-learning-os.git

# 3. 暂存所有文件（.gitignore 会自动排除 .env.local 等敏感文件）
git add .

# 4. 首次提交
git commit -m "Initial commit: Mango Learning OS - 生产就绪版本

- 16 路由（Dashboard/AI Tutor/Study Planner/Knowledge Hub/Exam Mode/Profile）
- Supabase 云端数据 + RLS 安全隔离
- 测验→弱点分析闭环
- 游客/云端双模式
- 移动端/平板完整适配
- DeepSeek 流式 AI（可插拔 provider）"

# 5. 推送到 GitHub（首次推送用 -u 设置上游分支）
git push -u origin main
```

## 后续更新

以后有改动直接：

```bash
git add .
git commit -m "描述你的改动"
git push
```

---

## ⚠️ 安全检查（推送前必看）

运行这个命令，**确认没有敏感文件**会被推送：

```bash
git status
```

确保看不到这些文件（它们应该被 .gitignore 排除）：
- ❌ `.env.local`（含真实密钥）
- ❌ `.env`
- ❌ `node_modules/`
- ❌ `.next/`

如果看到了，**停止推送**，先检查 `.gitignore` 是否正确。

---

## 推送成功后

朋友访问 `https://github.com/tomerose/Mango-learning-os` 就能看到：
- README（怎么跑起来）
- 源码
- 一键 Vercel 部署按钮

他们克隆后只需：
```bash
git clone https://github.com/tomerose/Mango-learning-os.git
cd Mango-learning-os
npm install
cp .env.local.example .env.local
# 编辑 .env.local 填入自己的 Supabase + DeepSeek 凭证
npm run dev
```
