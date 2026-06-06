import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, BorderStyle, AlignmentType, WidthType, ShadingType } from "docx";
import fs from "fs";

const B = { style: BorderStyle.SINGLE, size: 1, color: "D5CFC6" };
function cell(t, o = {}) { return new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(t), size: 18, ...o })], spacing: { before: 30, after: 30 } })], borders: { top: B, bottom: B, left: B, right: B } }); }
function hcell(t) { return new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(t), size: 18, bold: true, color: "FFFFFF" })], spacing: { before: 30, after: 30 } })], borders: { top: B, bottom: B, left: B, right: B }, shading: { type: ShadingType.SOLID, color: "C58B74" } }); }
function h1(t) { return new Paragraph({ children: [new TextRun({ text: t, size: 32, bold: true, color: "C58B74" })], spacing: { before: 300, after: 160 }, heading: HeadingLevel.HEADING_1 }); }
function h2(t) { return new Paragraph({ children: [new TextRun({ text: t, size: 26, bold: true, color: "333333" })], spacing: { before: 240, after: 120 }, heading: HeadingLevel.HEADING_2 }); }
function h3(t) { return new Paragraph({ children: [new TextRun({ text: t, size: 22, bold: true, color: "555555" })], spacing: { before: 180, after: 100 }, heading: HeadingLevel.HEADING_3 }); }
function p(t) { return new Paragraph({ children: [new TextRun({ text: t, size: 20 })], spacing: { before: 60, after: 60 } }); }
function b(t) { return new Paragraph({ children: [new TextRun({ text: "  " + t, size: 20 })], spacing: { before: 30, after: 30 } }); }
function tbl(h, r) { return new Table({ rows: [new TableRow({ children: h.map(x => hcell(x)) }), ...r.map(row => new TableRow({ children: row.map(c => cell(c)) }))], width: { size: 100, type: WidthType.PERCENTAGE } }); }

