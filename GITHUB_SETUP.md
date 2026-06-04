# GitHub 仓库设置建议

让更多人发现你的项目，增加 Star 和贡献者。

## 🏷️ 添加 Topics 标签

在 GitHub 仓库页面右侧点击 ⚙️ 设置，添加这些 topics：

```
nextjs
react
typescript
supabase
ai
education
learning-platform
study-tool
flashcards
spaced-repetition
student
deepseek
tailwindcss
pwa
```

Topics 让你的项目出现在相关搜索和 Explore 页面。

## 📝 仓库描述 (About)

点击仓库页面右上角 ⚙️，填写：

**Description（描述）**：
```
AI 学习操作系统 - AI 导师、间隔重复闪卡、测验弱点分析、学习计划。为大学生打造，PWA/移动就绪。第三自习室出品。
```

**Website（网站）**：
如果你部署到 Vercel，填 https://你的域名.vercel.app

勾选：
- ✅ Releases（发布版本时自动显示）
- ✅ Packages（如果发布 npm 包）
- ✅ Discussions（启用社区讨论）

## 🎨 社交预览图 (Social Preview)

Settings → General → Social preview → Upload an image

建议尺寸：1280×640px，展示核心界面截图 + Logo。

没有设计？用 README 的功能表格截图 + 用 Canva 加个背景。

## 📌 固定仓库 (Pin Repository)

在你的 GitHub 个人主页，点击"Customize your pins"，把 Mango-learning-os 固定到前 6 个，增加曝光。

## 🚀 GitHub Actions（可选）

自动化 CI/CD：

创建 `.github/workflows/ci.yml`：
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run type-check
      - run: npm run build
```

每次推送/PR 自动跑类型检查和构建，防止破坏性改动进主分支。

## 🌟 徽章 (Badges)

在 README 顶部加徽章（可选，但很专业）：

```markdown
[![GitHub Stars](https://img.shields.io/github/stars/tomerose/Mango-learning-os?style=social)](https://github.com/tomerose/Mango-learning-os/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
```

## 📣 推广渠道

仓库设置好后，可以在这些地方分享：

1. **Reddit**: r/webdev, r/reactjs, r/nextjs, r/selfhosted
2. **Dev.to / Hashnode**: 写一篇"我做了xxx学习工具"
3. **Product Hunt**: 如果有在线 demo
4. **V2EX / 少数派**: 中文开发者社区
5. **微信公众号 / 小红书**: "大学生必备学习工具"角度

记得加上仓库链接和截图。

---

**完成这些设置后，你的仓库会更专业，更容易被发现和使用！**
