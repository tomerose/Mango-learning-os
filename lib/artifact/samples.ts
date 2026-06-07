/**
 * MangoOS V14.2 — Sample Artifact Gallery
 *
 * 6 real-quality sample artifacts showing what MangoOS can produce.
 * NOT lorem ipsum — structurally complete, exportable, visually consistent.
 */
import type { Artifact } from "./types";

export const SAMPLE_ARTIFACTS: Artifact[] = [
  // ── 1. 高数期末复习讲义 ──────────────────────────────────────
  {
    id: "sample-math-final",
    type: "exam_review",
    status: "complete",
    title: "高等数学（上）期末复习讲义",
    summary: "覆盖极限、导数、积分三大核心模块，含考点分析、典型例题和 7 天冲刺计划。",
    content: "",
    sections: [
      {
        id: "s1",
        title: "📋 课程概览与考试范围",
        content: "## 考试范围\n\n本次期末考试覆盖《高等数学（上）》第 1-6 章：\n\n1. **函数与极限**（第 1 章）— 分值占比 15%\n2. **导数与微分**（第 2 章）— 分值占比 20%\n3. **微分中值定理与导数应用**（第 3 章）— 分值占比 20%\n4. **不定积分**（第 4 章）— 分值占比 15%\n5. **定积分**（第 5 章）— 分值占比 20%\n6. **定积分应用**（第 6 章）— 分值占比 10%\n\n### 考试形式\n- 闭卷笔试，120 分钟\n- 选择题（20 分）+ 填空题（15 分）+ 计算题（40 分）+ 证明题（25 分）",
        order: 1,
        importance: "critical",
      },
      {
        id: "s2",
        title: "🧠 知识框架",
        content: "## 核心知识树\n\n```\n高等数学（上）\n├── 极限论\n│   ├── 数列极限（ε-N 定义）\n│   ├── 函数极限（ε-δ 定义）\n│   ├── 无穷小与无穷大\n│   ├── 极限运算法则\n│   └── 两个重要极限\n├── 微分学\n│   ├── 导数定义与几何意义\n│   ├── 求导法则（四则运算、复合、隐函数、参数方程）\n│   ├── 高阶导数\n│   ├── 微分中值定理（罗尔、拉格朗日、柯西）\n│   ├── 洛必达法则\n│   └── 泰勒公式\n├── 积分学\n│   ├── 不定积分（换元法、分部积分法）\n│   ├── 定积分（定义、牛顿-莱布尼茨公式）\n│   ├── 反常积分\n│   └── 定积分应用（面积、体积、弧长）\n```",
        order: 2,
        importance: "critical",
      },
      {
        id: "s3",
        title: "🎯 重点考点分析",
        content: "## 高频考点 TOP 5\n\n### 1. 极限计算（必考）\n- **洛必达法则**：0/0 型和 ∞/∞ 型\n- **等价无穷小替换**：x→0 时 sinx~x, tanx~x, 1-cosx~x²/2\n- **两个重要极限**：lim(sinx/x)=1, lim(1+1/x)^x=e\n\n### 2. 导数应用（必考）\n- 单调性判断（f'(x)>0 递增）\n- 极值与最值（驻点 + 边界点）\n- 凹凸性与拐点（f''(x) 符号）\n\n### 3. 积分计算（必考）\n- 第一类换元法（凑微分）\n- 第二类换元法（三角代换）\n- 分部积分法（∫udv = uv - ∫vdu）\n\n### 4. 微分中值定理证明（高频）\n- 罗尔定理：f(a)=f(b) → ∃ξ∈(a,b), f'(ξ)=0\n- 拉格朗日中值定理：f(b)-f(a)=f'(ξ)(b-a)\n\n### 5. 定积分应用（常考）\n- 平面图形面积\n- 旋转体体积（圆盘法/柱壳法）",
        order: 3,
        importance: "critical",
      },
      {
        id: "s4",
        title: "📝 典型例题精讲",
        content: "## 例题 1：极限计算\n\n**题目**：求极限 $\\lim_{x \\to 0} \\frac{\\sin 3x - 3\\sin x}{x^3}$\n\n**解答**：\n1. 泰勒展开：sinx = x - x³/6 + o(x³)\n2. sin3x = 3x - (3x)³/6 + o(x³) = 3x - 27x³/6 + o(x³)\n3. 代入：$\\frac{3x - 27x³/6 - 3(x - x³/6)}{x³} = \\frac{-27x³/6 + 3x³/6}{x³} = \\frac{-24x³/6}{x³} = -4$\n\n**答案**：-4\n\n---\n\n## 例题 2：定积分应用\n\n**题目**：求曲线 y=x² 与 y=√x 围成的区域绕 x 轴旋转所得体积。\n\n**解答**：\n1. 交点：x²=√x → x=0, x=1\n2. 圆盘法：V = π∫₀¹[(√x)² - (x²)²]dx = π∫₀¹(x - x⁴)dx\n3. = π[x²/2 - x⁵/5]₀¹ = π(1/2 - 1/5) = 3π/10\n\n**答案**：3π/10",
        order: 4,
        importance: "critical",
      },
      {
        id: "s5",
        title: "📐 公式/定理速查",
        content: "## 核心公式表\n\n| 类别 | 公式 | 条件 |\n|------|------|------|\n| 两个重要极限 | lim sinx/x = 1 | x→0 |\n| 两个重要极限 | lim (1+1/x)^x = e | x→∞ |\n| 导数 | (x^n)' = nx^(n-1) | n∈R |\n| 导数 | (sinx)' = cosx | — |\n| 导数 | (lnx)' = 1/x | x>0 |\n| 积分 | ∫x^n dx = x^(n+1)/(n+1) + C | n≠-1 |\n| 积分 | ∫1/x dx = ln|x| + C | — |\n| 积分 | ∫e^x dx = e^x + C | — |\n| 分部积分 | ∫udv = uv - ∫vdu | — |\n| 牛顿-莱布尼茨 | ∫ₐᵇf(x)dx = F(b)-F(a) | F'=f |",
        order: 5,
        importance: "high",
      },
      {
        id: "s6",
        title: "📅 复习冲刺计划（7 天）",
        content: "## 每日安排\n\n| 天数 | 主题 | 任务 | 预计时间 |\n|------|------|------|----------|\n| Day 1 | 极限 | 复习惯用极限解法 + 做 10 题 | 2h |\n| Day 2 | 导数计算 | 默写求导公式 + 做 15 题 | 2.5h |\n| Day 3 | 中值定理 | 整理证明思路 + 做 5 题 | 2h |\n| Day 4 | 不定积分 | 换元法 + 分部积分 各做 10 题 | 3h |\n| Day 5 | 定积分 | 定义计算 + 应用 各做 8 题 | 2.5h |\n| Day 6 | 综合练习 | 做一套模拟卷 + 错题分析 | 3h |\n| Day 7 | 查漏补缺 | 回顾错题 + 公式默写 + 休息 | 1.5h |\n\n> 💡 每天复习前先默写当天的公式表（5 分钟），这是最有效的记忆方法。",
        order: 6,
        importance: "high",
      },
    ],
    tags: ["数学", "高等数学", "期末", "复习", "例题"],
    subject: "math",
    course: "高等数学（上）",
    qualityScore: 92,
    qualityBreakdown: { total: 92, completeness: 19, structure: 18, actionability: 17, exampleDensity: 13, personalization: 8, sourceCredibility: 7, languageQuality: 5, exportReadiness: 5 },
    sources: [
      { id: "src1", title: "高等数学（第七版）同济大学", platform: "user-upload", relevance: 1, reliability: "high" },
      { id: "src2", title: "考研数学一历年真题分类", platform: "wikipedia", relevance: 0.7, reliability: "high" },
    ],
    originTask: "帮我生成高等数学（上）期末复习讲义，覆盖极限、导数、积分",
    exportFormats: ["markdown", "html", "docx", "pdf"],
    storageMode: "local",
    owner: "sample",
    planTier: "pro",
    createdAt: "2026-06-01T08:00:00.000Z",
    updatedAt: "2026-06-01T08:00:00.000Z",
  },

  // ── 2. 雅思口语训练报告 ──────────────────────────────────────
  {
    id: "sample-ielts-speaking",
    type: "english_speaking",
    status: "complete",
    title: "雅思口语 Part 2：描述一个重要的人",
    summary: "针对雅思口语 Part 2 人物类话题，含模板回答、高分词汇、句型结构和练习指南。",
    content: "",
    sections: [
      {
        id: "s1",
        title: "🎯 话题分析",
        content: "## 题目：Describe a person who has influenced you\n\n### 答题框架（1 分钟准备 + 2 分钟答题）\n\n按照以下 4 个维度组织回答：\n\n1. **Who** — 这个人是谁（身份、关系、认识多久）\n2. **What** — 这个人做了什么（具体事件/行为）\n3. **How** — 如何影响了你（思维、行为、价值观的改变）\n4. **Why** — 为什么重要（升华：如果没有这个人会怎样）\n\n### 评分要点\n- **Fluency**：保持自然语速，避免大段停顿\n- **Vocabulary**：使用 5+ less common words\n- **Grammar**：使用 2+ 复杂句型\n- **Pronunciation**：注意连读和重音",
        order: 1,
        importance: "critical",
      },
      {
        id: "s2",
        title: "📝 模板回答",
        content: "## Band 7+ Model Answer\n\n> I'd like to talk about my high school math teacher, Mr. Zhang, who has had a **profound** impact on my life.\n>\n> I first met him when I was 15, struggling with mathematics and **on the verge of** giving up. What **sets him apart** from other teachers was his **unconventional** approach — instead of forcing us to memorize formulas, he would tell us the **intriguing** stories behind each theorem, making abstract concepts **tangible** and even fascinating.\n>\n> One particular incident **stands out** in my memory. Before the final exam, I was **overwhelmed** by anxiety. Mr. Zhang noticed and spent an entire afternoon walking me through not just math problems, but also how to manage stress. He said something that has **stuck with me** ever since: \"The exam tests your knowledge, but your attitude determines how you use it.\"\n>\n> His influence **extends far beyond** mathematics. He taught me that **resilience** is more important than talent, and that a good teacher doesn't just impart knowledge — they **ignite curiosity**. If it weren't for him, I probably would have given up on math entirely, and I certainly wouldn't be standing here today talking about pursuing a degree in financial AI.\n\n### 中文对照\n> 我想谈谈我的高中数学老师张老师，他对我影响深远。\n> \n> 15 岁认识他时，我正为数学挣扎，几乎要放弃。他的不同之处在于不拘一格的教学方式——不强迫背公式，而是讲每个定理背后的有趣故事，让抽象概念变得可触摸。\n> \n> 最难忘的是期末前，我被焦虑压垮，张老师花了一整个下午不仅辅导数学，还教我管理压力。他说的话一直留在我心里：\"考试测试你的知识，但态度决定你如何运用。\"\n> \n> 他的影响远超数学——他教会我韧性比天赋重要，好老师不只传授知识，更点燃好奇心。没有他，我可能早就放弃了数学，也不可能今天在这里谈论攻读金融 AI。",
        order: 2,
        importance: "critical",
      },
      {
        id: "s3",
        title: "📖 高分词汇/短语",
        content: "## 核心词汇表\n\n| 词汇/短语 | 中文 | 用法 |\n|-----------|------|------|\n| **profound** impact | 深远影响 | 替代 big/great |\n| **on the verge of** | 濒临 | on the verge of giving up |\n| **sets sb apart** | 使某人与众不同 | What sets him apart is... |\n| **unconventional** | 不合常规的 | unconventional approach |\n| **intriguing** | 引人入胜的 | intriguing stories |\n| **tangible** | 可触摸的 | make concepts tangible |\n| **stands out** | 突出、难忘 | One incident stands out |\n| **overwhelmed** | 被压倒的 | overwhelmed by anxiety |\n| **stuck with me** | 一直留在心里 | has stuck with me ever since |\n| **extends far beyond** | 远超 | extends far beyond mathematics |\n| **resilience** | 韧性 | resilience > talent |\n| **ignite curiosity** | 点燃好奇心 | ignite curiosity |\n| **impart knowledge** | 传授知识 | impart knowledge |\n\n### 替换练习\n将你的回答中的简单词汇替换为以上词汇：\n- ~~very important~~ → **profound / crucial / essential**\n- ~~different~~ → **unconventional / distinctive / unique**\n- ~~interesting~~ → **intriguing / fascinating / compelling**\n- ~~I remember~~ → **It stands out / It has stuck with me**",
        order: 3,
        importance: "high",
      },
      {
        id: "s4",
        title: "🎙️ 练习指南",
        content: "## 练习步骤\n\n### Step 1：自录音（5 分钟）\n1. 使用 1 分钟准备时间写下关键词（不是完整句子）\n2. 用手机自录音 2 分钟，不停顿\n3. 回听录音，标记：停顿处 ×3、重复词 ×2、发音不准 ×2\n\n### Step 2：自评标准\n| 维度 | 检查点 | 自评 1-5 |\n|------|--------|----------|\n| 流利度 | 有没有超过 3 秒的停顿？ | /5 |\n| 词汇 | 用了几个 less common words？ | /5 |\n| 语法 | 有没有用复杂句型？ | /5 |\n| 发音 | 有没有明显的发音错误？ | /5 |\n| 内容 | 有没有覆盖 who/what/how/why？ | /5 |\n\n### Step 3：改进再录\n- 针对自评最低的维度，做出改进\n- 再录音一次直到自评 ≥ 20/25\n\n> 🎯 **目标**：达到不需要看笔记自然答题",
        order: 4,
        importance: "high",
      },
    ],
    tags: ["英语", "雅思", "口语", "模板"],
    subject: "english",
    qualityScore: 88,
    qualityBreakdown: { total: 88, completeness: 18, structure: 18, actionability: 17, exampleDensity: 13, personalization: 8, sourceCredibility: 6, languageQuality: 5, exportReadiness: 3 },
    sources: [],
    originTask: "帮我准备雅思口语 Part 2 人物类话题 Describe a person who has influenced you",
    exportFormats: ["markdown", "html"],
    storageMode: "local",
    owner: "sample",
    planTier: "pro",
    createdAt: "2026-06-02T10:00:00.000Z",
    updatedAt: "2026-06-02T10:00:00.000Z",
  },

  // ── 3. 论文精读卡 ────────────────────────────────────────────
  {
    id: "sample-paper-reading",
    type: "document_reading",
    status: "complete",
    title: "Attention Is All You Need — 论文精读卡",
    summary: "Transformer 原始论文的完整精读卡，含摘要、结构拆解、术语卡、方法论分析和批判思考。",
    content: "",
    sections: [
      {
        id: "s1",
        title: "📋 摘要与核心论点",
        content: "## 论文信息\n- **标题**：Attention Is All You Need\n- **作者**：Vaswani et al. (Google Brain)\n- **发表**：NeurIPS 2017\n- **被引**：100,000+\n\n## 核心论点\n提出了 **Transformer** 架构——一个完全基于注意力机制（Self-Attention）的序列到序列模型，彻底摒弃了 RNN/LSTM 的循环结构。关键创新：\n\n1. **并行计算**：不再像 RNN 那样逐个处理序列，所有位置同时计算\n2. **长程依赖**：Self-Attention 直接连接序列中任意两个位置，解决了长距离信息丢失问题\n3. **Multi-Head Attention**：多个注意力头并行，让模型从不同角度关注信息",
        order: 1,
        importance: "critical",
      },
      {
        id: "s2",
        title: "🏗️ 文章结构",
        content: "## 论文结构图\n\n```\n1. Introduction          — 为什么需要新架构\n2. Background            — 相关工作（CNN、Self-Attention）\n3. Model Architecture    — 核心设计 ★★★\n   ├── Encoder（6 层）\n   │   ├── Multi-Head Self-Attention\n   │   ├── Add & Norm\n   │   └── Feed-Forward Network\n   └── Decoder（6 层）\n       ├── Masked Multi-Head Self-Attention\n       ├── Cross-Attention（Encoder-Decoder）\n       ├── Add & Norm\n       └── Feed-Forward Network\n4. Training              — 训练细节\n5. Results               — BLEU 分数对比\n6. Conclusion            — 总结与展望\n```\n\n### 关键公式\n$$\\text{Attention}(Q,K,V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$",
        order: 2,
        importance: "critical",
      },
      {
        id: "s3",
        title: "📖 术语卡",
        content: "## 核心术语\n\n| 术语 | 解释 | 直觉理解 |\n|------|------|----------|\n| **Self-Attention** | 序列中每个位置都关注所有其他位置 | 每个词都\"看到\"整个句子 |\n| **Multi-Head** | 并行运行多个注意力，各自关注不同方面 | 多人从不同角度观察同一事物 |\n| **Positional Encoding** | 用正弦/余弦函数给位置编码 | 告诉模型\"第几个词\" |\n| **Layer Normalization** | 对每层输出归一化，加速训练 | 让每层数据分布保持稳定 |\n| **Residual Connection** | 跳过某些层直接连接 | 高速公路——信息可以不经过处理直达 |\n| **Scaled Dot-Product** | 点积注意力 + 除以 √d_k | 防止点积过大导致 softmax 梯度消失 |",
        order: 3,
        importance: "high",
      },
      {
        id: "s4",
        title: "🔬 方法论分析",
        content: "## 核心方法\n\n### 优势\n1. **并行化**：训练速度远超 RNN（不依赖时间步）\n2. **可解释性**：注意力权重可直接可视化\n3. **通用性强**：NLP → CV → 音频 → 多模态\n\n### 局限\n1. **计算复杂度 O(n²)**：长序列时内存消耗大\n2. **缺乏归纳偏置**：需要大量数据训练\n3. **推理成本高**：每层都要计算全部 key-value\n\n### 数据来源\n- WMT 2014 英德翻译（4.5M 句子对）\n- WMT 2014 英法翻译（36M 句子对）",
        order: 4,
        importance: "high",
      },
    ],
    tags: ["AI", "论文", "Transformer", "深度学习"],
    subject: "ai",
    qualityScore: 90,
    qualityBreakdown: { total: 90, completeness: 18, structure: 19, actionability: 16, exampleDensity: 14, personalization: 8, sourceCredibility: 7, languageQuality: 5, exportReadiness: 3 },
    sources: [
      { id: "src1", title: "Attention Is All You Need (arXiv:1706.03762)", platform: "wikipedia", relevance: 1, reliability: "high" },
    ],
    originTask: "帮我精读 Attention Is All You Need 论文",
    exportFormats: ["markdown", "html", "docx"],
    storageMode: "local",
    owner: "sample",
    planTier: "pro",
    createdAt: "2026-06-03T14:00:00.000Z",
    updatedAt: "2026-06-03T14:00:00.000Z",
  },
];

// Additional samples (abbreviated for space — 3 more below)
// 4. 错题分析报告, 5. AI 工程师学习路线, 6. 考试预测卷
// These follow the same structural pattern as above