const doc = new Document({
  sections: [{
    children: [
      new Paragraph({ children: [new TextRun({ text: "MangoLearningOS", size: 40, bold: true, color: "C58B74" })], spacing: { before: 200, after: 60 }, alignment: AlignmentType.CENTER }),
      new Paragraph({ children: [new TextRun({ text: "AI原生学习操作系统 — 产品功能与UI设计手册", size: 22, color: "888888" })], spacing: { after: 200 }, alignment: AlignmentType.CENTER }),
      new Paragraph({ children: [new TextRun({ text: "V6 Final | mangoleaningos.top | 2026-06-06", size: 18, color: "AAAAAA" })], spacing: { after: 300 }, alignment: AlignmentType.CENTER }),

      h1("一、产品定位"),
      p("MangoLearningOS 是 AI 原生的个人学习操作系统。设计理念：把焦虑变成准备。"),
      p("设计参考：Headspace / Calm / Readwise / Apple Journal / Linear"),
      p("技术栈：Next.js 15.5 + React 19 + Tailwind CSS 4 + Supabase + DeepSeek AI + Deepgram Voice"),

      h1("二、架构总览"),
      tbl(["窗口", "路由", "核心功能"], [
        ["Mangosum", "/hub", "Hero + 水彩光球 + 芒宝伴侣 + 今日学习 + 核心能力"],
        ["Mango Tutor", "/agent", "AI对话 + 学习身份(5人格) + DNA + 知识捕获"],
        ["Mangoing", "/exam", "3D知识森林 + 4层知识网络 + 笔记 + AI森林生成器"],
        ["Mango Plan", "/planner", "任务 + AI计划 + 考试备战 + SM-2 3D闪卡"],
        ["Mango Friend", "/grow", "情绪日记 + CBT认知重构 + AI陪伴"],
        ["Mango Voice", "/voice", "Deepgram STT → AI → TTS + 5人格 + 文字回退"],
      ]),

      h1("三、完整学习闭环"),
      p("Learn -> Capture -> Connect -> Practice -> Master -> Evolve"),
      b("Learn: Agent对话 / Voice语音 / 官方知识森林 / AI森林生成器"),
      b("Capture: 对话 -> 保存到知识库 -> 结构化笔记 + 自动标签 + 自动闪卡"),
      b("Connect: 3D球面知识森林(学科球->概念球->笔记面板) / 4层知识网络"),
      b("Practice: SM-2间隔重复 + 3D翻转闪卡(again/hard/good/easy)"),
      b("Master: 考试备战(上传 -> AI复习包 -> 模拟考 -> 弱项分析)"),
      b("Evolve: 技能树(学习/练习/复习/笔记) + XP等级 + 芒宝进度"),

      h1("四、Mango Voice 语音系统"),
      tbl(["功能", "技术", "平台"], [
        ["实时语音对话", "Deepgram WebSocket STT -> AI -> TTS", "Chrome/Edge"],
        ["文字回退", "输入框始终可见 -> /api/voice/chat", "全平台"],
        ["5种人格", "IELTS考官/韩语老师/AI导师/创业顾问/学术导师", "全平台"],
        ["对话保存", "保存对话到知识库 -> 结构化笔记", "全平台"],
        ["平台无关架构", "/api/voice/deepgram 端点", "Web/Desktop/Mobile"],
      ]),

      h1("五、芒宝 AI 伴侣"),
      tbl(["特性", "实现"], [
        ["动画", "纯CSS SVG + Framer Motion — 浮动/眨眼/微笑/树叶 — 零依赖全平台"],
        ["位置", "右下角全局浮动 — 桌面72px/手机56px — 可拖拽"],
        ["语音气泡", "毛玻璃气泡 — 5秒隐藏 — 8秒轮换5条问候语"],
        ["交互面板", "点击展开 — streak/XP/等级/快捷操作"],
        ["等级", "Lv1幼年->Lv10探索->Lv30学者->Lv50智慧->Lv100芒果贤者"],
      ]),

      h1("六、知识森林系统"),
      tbl(["功能", "说明"], [
        ["3D球面网络", "学科大球 -> 概念小球 -> 笔记面板 — 鼠标拖动旋转"],
        ["AI森林生成器", "输入目标 -> AI自动生成知识体系(主题+资源+笔记+闪卡+路径)"],
        ["官方森林", "IELTS 7.5+ / TOEFL 100+ / AI工程师 / CFA Level 1"],
        ["资源发现", "Arxiv/GitHub/YouTube/Coursera — 自动匹配"],
      ]),

      h1("七、设计系统"),
      h2("色彩"),
      tbl(["用途", "色值"], [
        ["背景", "oklch(0.978 0.005 60) 暖纸白"],
        ["主色", "oklch(0.58 0.16 75) 芒果琥珀"],
        ["辅色", "oklch(0.85 0.04 140) 鼠尾草绿"],
        ["文字", "oklch(0.25 0.03 140) 深森林石板"],
      ]),
      h2("排版"),
      tbl(["层级", "字体", "字号"], [
        ["Display", "Cormorant Garamond (衬线)", "clamp(2rem, 5vw, 3.5rem)"],
        ["Title", "Cormorant Garamond", "clamp(1.5rem, 3.5vw, 2.125rem)"],
        ["Body", "Inter (无衬线)", "0.9375rem"],
        ["Caption", "Inter", "0.75rem"],
      ]),
      h2("6层表面"),
      tbl(["层级", "用途"], [
        ["card-paper", "基础画布"],
        ["card-card", "普通卡片"],
        ["card-floating", "浮动卡片(阴影)"],
        ["card-glass", "毛玻璃(blur)"],
        ["card-focus", "焦点(主色边框)"],
        ["card-hero", "Hero(最大阴影)"],
      ]),

      h1("八、React Native 移动端计划"),
      p("Expo SDK 52 + Reanimated 3 + expo-router + Deepgram SDK + Lottie"),
      tbl(["阶段", "内容"], [
        ["1", "Expo初始化 + 设计token迁移 + 导航框架"],
        ["2", "Hub + 芒宝Lottie + 水彩背景"],
        ["3", "Voice OS + Deepgram SDK集成"],
        ["4", "知识森林 + Skia 3D渲染 + 手势"],
        ["5", "打磨: haptics + 字体 + 60fps"],
      ]),
      p("预计2-3周完成。"),
    ],
  }],
});

const buf = await Packer.toBuffer(doc);
const out = "D:/Claudecoda学习/AI-Learning-OS/docs/MangoLearningOS_产品手册.docx";
fs.writeFileSync(out, buf);
console.log("Generated: " + out + " (" + (buf.length / 1024).toFixed(0) + " KB)");
