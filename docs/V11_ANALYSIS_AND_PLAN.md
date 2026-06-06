# V11 — External Tools Analysis & MangoOS Enhancement Plan

## 1. Open-LLM-VTuber → 芒宝升级

| 维度 | 当前芒宝 | Open-LLM-VTuber |
|------|---------|-----------------|
| 动画 | CSS SVG 静态 | Live2D 表情映射 |
| 交互 | 点击打开面板 | 触摸反馈、拖动、点击穿透 |
| 语音 | 浏览器 TTS | 多引擎 TTS (Edge/Melo/GPTSoVITS) |
| 感知 | 无 | 摄像头+屏幕视觉感知 |
| 主动性 | 无 | 主动发起对话 |
| 离线 | 否 | 是（本地模型） |

**集成方案:** 将 Open-LLM-VTuber 的 Web 前端组件嵌入 MangoOS 作为芒宝 v2。
- 前端: Live2D Web 组件 + 表情映射
- 后端: Python 服务作为 API（已有 DeepSeek + Deepgram 可替代 ASR/TTS）
- 渐进式: 先接入表情系统，再接入视觉感知

## 2. PaddleOCR → 知识提取增强

**当前:** DocumentImporter 依赖 mammoth (仅 DOCX)
**增强:** PaddleOCR → 图片→文字 → 知识引擎提取概念

```
用户拍照/截图 → PaddleOCR 识别 → 送入 Content Engine → 自动生成笔记+闪卡
```

## 3. Motion Canvas → 动画系统升级

| 当前动画 | 升级为 |
|---------|--------|
| CSS keyframes | Motion Canvas 程序化动画 |
| Framer Motion transitions | 时间线驱动的知识网络动画 |
| 3D 球面知识网络 | 矢量 2D 知识树动画 |

**优势:** TypeScript 程序化控制、时间线编辑、web component 嵌入

## 4. Anthropics Knowledge Plugins → RAG 增强

**应用:** 替换当前简单的搜索丰富引擎，接入 Claude 的知识工作插件实现真正的 RAG。

## 5. Public APIs → 数据源扩展

| 用途 | API |
|------|-----|
| 英语学习 | Merriam-Webster / Oxford Dictionary API |
| 新闻 | NewsAPI / The Guardian API |
| 学术 | Open Library / Google Books |
| 翻译 | LibreTranslate |
| 数据 | NASA / World Bank |

## 实施优先级

| 优先级 | 项目 | 预计工时 |
|--------|------|---------|
| P0 | PaddleOCR 文档提取 | 1天 |
| P0 | Public APIs 数据源对接 | 1天 |
| P1 | 芒宝 Live2D 表情系统 | 2天 |
| P1 | Motion Canvas 知识动画 | 2天 |
| P2 | Anthropic Knowledge Plugin | 2天 |
