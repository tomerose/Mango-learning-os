# 贡献指南

感谢你对 Mango Learning OS 的兴趣！欢迎提交 Issue 和 Pull Request。

## 💡 如何贡献

### 报告问题 (Issues)

发现 bug 或有功能建议？[创建 Issue](https://github.com/tomerose/Mango-learning-os/issues/new)：

- **Bug 报告**：描述复现步骤、预期行为、实际行为、环境（浏览器/设备）
- **功能建议**：说明使用场景、为什么需要、可能的实现方案

### 提交代码 (Pull Requests)

1. **Fork 仓库** → Clone 到本地
2. **创建分支**：`git checkout -b feature/你的功能名` 或 `fix/bug描述`
3. **本地开发**：
   ```bash
   npm install
   cp .env.local.example .env.local
   # 填入测试用的 Supabase + AI 凭证
   npm run dev
   ```
4. **确保通过检查**：
   ```bash
   npm run type-check  # TypeScript 无错误
   npm run build       # 生产构建成功
   ```
5. **提交**：
   ```bash
   git add .
   git commit -m "feat: 简短描述你的改动"
   # 或 "fix: 修复了xxx" / "docs: 更新文档" / "style: 代码格式"
   ```
6. **推送并创建 PR**：
   ```bash
   git push origin feature/你的功能名
   ```
   然后在 GitHub 上创建 Pull Request，描述：
   - 改动内容
   - 解决了什么问题或添加了什么功能
   - 截图/录屏（如果是 UI 改动）

## 📋 代码规范

- **TypeScript**: 严格模式，所有类型都要标注
- **组件**: 函数式组件 + hooks，Client Component 需加 `"use client"`
- **样式**: Tailwind CSS，遵循现有设计令牌（`app/globals.css`）
- **命名**: 
  - 组件文件：`kebab-case.tsx`
  - 组件名：`PascalCase`
  - 函数/变量：`camelCase`
  - 常量：`UPPER_SNAKE_CASE`
- **提交信息**: 
  - `feat:` 新功能
  - `fix:` Bug 修复
  - `docs:` 文档改动
  - `style:` 代码格式（不影响逻辑）
  - `refactor:` 重构
  - `test:` 测试
  - `chore:` 构建/工具链

## 🏗 项目结构

```
app/              # Next.js 15 App Router 页面
components/       # React 组件（ui/ 是 Shadcn 基础组件）
lib/              # 业务逻辑、工具函数、类型定义
  ├── ai/         # AI provider 抽象层
  ├── supabase/   # 数据层（client/server/middleware/queries/mappers）
  ├── types.ts    # 领域模型（单一真理源）
  └── store.tsx   # 全局状态（双模式：云端/游客）
docs/             # 产品/架构文档
```

## 🎯 优先级方向

当前最需要帮助的领域（按优先级）：

1. **移动端体验优化** — 手势操作、性能、PWA 离线
2. **知识图谱可视化** — D3.js / Cytoscape.js 实现笔记关系图
3. **Dashboard 真实统计** — 学科进度、周目标从真实数据派生
4. **AI 功能增强** — 错题本、学习路径推荐、多智能体协作
5. **国际化** — i18n 支持（英文/日文/韩文）

提 PR 前可以先开 Issue 讨论方案，避免重复劳动。

## 🤝 行为准则

- 尊重所有贡献者
- 建设性反馈，避免攻击性语言
- Issue/PR 用中文或英文，代码注释用英文

## ❓ 需要帮助？

- 加入讨论：[GitHub Discussions](https://github.com/tomerose/Mango-learning-os/discussions)
- 技术问题：开 Issue 标签 `question`
- 紧急 Bug：开 Issue 标签 `bug` + `priority: high`

感谢你让 Mango Learning OS 变得更好！🎓✨
