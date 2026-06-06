// ═══════════════════════════════════════════════════════════════
// AI Knowledge Forest Generator v2
// Rich official forests with multi-source content
// Enrichment pipeline: Wikipedia + GitHub + web search → AI synthesis
// ═══════════════════════════════════════════════════════════════

import { completeChat, extractJson } from "@/lib/ai/client";

export interface ForestTopic {
  name: string;
  type: "concept" | "skill" | "book" | "paper" | "topic" | "formula" | "project";
  summary: string;
  children: string[];
}

export interface ForestResource {
  title: string;
  type: "book" | "course" | "video" | "paper" | "website" | "project";
  url?: string;
  description: string;
  forTopic: string;
}

export interface ForestNote {
  title: string;
  topic: string;
  body: string;
  tags: string[];
}

export interface ForestPath {
  phase: string;
  duration: string;
  tasks: string[];
  topics: string[];
}

export interface KnowledgeForest {
  title: string;
  description: string;
  topics: ForestTopic[];
  resources: ForestResource[];
  notes: ForestNote[];
  learningPath: ForestPath[];
  flashcards: { front: string; back: string }[];
  tutorPrompts: string[];
  estimatedWeeks: number;
}

// ═══════════════════════════════════════════════════════════════
// RICH OFFICIAL FORESTS — multi-source curated content
// ═══════════════════════════════════════════════════════════════

export const OFFICIAL_FORESTS: Record<string, KnowledgeForest> = {
  // ── IELTS 7.5+ ──────────────────────────────────────────────
  'ielts-75': {
    title: 'IELTS 7.5+ 知识森林',
    description: '雅思高分备考完整知识体系 — 涵盖听说读写+词汇语法+模考策略，目标总分7.5+',
    estimatedWeeks: 12,
    topics: [
      { name: '听力理解', type: 'skill', summary: 'IELTS Listening — 4 Sections, 40 questions, 30 min + 10 min transfer. Section 1-2 生活场景，Section 3-4 学术场景。关键能力：预测、同义替换识别、信号词捕捉。', children: ['填空技巧 Form Completion', '地图题 Map Labelling', '多选题 Multiple Choice', 'S3学术讨论策略', 'S4学术讲座笔记法'] },
      { name: '阅读理解', type: 'skill', summary: 'IELTS Reading — 3 Passages, 40 questions, 60 min。学术类文章来自期刊/书籍/杂志，每篇800-1000词。核心策略：略读(Skimming)→扫读(Scanning)→精读(Close Reading)。', children: ['T/F/NG判断题', 'Heading匹配题', 'Summary填空题', 'Matching信息匹配', '时间管理策略'] },
      { name: '写作 Task 1', type: 'skill', summary: 'Academic Writing Task 1 — 150词以上，20 min。描述图表/表格/地图/流程图。评分维度：Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy。', children: ['线图 Line Graph', '柱状图 Bar Chart', '饼图 Pie Chart', '流程图 Process Diagram', '地图题 Maps', '对比结构模板'] },
      { name: '写作 Task 2', type: 'skill', summary: 'Academic Writing Task 2 — 250词以上，40 min，占写作总分2/3。议论文(Essay)写作，四种题型：Opinion, Discussion, Problem-Solution, Two-part Question。', children: ['四段式结构', '论点展开 PEEL', '让步段 Counter-argument', '开头段模板', '结尾段升华'] },
      { name: '口语 Part 1', type: 'skill', summary: 'Speaking Part 1 — 4-5 min，自我介绍+日常话题(family/work/study/hobbies)。考官评估流利度、词汇、语法、发音。策略：扩展回答(Answer + Reason + Example)。', children: ['自我介绍脚本', '日常话题库', 'ARE扩展法', '常见追问应对'] },
      { name: '口语 Part 2', type: 'skill', summary: 'Speaking Part 2 — 3-4 min（1 min准备+2 min独白）。话题卡(Cue Card)描述人物/地点/事件/物品。利用准备时间圈关键词+写4个bullet points。', children: ['1分钟准备策略', '话题卡分类模板', '故事叙述框架', '时间填充技巧'] },
      { name: '口语 Part 3', type: 'skill', summary: 'Speaking Part 3 — 4-5 min双向讨论。抽象话题深入探讨(society/education/technology)。考察批判性思维和观点表达能力。', children: ['抽象话题展开', '对比论证', '因果分析', '举例说明技巧'] },
      { name: '学术词汇 AWL', type: 'topic', summary: 'Academic Word List — 570个高频学术词汇，覆盖学术文本10%词汇量。分10个Sublist按频率递减。结合Collocations学习效果最佳。', children: ['Sublist 1-2 高频词', '学科主题词汇', '同义替换词库', '搭配词 Collocations'] },
      { name: '语法精要', type: 'concept', summary: 'IELTS 7分语法要求：准确使用复杂句型(Complex Sentences)、多种时态、被动语态、条件句、关系从句。避免重复语法错误。', children: ['复合句 Complex Sentences', '被动语态 Passive Voice', '条件句 Conditionals', '关系从句 Relative Clauses', '时态一致性'] },
      { name: '发音训练', type: 'skill', summary: 'Pronunciation — 占口语25%。关键特征：单词重音、句子重音、语调、连读(Linking)、弱读(Weak Forms)。目标：清晰可懂(Clear & Comprehensible)。', children: ['单词重音规则', '句子重音与节奏', '语调模式', '连读与弱读', '音标纠正'] },
      { name: '模考与诊断', type: 'skill', summary: '全真模拟考试 + 错题分析。建议使用Cambridge IELTS真题系列。记录每次模考的分数和错误类型，针对性改进。', children: ['听力模考流程', '阅读限时训练', '写作批改标准', '口语模考录音'] },
      { name: '考试日策略', type: 'skill', summary: '考前准备清单 + 考试当天时间管理 + 心态调节。听力前检查耳机，阅读把控每篇20分钟，写作Task2优先。', children: ['考前一周计划', '考试当天流程', '时间分配策略', '应急处理方案'] },
    ],
    resources: [
      { title: 'Cambridge IELTS 14-19', type: 'book', url: 'https://www.cambridge.org/gb/cambridgeenglish/catalog/cambridge-english-exams-ielts', description: '官方真题集，每册4套完整测试，是最接近真实考试的练习材料', forTopic: '模考与诊断' },
      { title: 'IELTS Liz — 免费视频教程', type: 'video', url: 'https://ieltsliz.com/', description: '覆盖听说读写全科技巧，Task 2 范文分析尤其出色', forTopic: '写作 Task 2' },
      { title: 'IELTS Advantage — Writing Course', type: 'course', url: 'https://www.ieltsadvantage.com/', description: '专业写作课程，Task 1 + Task 2 系统教学，含批改服务', forTopic: '写作 Task 1' },
      { title: 'English Collocations in Use', type: 'book', description: '剑桥出版搭配词经典教材，提升词汇使用自然度，直接贡献Lexical Resource评分', forTopic: '学术词汇 AWL' },
      { title: 'BBC 6 Minute English', type: 'video', url: 'https://www.bbc.co.uk/learningenglish/english/features/6-minute-english', description: '6分钟精简短音频，适合每日听力打卡，话题广泛覆盖IELTS常考领域', forTopic: '听力理解' },
      { title: 'IELTS Podcast — Speaking Samples', type: 'website', url: 'https://www.ieltspodcast.com/', description: '口语范例音频+文字稿，涵盖Part 1-3全题型，可模仿语调与表达', forTopic: '口语 Part 2' },
      { title: 'Road to IELTS — British Council', type: 'course', url: 'https://www.britishcouncil.org/exam/ielts/courses-resources/road-ielts', description: 'British Council官方在线课程，含模考和详细解析', forTopic: '模考与诊断' },
      { title: 'Academic Word List (AWL) Highlighter', type: 'website', url: 'https://www.eapfoundation.com/vocab/academic/awllists/', description: '在线AWL工具，输入文本即可高亮学术词汇，辅助词汇学习', forTopic: '学术词汇 AWL' },
    ],
    notes: [
      { title: '听力 Section 3 学术讨论策略', topic: '听力理解', body: `S3是最难的部分——2-4人学术讨论，口音可能多样。

【核心信号词】
• actually / but / however → 纠正前面观点，答案通常在后
• I mean / what I'm saying is → 解释重述，关键信息
• the thing is / the point is → 强调重点
• anyway / so / right → 话题转换

【题型策略】
• 多选题：选项通常都会被提及，排除干扰是关键。听到的≠选。注意说话人的态度(agree/disagree)。
• 匹配题：先读选项，预判可能的关键词。笔记用缩写。

【常见陷阱】
• 说话人先提A再否定→选B。听到A被mention不等于A是答案。
• 数字题：注意teen vs ty (thirteen vs thirty)，重音在第一音节是teen。`, tags: ['听力', 'S3', '学术讨论'] },
      { title: 'T/F/NG 判断题终极解析', topic: '阅读理解', body: `T/F/NG是IELTS阅读最高频失分题型。

【定义】
• TRUE (T): 文章明确说了这个陈述 → 可以找到同义替换的原文
• FALSE (F): 文章说了与陈述相反的内容 → 原文与陈述矛盾
• NOT GIVEN (NG): 文章没提到这个信息 → 无法从原文推断

【三步法】
1. 圈出陈述中的关键词（名词、数字、限定词如all/some/only）
2. 扫读定位到原文对应段落
3. 对比判断：
   - 同义替换 = T
   - 反义/矛盾 = F
   - 找不到/部分信息缺失/过度推断 = NG

【NG 常见模式】
• 比较级NG: 陈述说"A比B大"，原文只说"A很大"和"B很大"，没有比较
• 因果关系NG: 陈述说"A导致B"，原文只说"A发生"和"B发生"，没说因果
• 限定词NG: 陈述说"only/always/all"，原文只是泛泛而谈

【易错点】
⚠ 不要用自己的知识判断！一切以原文为准。
⚠ 不要过度推断！NG就是NG，不要强行选T或F。`, tags: ['阅读', 'T/F/NG', '策略'] },
      { title: 'Task 2 四段式议论文模板', topic: '写作 Task 2', body: `IELTS Task 2 最通用的结构——四段式(约280-300词)。

【Introduction (40-50词)】
• Hook: 背景句（概述话题的普遍性/重要性）
• Paraphrase: 用自己的话重述题目
• Thesis: 清晰表明立场(This essay will discuss both views and argue that...)

【Body 1 (90-100词)】
• Topic Sentence: 第一个论点
• Explanation: 解释论点（1-2句）
• Example: 具体例子（1-2句，可以是假设例子）
• Link: 回扣论点

【Body 2 (90-100词)】— 同上结构

注意：如果是Discussion题型 → Body1讨论一方观点，Body2讨论另一方
如果是Opinion题型 → Body1+Body2 都是支持自己立场的论点

【Conclusion (40-50词)】
• 总结双方/重述立场
• 不要引入新观点
• 不要用In conclusion开头的模板句—换In summary/To conclude/Overall

【高分词汇替换】
important → crucial/vital/significant/paramount
think → believe/argue/maintain/contend
many → numerous/a multitude of/a host of
because → due to/owing to/as a result of`, tags: ['写作', 'Task2', '模板', '结构'] },
      { title: 'Task 1 线图写作模板', topic: '写作 Task 1', body: `线图(Line Graph)是Task 1最高频题型。

【四段结构】

Paragraph 1 — Introduction (1句)
→ 改写题目：The line graph illustrates + what + where + when
❌ 不要抄题目！换词换句式。

Paragraph 2 — Overview (2-3句)
→ 总结整体趋势(Overall trend)和显著特征
→ 不引用具体数据，只描述宏观模式
→ 模板：Overall, it is clear that... / The most striking feature is...

Paragraph 3 — Detail 1 (3-4句)
→ 描述第一条/前几条线的变化
→ 引用关键数据点(起点、终点、峰值、谷值)
→ 用时间状语(From 2000 to 2010 / Over the period / Subsequently)

Paragraph 4 — Detail 2 (3-4句)
→ 描述剩余线的变化
→ 对比不同线之间的关系

【趋势描述词汇】
上升: rise/increase/grow/climb/soar/surge ↗
下降: fall/decline/decrease/drop/plunge/plummet ↘
波动: fluctuate/oscillate/vary
稳定: remain stable/level off/plateau
峰值: peak at / reach a peak of
谷值: hit a low of / bottom out at

【副词修饰】
大幅: dramatically/sharply/significantly/substantially
小幅: slightly/marginally/gradually/modestly
快速: rapidly/steeply
缓慢: slowly/steadily`, tags: ['写作', 'Task1', '线图', '模板'] },
      { title: '口语 Part 2 话题卡分类框架', topic: '口语 Part 2', body: `1分钟准备时间的最优策略：分类思维。

【四类话题卡 + 模板】

1️⃣ 人物卡 (Describe a person...)
• Who → 姓名/关系/外貌特征(2-3个形容词)
• Personality → 性格特点 + 具体事例证明
• Influence → 对你的影响/为什么难忘
• Summary → 一句话总结

2️⃣ 地点卡 (Describe a place...)
• Where → 位置/怎么知道的
• What it looks like → 视觉描述(色彩/建筑/氛围)
• Activities → 在那可以做什么
• Feelings → 你的感受/为什么喜欢

3️⃣ 事件卡 (Describe an event/experience...)
• When & Where → 时间地点
• What happened → 事件经过（按时间顺序）
• Who was involved → 参与者
• Why memorable → 为什么难忘/学到了什么

4️⃣ 物品卡 (Describe an object...)
• What → 是什么物品
• Appearance → 外观描述
• How you got it → 怎么得到的/谁送的
• Why important → 为什么重要/如何使用

【万能填充句】
• I'd like to talk about... (开头)
• Speaking of... / When it comes to... (转换话题)
• What I find particularly + adj + is... (强调)
• It's worth mentioning that... (补充)
• All in all / To sum up... (结尾)`, tags: ['口语', 'Part2', '话题卡', '模板'] },
      { title: 'AWL 学术词汇速记法', topic: '学术词汇 AWL', body: `Academic Word List (AWL) 由新西兰Victoria University的Averil Coxhead开发，基于350万词学术语料库。

【学习原则】
1. 不背单词—背搭配词(Collocation)
   错误示范：analyze = 分析
   正确示范：analyze the data / conduct an analysis of / in-depth analysis

2. 按主题分组学习
   教育类：curriculum, pedagogy, assessment, literacy
   科技类：innovation, mechanism, technique, device
   社科类：policy, legislation, framework, paradigm

3. 搭配语境记忆
   每个词学3个搭配 + 1个例句。不是背定义，是学会用。

【高频AWL Sublist 1 (前60词)】
analysis, approach, area, assessment, assume, authority, available, benefit, concept, consistent, constitutional, context, contract, create, data, definition, derived, distribution, economic, environment, established, estimate, evidence, export, factors, financial, formula, function, identified, income, indicate, individual, interpretation, involved, issues, labour, legal, legislation, major, method, occur, percent, period, policy, principle, procedure, process, required, research, response, role, section, sector, significant, similar, source, specific, structure, theory, variable

【快速自测】
遮住英文看中文能说 → 遮住中文看英文能解释 → 能造3个搭配 → 完成`, tags: ['词汇', 'AWL', '学术'] },
      { title: '听力地图题 Map Labelling 策略', topic: '听力理解', body: `地图题出现在S2（最多），是空间定位+方向词汇的综合考察。

【核心词汇】
方向: north/south/east/west, northeast/southwest...
相对位置: opposite, facing, next to, adjacent to, beside
路径: go straight, turn left/right, go past, head towards
地标: entrance, exit, corridor, junction, intersection, roundabout
形状: rectangular, circular, L-shaped, U-shaped

【解题步骤】
1. 看地图标题和指南针（如果有）→ 确定方位
2. 标出已知地点名称 → 注意拼写
3. 预判路线走向 → 听时验证
4. 边听边跟地图移动 → 手指在图上指

【常见陷阱】
• 说话人可能先走过目标再回头 → 注意"actually/no/wait"
• 多个入口 → 先确定从哪个入口开始
• 翻新/改建类 → 注意before vs after (used to be/now/replaced)
• A在B的左边 vs 从A走到B左边 → 区分静态描述和动态指引`, tags: ['听力', '地图题', 'S2'] },
      { title: 'IELTS 语法7分 checklist', topic: '语法精要', body: `写作/口语7分的语法要求：frequent error-free sentences + a mix of simple and complex structures。

【必须掌握的7种复杂结构】

1. 关系从句 (Relative Clauses)
   → The approach, which has been widely adopted, offers several advantages.
   → 限定 vs 非限定：逗号区别意义

2. 条件句 (Conditionals)
   → If governments invest more in education, the economy will benefit. (First)
   → Had the study included more participants, the results would have been more reliable. (Third — 倒装加分！)

3. 被动语态 (Passive Voice)
   → It is widely believed that... / Measures should be taken to...
   → Task 1 大量使用：The number of... was recorded / can be observed

4. 分词结构 (Participle Phrases)
   → Having analyzed the data, the researchers concluded that...
   → Compared with traditional methods, the new approach...

5. 名词化 (Nominalization) — 7+关键特征
   → The implementation of the policy led to a significant improvement...
   替代: They implemented the policy and it improved...

6. 强调句 (Cleft Sentences)
   → It is the lack of funding that poses the greatest challenge.
   → What the government needs to do is invest more in infrastructure.

7. 让步状语 (Concessive Clauses)
   → Although the initial cost is high, the long-term benefits outweigh it.
   → Despite the challenges, significant progress has been made.`, tags: ['语法', '写作', '7分'] },
      { title: 'IELTS 听力数字与拼写陷阱', topic: '听力理解', body: `S1个人信息填空是最容易拿分也最容易丢分的部分。

【数字专项】
• 电话号码：英式读法double/triple (07700 double 9 = 0770099)，每3-4位一组停顿
• 日期：15th October / October 15th / 15/10 → 多种写法都接受
• 时间：9:30 vs 9.30 → 统一用冒号
• 价格：£15.50 → 注意英镑/美元符号
• 邮编/车牌：字母+数字组合 → 每个字母单独读

【拼写必对词（高频答案词）】
government, environment, committee, accommodation, restaurant, Wednesday, February, library, necessary, separate, definitely, opportunity, professor, colleague, address, business, receive, believe, foreign, knowledge, questionnaire, exercise, parliament

【常见拼写错误】
• double letters: accommodation(2c2m), committee(2m2t2e), necessary(1c2s)
• -ent vs -ant: independent(ent), important(ant), relevant(ant)
• -able vs -ible: comfortable, considerable, but possible, flexible

【数字听力练习方法】
每天听5个电话号码→默写→对答案。2周后正确率90%+。`, tags: ['听力', 'S1', '数字', '拼写'] },
      { title: '口语 Part 3 高分展开法', topic: '口语 Part 3', body: `Part 3 不再是个人经历，需要展现抽象思维和分析能力。

【PPF框架】（万能话题展开）
• Past → 过去什么情况
• Present → 现在什么变化
• Future → 未来会怎样

【ARE扩展法】
• Answer — 直接回答问题（1句）
• Reason — 解释原因（1-2句）
• Example — 举例说明（1-2句）

【Part 3 典型题型 + 话术】

1. Compare & Contrast (对比类)
   Q: How is education different now compared to the past?
   A: Well, there are several key differences. In the past, education was more about... whereas nowadays...
   话术: The main difference is... / In contrast... / Unlike in the past...

2. Cause & Effect (因果类)
   Q: Why do some people struggle to learn a new language?
   A: I think there are a few reasons. Firstly... Additionally... As a result...
   话术: This can be attributed to... / One contributing factor is...

3. Prediction (预测类)
   Q: How will AI change education in the future?
   A: It's hard to say for sure, but I imagine that... / One possibility is that...
   话术: I envisage that... / There's a strong possibility that...

4. Opinion (观点类)
   Q: Should university education be free?
   A: That's a complex issue. On the one hand... On the other hand... Personally I believe...
   话术: I'm inclined to think... / It's a matter of perspective...`, tags: ['口语', 'Part3', 'PPF', 'ARE'] },
    ],
    learningPath: [
      { phase: '第一阶段：诊断奠基', duration: '1周', tasks: ['完成一套全真模考确定当前水平', '分析听说读写各科分数差距', '制定个性化学习计划', '安装AWL词汇App开始每日打卡'], topics: ['模考与诊断', '学术词汇 AWL'] },
      { phase: '第二阶段：输入技能突破', duration: '4周', tasks: ['每日听力Section训练（精听+泛听）', '阅读限时训练（每篇20分钟）', 'AWL Sublist 1-5词汇学习', '语法7分句型和结构练习'], topics: ['听力理解', '阅读理解', '学术词汇 AWL', '语法精要'] },
      { phase: '第三阶段：输出技能强化', duration: '4周', tasks: ['每周2篇Task1+2篇Task2写作', '每周3次口语模考录音自评', '听力S3+S4专项突破', '阅读T/F/NG和Heading专项'], topics: ['写作 Task 1', '写作 Task 2', '口语 Part 1', '口语 Part 2', '口语 Part 3', '发音训练'] },
      { phase: '第四阶段：全真模考冲刺', duration: '2周', tasks: ['隔日全真模考(听说读写完整流程)', '错题归类分析+针对性补弱', '口语话题预测准备', '考试日策略演练'], topics: ['模考与诊断', '考试日策略'] },
      { phase: '第五阶段：考前调整', duration: '1周', tasks: ['回顾错题本和高频词汇', '保持每日轻度练习(维持手感)', '调整作息匹配考试时间', '准备考试当天物品清单'], topics: ['考试日策略', '学术词汇 AWL'] },
    ],
    flashcards: [
      { front: 'IELTS Listening 几个 Section？各什么类型？', back: '4个Section。S1:日常对话(2人)，S2:日常独白，S3:学术讨论(2-4人)，S4:学术讲座(1人)。共40题，约30分钟+10分钟誊写。' },
      { front: 'T/F/NG 三种判断的核心区别？', back: 'TRUE = 文章明确说了(同义替换)。FALSE = 文章说了相反的。NOT GIVEN = 文章没提到/无法推断。关键：一切以原文为准，不凭常识判断。' },
      { front: 'IELTS Writing Task 2 的四种题型？', back: '1) Opinion (To what extent do you agree?) 2) Discussion (Discuss both views) 3) Problem-Solution (What are the problems and solutions?) 4) Two-part Question (Why...? What...?) — 都需要Introduction+Body×2+Conclusion。' },
      { front: 'Speaking Part 2 准备时间的1分钟怎么用？', back: '1) 圈话题卡关键词 2) 写4个bullet points(按Who/What/Where/Why框架) 3) 每个bullet写1-2个关键词，不写完整句子 4) 留10秒默想开头句。用ARE法扩展每个bullet。' },
      { front: '什么是 PEEL 段落结构？', back: 'Point(论点句) → Explanation(解释1-2句) → Example(例子1-2句) → Link(回扣论点)。每个Body paragraph严格执行，保证逻辑清晰。Task2必备。' },
      { front: 'IELTS 同义替换的常见类型？', back: '1) 同义词:important→crucial 2) 词性转换:analyze(v.)→analysis(n.) 3) 上下义词:car→vehicle 4) 反义+否定:not easy=difficult 5) 释义:people who travel=travelers。听力阅读核心能力。' },
      { front: '听力 Section 4 学术讲座记什么？', back: '记名词(人名/地名/术语/数据)+信号词后的内容(but/however/importantly/one key factor)+结构词(firstly/secondly/finally)+转折和强调。用缩写和符号加速。不记完整句子。' },
      { front: 'IELTS 口语评分四项标准及权重？', back: 'Fluency & Coherence(流利连贯)25% + Lexical Resource(词汇)25% + Grammatical Range & Accuracy(语法)25% + Pronunciation(发音)25%。四项均等。Part 2流利度影响最大。' },
      { front: 'AWL Academic Word List 有多少词？', back: '570个核心学术词汇，分10个Sublist(按频率递减)。Sublist 1-3最常用(占学术文本5%以上)。不背单词—背搭配词(Collocations)和语境用法。' },
      { front: 'IELTS 阅读60分钟时间怎么分配？', back: '每篇20分钟严格把控。0-5min:略读(Skim)+读题，5-18min:扫读(Scan)+答题，18-20min:检查。绝不在一道题上纠结超过1分钟。先做顺序题(填空/判断)，后做乱序题(匹配/Heading)。' },
      { front: '写作 Task 1 Overview 段写什么？', back: '2-3句概述整体趋势和最显著特征。不引用具体数据！描述宏观模式。模板：Overall, it is clear that... / The most striking feature is that... / In general,... while... 考官首先看这一段。' },
      { front: '什么是 Shadowing 跟读法？', back: '听原声→同步跟读。用于提升口语流利度和发音。步骤：1)听一遍理解内容 2)看着文本跟读 3)不看文本跟读 4)录音对比。每天10分钟，2周见效。推荐BBC 6 Minute English练习。' },
      { front: 'IELTS 考试当天流程？', back: '笔试顺序：Listening(30+10min)→Reading(60min)→Writing(60min)。口语可能在笔试前/后7天内。笔试不允许带手机/手表，只带铅笔橡皮和水。听力前有试音时间。' },
      { front: '什么是 Nominalization(名词化)？', back: "将动词/形容词转化为名词。如implement→implementation, important→importance, significant→significance。学术写作7分关键特征。The implementation of... is of great importance. 替代 They implemented... and it's important." },
    ],
    tutorPrompts: [
      '请分析我的IELTS写作Task2，给出7分对照评分',
      '模拟IELTS Speaking Part 2，给我一个话题卡让我准备1分钟',
      '帮我批改这段Task 1图表描述，重点看数据引用的准确性',
      '随机抽取10个AWL Sublist 1-3词汇，测试我的搭配词掌握',
      '给我一篇IELTS阅读文章并出T/F/NG题，我做完后对照解析',
    ],
  },

  // ── AI Engineer ─────────────────────────────────────────────
  'ai-engineer': {
    title: 'AI 工程师 知识森林',
    description: '从零到AI工程师的完整学习路径 — Python基础→机器学习→深度学习→NLP→MLOps，覆盖理论与实战',
    estimatedWeeks: 24,
    topics: [
      { name: 'Python 数据科学栈', type: 'skill', summary: 'NumPy数值计算 + Pandas数据处理 + Matplotlib/Seaborn可视化。AI工程师的瑞士军刀——90%的数据预处理用这三个库完成。', children: ['NumPy数组操作', 'Pandas DataFrame', '数据可视化', '向量化计算', '缺失值处理'] },
      { name: '数学基础', type: 'concept', summary: '线性代数(矩阵/特征值/SVD) + 概率统计(贝叶斯/分布/假设检验) + 微积分(链式法则/梯度/偏导)。不要等到看不懂论文才回头补。', children: ['矩阵运算与广播', '特征值与PCA', '概率分布', '贝叶斯定理', '梯度下降数学'] },
      { name: '机器学习基础', type: 'concept', summary: 'Supervised (Regression/Classification) + Unsupervised (Clustering/Dimensionality Reduction)。核心概念：Bias-Variance Tradeoff, Cross-Validation, Regularization。', children: ['线性回归与逻辑回归', '决策树与随机森林', 'SVM', 'K-Means与DBSCAN', '交叉验证与正则化'] },
      { name: '深度学习', type: 'concept', summary: 'Neural Networks = 层层Feature Extractor。从Perceptron→MLP→CNN→RNN→Transformer。核心：Backpropagation, Gradient Descent variants, Activation functions。', children: ['CNN卷积网络', 'RNN与LSTM', 'Transformer与Attention', 'BatchNorm与Dropout', '迁移学习'] },
      { name: 'PyTorch 实战', type: 'skill', summary: '主流深度学习框架。核心抽象：Tensor → Dataset/DataLoader → nn.Module → Optimizer → Training Loop。动态计算图 → 调试友好。', children: ['Tensor基础', 'nn.Module与Autograd', 'DataLoader与Dataset', 'Training Loop模板', 'GPU训练与混合精度'] },
      { name: '自然语言处理 NLP', type: 'skill', summary: 'Tokenization → Embeddings → Language Models。从Word2Vec到GPT：词向量→上下文向量→预训练→微调。HuggingFace生态 = NLP的sklearn。', children: ['Tokenization与分词', 'Word Embeddings', 'RNN与Seq2Seq', 'Transformer架构详解', 'BERT微调实战'] },
      { name: '大语言模型 LLMs', type: 'concept', summary: 'GPT/BERT/Claude背后的技术栈。Pretraining(Next Token Prediction)→SFT(指令微调)→RLHF(人类反馈强化学习)。Prompt Engineering = 新时代的编程。', children: ['Decoder-only架构(GPT)', 'Prompt Engineering', 'RAG检索增强生成', 'LoRA微调', 'Agent与Tool Use'] },
      { name: '计算机视觉 CV', type: 'skill', summary: '图像分类→目标检测→图像分割→生成模型。CNN backbone (ResNet/EfficientNet/ViT) + 下游任务head。', children: ['卷积基础', 'ResNet与EfficientNet', 'YOLO目标检测', 'Vision Transformer', '数据增强技术'] },
      { name: 'MLOps与部署', type: 'skill', summary: '实验追踪→模型版本管理→容器化→CI/CD→监控。MLflow/Weights&Biases + Docker + FastAPI + Kubernetes。', children: ['MLflow实验管理', 'Docker容器化', 'FastAPI模型服务', '模型监控与漂移', 'CICD流水线'] },
      { name: 'AI 工程化', type: 'skill', summary: 'Vector DB (Pinecone/Chroma) + RAG pipeline + Agent framework。构建生产级AI应用的工程实践。', children: ['Vector Database选型', 'RAG Pipeline设计', 'LangChain/LlamaIndex', 'API设计与限流', '成本优化'] },
      { name: '数学进阶', type: 'concept', summary: 'Information Theory (Entropy/KL Divergence), Optimization (Convex/SGD/Adam), Probabilistic ML。进阶论文的数学基础。', children: ['信息论基础', '凸优化', '概率图模型', '变分推断入门'] },
      { name: '项目实战方法论', type: 'project', summary: '从问题定义→数据收集→EDA→建模→评估→部署→迭代。Kaggle竞赛 + 个人项目 + 开源贡献三位一体。', children: ['Kaggle竞赛策略', '个人项目选题', '开源贡献指南', '技术博客写作'] },
    ],
    resources: [
      { title: 'CS229 — Stanford ML (Andrew Ng)', type: 'course', url: 'https://cs229.stanford.edu/', description: 'Stanford机器学习课程，数学推导完整，适合打好理论基础', forTopic: '机器学习基础' },
      { title: 'Fast.ai — Practical Deep Learning', type: 'course', url: 'https://course.fast.ai/', description: 'Top-down教学法，先写代码再学理论，快速建立直觉和实战能力', forTopic: '深度学习' },
      { title: 'Deep Learning Specialization — Coursera', type: 'course', url: 'https://www.coursera.org/specializations/deep-learning', description: 'Andrew Ng的5门深度学习专项课，覆盖CNN/RNN/结构化ML', forTopic: '深度学习' },
      { title: 'HuggingFace NLP Course', type: 'course', url: 'https://huggingface.co/learn/nlp-course', description: '免费的NLP实战课程，从tokenizer到fine-tune Transformer，含完整代码', forTopic: '自然语言处理 NLP' },
      { title: 'PyTorch Official Tutorials', type: 'website', url: 'https://pytorch.org/tutorials/', description: '官方教程覆盖从Tensor基础到分布式训练，示例代码即拿即用', forTopic: 'PyTorch 实战' },
      { title: 'Full Stack Deep Learning', type: 'course', url: 'https://fullstackdeeplearning.com/', description: '专注MLOps和生产级ML系统设计，2022版含LLM相关章节', forTopic: 'MLOps与部署' },
      { title: 'Andrej Karpathy — Neural Networks: Zero to Hero', type: 'video', url: 'https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ', description: '从零手写反向传播和GPT，深入理解底层原理', forTopic: 'PyTorch 实战' },
      { title: '3Blue1Brown — Linear Algebra', type: 'video', url: 'https://www.3blue1brown.com/topics/linear-algebra', description: '线性代数的视觉直观解释，矩阵变换的可视化理解', forTopic: '数学基础' },
    ],
    notes: [
      { title: 'Transformer Attention 机制详解', topic: '自然语言处理 NLP', body: `Attention = 让模型关注输入序列中不同位置的权重分配。

【Self-Attention 公式】
Input: X ∈ R^(n×d)
Q = X·Wq, K = X·Wk, V = X·Wv  (三个线性投影)
Attention(Q,K,V) = softmax(QK^T / √dk)·V

【直觉理解】
• Q(Query): "我在找什么" — 当前位置想查询的信息
• K(Key): "我是什么" — 每个位置提供的索引
• V(Value): "实际内容" — 每个位置的真实信息
• QK^T: 查询和所有key的匹配度 → softmax归一化为权重
• ×V: 用权重加权求和所有位置的value

【为什么除以 √dk?】
dk大 → QK^T值大 → softmax进入饱和区 → 梯度消失。
除以√dk使方差≈1，保持梯度流动。

【Multi-Head Attention】
不同head学习不同的"关注模式"：
• Head 1: 关注语法关系(主语-谓语)
• Head 2: 关注语义关系(同义/反义)
• Head 3: 关注位置关系(前后文)
Concat所有head输出 → 线性变换 → 输出。

【位置编码 Position Encoding】
Transformer没有RNN的顺序归纳偏置，需要用PE给token注入位置信息。
原始论文: PE(pos,2i)=sin(pos/10000^(2i/d)), PE(pos,2i+1)=cos(...)`, tags: ['Transformer', 'Attention', 'NLP'] },
      { title: '梯度下降优化器演进', topic: '数学基础', body: `从SGD到Adam的优化器进化路线。

【SGD (Stochastic Gradient Descent)】
θ = θ - lr × ∇L(θ)
问题：峡谷效应(来回震荡)、学习率固定、容易陷入局部最优

【SGD + Momentum】
v = βv + ∇L(θ)   (动量累积)
θ = θ - lr × v
直觉：像球滚下山坡，惯性帮助冲过小坑和平坦区域。
β通常=0.9

【RMSprop】
s = βs + (1-β)(∇L)^2   (梯度平方的移动平均)
θ = θ - lr × ∇L / √(s+ε)
直觉：每个参数自适应学习率。梯度大的方向减速，梯度小的方向加速。

【Adam (Adaptive Moment Estimation)】
结合Momentum + RMSprop：
m = β1·m + (1-β1)∇L     (一阶矩 — 类似Momentum)
v = β2·v + (1-β2)(∇L)^2  (二阶矩 — 类似RMSprop)
θ = θ - lr × m̂ / √(v̂+ε)
默认: lr=0.001, β1=0.9, β2=0.999

【优化器选择原则】
• Adam: 默认首选，对超参数不敏感
• SGD+Momentum: CV领域SOTA常用，需要调lr schedule
• AdamW: Adam + 解耦的weight decay，Transformer训练标配`, tags: ['优化器', 'SGD', 'Adam', '数学'] },
      { title: 'Bias-Variance Tradeoff 核心概念', topic: '机器学习基础', body: `Bias-Variance Tradeoff 是机器学习最重要的诊断框架。

【定义】
• Bias (偏差): 模型预测与真实值的系统性偏离。高Bias = 欠拟合(Underfitting)
• Variance (方差): 模型在不同训练集上预测的波动程度。高Variance = 过拟合(Overfitting)
• Irreducible Error: 数据本身的噪声，任何模型都无法消除

【诊断】
高Bias (欠拟合) 的症状：
• 训练误差高 + 验证误差高
• 模型在训练集上都学不好
• 常见原因：模型太简单、特征不够、训练不够

高Variance (过拟合) 的症状：
• 训练误差低 + 验证误差显著高于训练误差
• 训练集上表现完美但测试集差
• 常见原因：模型太复杂、数据太少、没有正则化

【解决策略】
降低Bias: 加特征、加模型复杂度、减少正则化、训练更久
降低Variance: 加数据、加正则化(L1/L2/Dropout)、Ensemble、早停(Early Stopping)、数据增强

【现代观点】
深度学习中，过参数化的大模型可以同时实现低Bias和低Variance
— 这是经典统计学的"Double Descent"现象：
参数量<样本量→U-shape  |  参数量>样本量→继续下降(第二段下降)`, tags: ['Bias-Variance', '过拟合', 'ML基础'] },
      { title: 'PyTorch Training Loop 模板', topic: 'PyTorch 实战', body: `PyTorch训练循环的标准模板——从新手到熟练工必备。

\`\`\`python
import torch
import torch.nn as nn
from torch.utils.data import DataLoader

# 1. Hyperparameters
BATCH_SIZE = 32
LR = 1e-3
EPOCHS = 50
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# 2. Model, Loss, Optimizer
model = YourModel().to(DEVICE)
criterion = nn.CrossEntropyLoss()
optimizer = torch.optim.AdamW(model.parameters(), lr=LR, weight_decay=0.01)
scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=EPOCHS)

# 3. Training Loop
for epoch in range(EPOCHS):
    # ── Train ──
    model.train()
    train_loss = 0.0
    for x, y in train_loader:
        x, y = x.to(DEVICE), y.to(DEVICE)
        optimizer.zero_grad()          # 清空上一步梯度
        pred = model(x)               # 前向
        loss = criterion(pred, y)     # 计算loss
        loss.backward()               # 反向传播
        optimizer.step()              # 更新参数
        train_loss += loss.item()

    # ── Eval ──
    model.eval()
    val_loss = 0.0
    with torch.no_grad():             # 不计算梯度—节省显存
        for x, y in val_loader:
            x, y = x.to(DEVICE), y.to(DEVICE)
            pred = model(x)
            loss = criterion(pred, y)
            val_loss += loss.item()

    scheduler.step()                  # 更新学习率

    if (epoch + 1) % 5 == 0:
        print(f"Epoch {epoch+1}/{EPOCHS} | Train Loss: {train_loss/len(train_loader):.4f} | Val Loss: {val_loss/len(val_loader):.4f}")
\`\`\`

【关键细节】
• model.train() vs model.eval(): 影响Dropout和BatchNorm行为
• zero_grad()必须在backward()之前，否则梯度累积
• torch.no_grad(): 验证/推理时必须，否则显存爆炸
• scheduler.step()位置: 在optimizer.step()之后（大多数scheduler）`, tags: ['PyTorch', 'Training', '模板', '代码'] },
      { title: 'RAG (Retrieval-Augmented Generation) 架构', topic: '大语言模型 LLMs', body: `RAG = 检索+生成 — 让LLM能够访问外部知识库的标配架构。

【为什么需要 RAG？】
• LLM知识截止于训练日期 — 无法获取最新信息
• 幻觉(Hallucination) — LLM可能编造看似合理但错误的内容
• 私有知识 — 企业内部文档无法直接让LLM访问

【RAG Pipeline】
┌──────────────┐
│  用户提问     │
└──────┬───────┘
       ▼
┌──────────────┐
│ 1. Embedding  │  将query转为向量
└──────┬───────┘
       ▼
┌──────────────┐
│ 2. Retrieval  │  在Vector DB中检索Top-K相关文档
└──────┬───────┘
       ▼
┌──────────────┐
│ 3. Augment    │  将检索结果拼入Prompt: "根据以下资料回答..."
└──────┬───────┘
       ▼
┌──────────────┐
│ 4. Generate   │  LLM基于增强的prompt生成答案
└──────────────┘

【Chunking 策略】
• Fixed-size: 固定token数切分(如512 tokens) — 简单但可能切到句子中间
• Semantic: 按段落/章节切分 — 语义完整性更好
• Recursive: 先大块再小块 — 保持层级信息
• Overlap: 块之间重叠10-20%以减少边界信息丢失

【评估指标】
• Faithfulness: 答案是否基于检索到的文档（不是幻觉）
• Relevance: 检索到的文档是否与问题相关
• Context Recall: 是否检索到了所有必要信息`, tags: ['RAG', 'LLM', '架构', '检索'] },
      { title: 'CNN 卷积神经网络直觉理解', topic: '深度学习', body: `CNN = 让计算机"看"图像的核心架构。

【为什么不能用全连接？】
224×224×3的图像 → 150,528个输入 → 如果第一层1024神经元 → 1.5亿参数 → 过拟合且算不动。

【CNN三大核心思想】
1. 局部感受野(Local Receptive Field): 每个神经元只看图像的一小块(如3×3) → 参数暴减
2. 权重共享(Weight Sharing): 同一个filter滑过整张图 → 检测同一个特征(边缘/纹理)在任何位置
3. 池化(Pooling): 下采样→减少空间维度→增加感受野→提取更高层特征

【典型CNN架构 (ResNet-50)】
Input (224×224×3)
  → Conv7×7, stride2 → 112×112×64
  → MaxPool3×3 → 56×56×64
  → Residual Block×3 → 56×56×256
  → Residual Block×4 → 28×28×512
  → Residual Block×6 → 14×14×1024
  → Residual Block×3 → 7×7×2048
  → Global Average Pool → 2048
  → FC → 1000类

【特征层级 (从低到高)】
Layer 1: 检测边缘、颜色、简单纹理
Layer 2-3: 检测形状、图案、局部结构
Layer 4-5: 检测物体部分(眼睛/轮子)、语义特征
最后FC: 组合所有特征 → 分类决策

【残差连接 (ResNet核心创新)】
output = F(x) + x (跳过连接)
→ 让梯度直接流过 → 允许训练100+层的网络
→ 没有残差连接，深层网络梯度消失 → 反而比浅层差`, tags: ['CNN', 'ResNet', '视觉'] },
    ],
    learningPath: [
      { phase: 'Phase 1: Python + 数学基础', duration: '4周', tasks: ['NumPy/Pandas/Matplotlib 熟练使用', '线性代数(3Blue1Brown)+概率统计', '完成Python数据科学迷你项目', 'LeetCode Easy-Medium 20题'], topics: ['Python 数据科学栈', '数学基础'] },
      { phase: 'Phase 2: 经典机器学习', duration: '4周', tasks: ['Scikit-learn 完成分类/回归/聚类项目', 'CS229 前12讲视频+笔记', 'Kaggle入门竞赛(Titanic/House Prices)', '手写KNN/K-Means/Linear Regression from scratch'], topics: ['机器学习基础'] },
      { phase: 'Phase 3: 深度学习基础', duration: '6周', tasks: ['PyTorch从tensor到training loop完整掌握', '从零手写CNN图像分类器', 'Fast.ai课程完成', '训练自己的ResNet on CIFAR-100'], topics: ['深度学习', 'PyTorch 实战', '计算机视觉 CV'] },
      { phase: 'Phase 4: NLP + LLMs', duration: '6周', tasks: ['HuggingFace NLP Course完成', 'Fine-tune BERT做文本分类', '理解Transformer源码(Annotated Transformer)', '构建RAG问答系统', 'LoRA微调开源LLM'], topics: ['自然语言处理 NLP', '大语言模型 LLMs'] },
      { phase: 'Phase 5: MLOps + 工程化', duration: '4周', tasks: ['Docker+FastAPI部署模型API', 'MLflow追踪实验', '构建完整AI应用(Next.js + FastAPI + LLM)', '开源贡献1-2个PR', '技术博客记录学习过程'], topics: ['MLOps与部署', 'AI 工程化', '项目实战方法论'] },
    ],
    flashcards: [
      { front: '什么是 Attention 的 Q、K、V？', back: 'Q(Query):"我在找什么" — 当前token想查的信息。K(Key):"我是什么" — 每个token提供的索引标签。V(Value):"实际内容" — 每个token的真实信息。Attention=软寻址：用Q去匹配所有K得到权重，用权重加权求和V。' },
      { front: 'BatchNorm vs LayerNorm 区别和应用场景？', back: 'BatchNorm: 对batch维度归一化→适合CV(CNN)，因为不同样本同channel有相似分布。LayerNorm: 对feature维度归一化→适合NLP(Transformer)，因为不同样本长度不同。LayerNorm在推理时不需要统计batch的均值和方差。' },
      { front: '过拟合(Overfitting)如何诊断和解决？', back: '诊断：训练误差远低于验证误差。解决：1)增加数据 2)正则化(L1/L2/Dropout) 3)早停(Early Stopping) 4)数据增强 5)简化模型 6)Ensemble。Dropout=随机丢弃神经元→强制每个神经元学会鲁棒特征。' },
      { front: 'RNN梯度消失 vs Transformer的自注意力为什么没有这个问题？', back: 'RNN通过时间步逐层传递→梯度连乘→指数衰减(梯度消失)。Transformer自注意力：每个位置直接关注所有其他位置(QK^T矩阵)→O(1)的路径长度→梯度可以直接流动→无梯度消失。Attention is all you need。' },
      { front: '什么是 Embedding？', back: 'Embedding=将离散的token ID映射到连续的稠密向量。语义相似的词→向量距离近。维度d通常128-4096。训练过程中自动学习。Word2Vec(静态)→BERT(上下文相关)。Embedding是NLP的"像素"。' },
      { front: 'PyTorch 的 model.train() 和 model.eval() 有什么区别？', back: 'model.train(): 启用Dropout(随机丢弃神经元)和BatchNorm(使用batch统计量)。model.eval(): 禁用Dropout(全部神经元激活)和BatchNorm(使用全局统计量running mean/var)。忘记切换=验证结果不准确。' },
      { front: 'RAG (Retrieval-Augmented Generation) 的核心流程？', back: 'Query→Embedding→Vector DB检索Top-K→拼接Context到Prompt→LLM生成答案。解决：1)知识截止日期问题 2)幻觉问题 3)私有知识访问。关键超参数：chunk大小、检索数量K、相似度阈值。' },
      { front: 'Adam优化器 vs SGD+Momentum 什么时候用什么？', back: 'Adam: 默认首选，超参数不敏感，收敛快，适合NLP/Transformer。SGD+Momentum: 需要精细调lr schedule，但泛化能力可能更好，CV领域SOTA常用。AdamW=Adam+解耦weight decay→Transformer和扩散模型标配。' },
    ],
    tutorPrompts: [
      '请用图形化方式解释 CNN 的卷积操作',
      '对比分析 RNN、LSTM、Transformer 的优劣势',
      '手把手教我从零构建一个 RAG 系统',
      '分析我的模型训练曲线：训练loss下降但验证loss上升',
      '讲解 Attention 的 QKV 直觉，用SQL查询做类比',
    ],
  },

  // ── CFA Level 1 ─────────────────────────────────────────────
  'cfa-l1': {
    title: 'CFA Level 1 知识森林',
    description: 'CFA一级备考完整体系 — 10大科目覆盖金融分析基础知识，目标全球Top 10%通过',
    estimatedWeeks: 20,
    topics: [
      { name: '伦理与职业标准', type: 'concept', summary: 'CFA Ethics — 考试权重15-20%，是决定过与不过的"调节器"。七大准则(Standards I-VII) + GIPS全球投资表现标准。伦理分数低→其他科目分再高也可能fail。', children: ['七大准则 Standards I-VII', 'GIPS标准', '内幕交易案例', '利益冲突处理', '伦理判断框架'] },
      { name: '定量方法', type: 'concept', summary: 'Quantitative Methods — 时间价值(TVM)、描述统计、概率分布、假设检验、相关与回归。金融分析的数学工具箱。', children: ['TVM时间价值', '描述统计与概率', '假设检验', '相关与回归', '技术分析入门'] },
      { name: '经济学', type: 'concept', summary: 'Economics — 微观(供需弹性/市场结构) + 宏观(GDP/通胀/货币政策/财政政策) + 国际经济学。理解市场运行的底层逻辑。', children: ['供需与弹性', '市场结构', 'GDP与经济增长', '货币政策与通胀', '汇率与国际收支'] },
      { name: '财务报表分析', type: 'skill', summary: 'FSA (Financial Statement Analysis) — 考试权重最大科目(13-17%)。三张报表(IS/BS/CFS) + 比率分析 + 盈利质量。Equity分析师的看家本领。', children: ['利润表 Income Statement', '资产负债表 Balance Sheet', '现金流量表 Cash Flow', '杜邦分析 DuPont', '盈利质量分析'] },
      { name: '公司金融', type: 'concept', summary: 'Corporate Finance — 资本预算(NPV/IRR/Payback)、资本成本(WACC)、杠杆(经营杠杆+财务杠杆)、营运资本管理、公司治理。', children: ['NPV与IRR', 'WACC加权平均资本成本', '杠杆分析 DOL/DFL', '股利政策', '公司治理'] },
      { name: '权益投资', type: 'skill', summary: 'Equity Investments — 市场组织/指数/有效市场假说(EMH) + 行业分析 + 估值模型(DDM/Gordon Growth/相对估值/FCF模型)。', children: ['有效市场假说 EMH', 'DDM股利折现模型', '相对估值 PE/PB/PS', 'FCF自由现金流估值', '行业与公司分析'] },
      { name: '固定收益', type: 'skill', summary: 'Fixed Income — 债券定价 + 收益率(YTM/Spot/Forward) + 久期(Duration/Convexity) + 信用分析 + ABS/MBS。固定收益是CFA最难但最重要的模块之一。', children: ['债券定价基础', '收益率曲线 Yield Curve', '久期与凸性 Duration', '信用分析 Credit Risk', '资产证券化 ABS/MBS'] },
      { name: '衍生品', type: 'concept', summary: 'Derivatives — Forward/Futures/Swap/Option的定价与交易策略。Put-Call Parity, Option Greeks, 套利定价。高阶金融工具的基础。', children: ['远期与期货 Forward/Future', '期权基础 Option', 'Put-Call Parity', '期权策略', 'Swap互换'] },
      { name: '另类投资', type: 'topic', summary: 'Alternative Investments — 对冲基金/私募股权/房地产/大宗商品/基础设施。传统股债之外的资产配置选项。', children: ['对冲基金策略', '私募股权 PE/VC', '房地产投资 REITs', '大宗商品', '风险与收益特征'] },
      { name: '投资组合管理', type: 'skill', summary: 'Portfolio Management — MPT现代投资组合理论 + CAPM + 多因子模型 + 资产配置 + 业绩归因。CFA的知识最终落到这里——构建投资组合。', children: ['MPT与有效前沿', 'CAPM资本资产定价', '多因子模型', 'SAA/TAA资产配置', '业绩归因 Brinson'] },
    ],
    resources: [
      { title: 'CFA Institute 官方教材', type: 'book', url: 'https://www.cfainstitute.org/programs/cfa/curriculum', description: '6卷官方教材，覆盖所有Learning Outcome Statements (LOS)', forTopic: '伦理与职业标准' },
      { title: 'Kaplan Schweser Notes', type: 'book', url: 'https://www.schweser.com/cfa/level-1', description: '精简版备考笔记，知识点浓缩，配Qbank题库', forTopic: '财务报表分析' },
      { title: 'Mark Meldrum — CFA L1 (YouTube)', type: 'video', url: 'https://www.youtube.com/@MarkMeldrum', description: '免费视频精讲每个LOS，适合视觉学习者替代阅读教材', forTopic: '权益投资' },
      { title: 'CFA Level 1 — UWorld Finance', type: 'course', url: 'https://finance.uworld.com/cfa/', description: '高质量题库+解析，每题附带LOS关联和难度标记', forTopic: '定量方法' },
      { title: 'Aswath Damodaran — Valuation', type: 'website', url: 'https://pages.stern.nyu.edu/~adamodar/', description: '估值大师的免费资源（课程/模型/数据），权益+公司金融最佳补充', forTopic: '权益投资' },
      { title: '300Hours CFA Guide', type: 'website', url: 'https://300hours.com/cfa-level-1/', description: 'CFA备考社区，学习计划模板、经验分享、进度跟踪', forTopic: '定量方法' },
    ],
    notes: [
      { title: '杜邦分析 DuPont Analysis 完整拆解', topic: '财务报表分析', body: `DuPont Analysis = ROE的分解框架，理解公司盈利驱动因素。

【基础公式】
ROE = Net Income / Shareholders' Equity

【三步分解 (Standard DuPont)】
ROE = (NI/Sales) × (Sales/Assets) × (Assets/Equity)
     = Profit Margin × Asset Turnover × Equity Multiplier
     = 利润率 × 周转率 × 杠杆倍数

【五步分解 (Extended DuPont)】
ROE = (NI/EBT) × (EBT/EBIT) × (EBIT/Sales) × (Sales/Assets) × (Assets/Equity)
     = Tax Burden × Interest Burden × Operating Margin × Turnover × Leverage

【解读示例】
公司A: ROE=20% = 15%PM × 0.5AT × 2.67EM → 高利润低周转(奢侈品)
公司B: ROE=20% = 3%PM × 2.5AT × 2.67EM → 低利润高周转(超市)
→ 相同的ROE，完全不同的商业模式！

【分析要点】
• Equity Multiplier升高 ≠ 坏事 → 如果借债成本<收益率则增加价值
• Profit Margin下降 + Turnover上升 → 可能在降价促销
• 跨行业比较用3步，同行业内部分析用5步`, tags: ['DuPont', 'ROE', 'FSA', '分析'] },
      { title: 'CAPM 资本资产定价模型', topic: '投资组合管理', body: `CAPM (Capital Asset Pricing Model) — 单因子定价模型，连接风险与预期回报。

【核心公式】
E(Ri) = Rf + βi × [E(Rm) - Rf]

• Rf: 无风险利率(10-Year Treasury)
• βi: 资产i的系统性风险暴露
• E(Rm) - Rf: 市场风险溢价(Market Risk Premium)

【β 的解读】
β = Cov(Ri, Rm) / Var(Rm)
• β=1: 与市场同步波动(大盘股)
• β>1: 比市场波动更大(成长股/科技股)
• β<1: 比市场波动更小(公用事业/消费必需品)
• β=0: 与市场无关(无风险资产)
• β<0: 与市场反向(黄金？实际中很少完全为负)

【CAPM 假设 (局限性来源)】
1. 投资者理性、风险厌恶
2. 完美市场(无税/无交易成本)
3. 所有人同质预期
4. 可以无风险利率无限借贷
→ 现实中这些假设都不完全成立，但CAPM作为基准模型仍有价值

【SML vs CML】
• SML (Security Market Line): E(R)=Rf+β×[E(Rm)-Rf] → 用β做x轴
• CML (Capital Market Line): E(Rp)=Rf+σp×[(E(Rm)-Rf)/σm] → 用σ做x轴
• CML只适用于有效投资组合，SML适用于所有资产`, tags: ['CAPM', '定价', 'β', '组合管理'] },
      { title: '久期 Duration 与债券价格敏感性', topic: '固定收益', body: `Duration = 债券价格对利率变化的敏感度。固定收益最核心的概念。

【Modified Duration】
ΔP/P ≈ -Modified Duration × Δy

如果Modified Duration=7.5，利率上升1%(100bp)，价格下跌约7.5%

【Macaulay Duration】
加权平均回款时间。Zero-coupon bond: Duration = Maturity。Coupon bond: Duration < Maturity(因为期间有现金流)。

【有效久期 Effective Duration】
适用于嵌含权债券(可赎回/可回售)。现金流不确定 → 用利率情景模拟。

【Duration 的决定因素】
• Coupon Rate ↑ → Duration ↓ (钱回来得更快)
• YTM ↑ → Duration ↓ (远期现金流现值权重降低)
• Maturity ↑ → Duration ↑ (最后一笔钱更远)
• 零息债券的Duration = Maturity (上限)

【凸性 Convexity】
Duration近似是线性的，但实际债券价格-利率关系是曲线的。
凸性 = 对Duration近似的修正。
• ΔP/P ≈ -MD×Δy + 0.5×Convexity×(Δy)²
• 凸性越大 → Duration在利率大变动时越不准确 → 对投资者越有利(涨多跌少)

【实战记忆】
• 利率下降 → 债券价格上升 → 想持有高Duration债券
• 利率上升 → 债券价格下降 → 缩短Duration(降久期)防御
• Duration单位=年。Modified Duration=7.5 → 看成7.5年的利率风险暴露`, tags: ['Duration', 'Convexity', '固定收益', '债券'] },
      { title: 'NPV vs IRR 资本预算决策', topic: '公司金融', body: `NPV (净现值) 和 IRR (内部收益率) 是资本预算的两大工具。

【NPV — 净现值法】
NPV = Σ [CFt / (1+r)^t] - Initial Investment
决策规则: NPV>0 → 接受项目
• 以货币单位衡量价值创造
• r = 要求回报率(通常是WACC)
• 优点: 直接衡量股东价值增加
• 缺点: 需要提前确定折现率

【IRR — 内部收益率法】
0 = Σ [CFt / (1+IRR)^t] - Initial Investment
决策规则: IRR > Required Return → 接受项目
• 使NPV=0的折现率
• 优点: 直观，百分比容易理解
• 缺点:
  1. Multiple IRR: 现金流符号变换多次时可能有多个IRR
  2. No IRR: 某些现金流模式无实根
  3. Reinvestment assumption: 假设中间现金流以IRR再投资(不现实)

【NPV vs IRR 冲突 (互斥项目)】
当项目规模不同或现金流时间分布不同时，NPV和IRR可能给出相反排名：
→ 选NPV大的！NPV是价值创造的直接度量。
→ 互斥项目中，IRR是"回报率"，NPV是"创造多少钱"。

【交叉率 Cross-Over Rate】
两个项目NPV曲线相交的折现率。
r < cross-over rate → 倾向于后期现金流多的项目
r > cross-over rate → 倾向于前期现金流多的项目

【MIRR 修正内部收益率】
用WACC折现负现金流，用WACC复利正现金流到终点，求单一IRR。
解决Multiple IRR和再投资假设问题。`, tags: ['NPV', 'IRR', '资本预算', '公司金融'] },
    ],
    learningPath: [
      { phase: 'Phase 1: Ethics + Quant', duration: '4周', tasks: ['读完CFA Standards of Practice Handbook', '掌握TVM/概率/假设检验/回归', 'Qbank刷题每日30题', '构建公式卡组（Anki/闪卡）'], topics: ['伦理与职业标准', '定量方法'] },
      { phase: 'Phase 2: 核心科目 FSA + Equity + FI', duration: '8周', tasks: ['三表联动+比率分析+盈利质量(DuPont)', '权益估值模型(DDM/FCF/Multiples)', '固收定价+久期+收益率曲线', '每个Reading完成后立即刷对应Qbank'], topics: ['财务报表分析', '权益投资', '固定收益'] },
      { phase: 'Phase 3: 补充科目', duration: '4周', tasks: ['经济学+公司金融+投资组合管理', '衍生品+另类投资(集中记忆公式)', '跨科目联动练习(如用FSA数据做Equity估值)'], topics: ['经济学', '公司金融', '投资组合管理', '衍生品', '另类投资'] },
      { phase: 'Phase 4: Mock冲刺', duration: '4周', tasks: ['每周2套Mock(240题/套，严格计时)', '错题分类→针对弱项回顾教材', '公式/概念闪卡每日复习', 'CFAI官网Mock至少完成3套'], topics: ['伦理与职业标准', '财务报表分析', '权益投资', '固定收益'] },
    ],
    flashcards: [
      { front: 'Modified Duration 公式？', back: 'Modified Duration = Macaulay Duration / (1 + YTM/n)。ΔP/P ≈ -ModDur × Δy。含义：利率变化1%，债券价格变化的百分比(近似)。' },
      { front: 'NPV 和 IRR 冲突时选哪个？为什么？', back: '选NPV更大的。因为NPV直接衡量项目为股东创造的价值(以货币为单位)，而IRR是百分比回报率，不体现规模。NPV假设中间现金流以要求回报率再投资(更合理)，IRR假设以IRR再投资(偏高)。' },
      { front: 'CFA 七大伦理准则 (Standards I-VII) 是什么？', back: 'I: Professionalism(专业性)—知法守法/独立客观/不误导。II: Integrity of Capital Markets(资本市场诚信)—不内幕交易/不操纵。III: Duties to Clients(对客户)—忠诚审慎/公平对待/适合性/保密。IV: Duties to Employers(对雇主)—忠诚/不竞争。V: Investment Analysis(投资分析)—勤勉/合理基础/记录。VI: Conflicts of Interest(利益冲突)—披露。VII: Responsibilities as CFA Member(CFA成员责任)。' },
      { front: 'WACC 公式？', back: 'WACC = (E/V)×Re + (D/V)×Rd×(1-t) + (P/V)×Rp。E=权益市值，D=债务市值，P=优先股市值，V=E+D+P。Re用CAPM算，Rd用YTM，t=边际税率。WACC是公司的要求回报率(折现FCF用)。' },
      { front: 'Put-Call Parity 公式？', back: 'C + PV(X) = P + S。Call+行权价现值=Put+标的价格。如果等式不成立→存在套利机会。European options on non-dividend paying stocks。这是所有期权定价关系的基础。' },
      { front: 'Efficient Market Hypothesis 三种形式？', back: 'Weak-form: 价格反映所有历史交易信息→技术分析无效。Semi-strong: 价格反映所有公开信息→基本面分析无效(只有内幕信息可获利)。Strong-form: 价格反映所有信息(公开+内幕)→连内幕交易都无法获利。实证支持weak和semi-strong，strong被证伪。' },
    ],
    tutorPrompts: [
      '用简单例子解释久期Duration—假设我是一个买房者而不是金融从业者',
      '对比分析 DDM、DCF、相对估值(P/E)三种Equity估值方法的适用范围',
      '给我3道CFA级别NPV/IRR计算题，我做完后批改',
      '讲解CFA七大伦理标准中跟投研最相关的Standard V',
    ],
  },

  // ── TOEFL 100+ (缩略版，保持精简) ──────────────────────────
  'toefl-100': {
    title: 'TOEFL 100+ 知识森林',
    description: '托福高分备考体系 — 阅读/听力/口语/写作四大模块，学术英语能力全面提升',
    estimatedWeeks: 10,
    topics: [
      { name: '阅读策略', type: 'skill', summary: 'TOEFL Reading — 3-4篇学术文章，每篇10题，54-72分钟。文章来自大学教科书(自然科学/社科/人文)。10种题型：事实信息/推理/词汇/句子简化/插入句子/总结等。', children: ['事实信息题', '推理题', '词汇题', '句子简化', '总结题'] },
      { name: '听力笔记法', type: 'skill', summary: 'TOEFL Listening — 3-4讲座(5-6分钟)+2-3对话(3分钟)，不回头听，边听边记笔记答题。关键：信号词→速记符号→预测出题点。', children: ['讲座信号词', '速记符号系统', '对话场景分类', '态度题识别'] },
      { name: '口语独立任务', type: 'skill', summary: 'Speaking Task 1 (Independent) — 15s准备+45s回答。个人观点/经历类。模板：Opinion+Reason1+Detail+Reason2+Detail。流畅度>复杂度。', children: ['多选一类话题', '同意不同意话题', '偏好类话题', '三选一话题'] },
      { name: '口语综合任务', type: 'skill', summary: 'Speaking Task 2-4 (Integrated) — 读→听→说。Task2校园场景，Task3学术概念+例子，Task4学术讲座总结。信息整合>观点表达。', children: ['校园通知讨论', '学术概念举例', '讲座总结模板'] },
      { name: '综合写作', type: 'skill', summary: 'Writing Task 1 (Integrated) — 3分钟阅读+2分钟听力→20分钟写作。阅读与听力通常观点相反。模板：3段body每段=阅读观点+听力反驳+细节。', children: ['阅读笔记策略', '听力反驳识别', '对比结构模板'] },
      { name: '学术讨论写作', type: 'skill', summary: 'Writing Task 2 (Academic Discussion) — 2023新题型。读教授问题+学生回复→10分钟写100词以上发表自己的观点。取代原独立写作。', children: ['快速理解材料', '观点构建法', '100词极简模板'] },
      { name: '学术词汇', type: 'topic', summary: 'TOEFL词汇量目标8000-10000。AWL 570词+学科词汇(生物/地质/天文/历史)。用Quizlet/Anki间隔重复。', children: ['AWL核心570词', '自然科学词汇', '社科词汇', '词根词缀法'] },
    ],
    resources: [
      { title: 'Official TOEFL iBT Tests (Vol.1-2)', type: 'book', url: 'https://www.ets.org/toefl/test-takers/ibt/prepare/official-guide.html', description: 'ETS官方真题集，每册5套完整模考，最接近真实考试', forTopic: '阅读策略' },
      { title: 'TST Prep — YouTube', type: 'video', url: 'https://www.youtube.com/@TSTPrep', description: '免费技巧视频+口语模板，更新Academic Discussion新题型', forTopic: '口语独立任务' },
      { title: 'TOEFL Bank', type: 'website', url: 'https://www.toeflbank.com/', description: '免费在线模考+AI口语评分，韩国团队开发，模拟真实考试界面', forTopic: '听力笔记法' },
    ],
    notes: [
      { title: '听力速记符号系统', topic: '听力笔记法', body: `TOEFL听力不回头听→笔记质量=答题准确率。

【核心符号(掌握10个即可)】
↑ increase/rise/grow/go up
↓ decrease/fall/drop/decline
→ cause/lead to/result in/so/therefore
∵ because/due to/since
∴ therefore/thus/consequently
= is/means/equals/refers to
≈ approximately/about/around
Δ change/difference
★ important/key/main/crucial
? question/unknown/uncertain
& and/along with/in addition
w/ with
w/o without
e.g. for example
vs against/versus/compared to

【讲座笔记结构】
顶部：Topic + Main Idea
左侧：Key Point 1 → Supporting Detail
      Key Point 2 → Example
      Key Point 3 → Implication
底部：Conclusion / Professor's attitude

【信号词例】
定义: ...is defined as / which means / in other words
列举: first / second / another / additionally
举例: for example / for instance / such as / like
转折: but / however / on the other hand / although
强调: importantly / the key is / it's crucial that / note that
因果: because / therefore / as a result / consequently`, tags: ['听力', '笔记', '符号', 'TOEFL'] },
      { title: '学术讨论写作 10分钟模板', topic: '学术讨论写作', body: `2023新题型 — 10分钟写≥100词回应教授的学术讨论。

【模板框架 (120-150词)】

I agree with [学生名]'s point about [要点]. [1-2句补充自己的角度].

[2-3句展开你的论点，用具体例子或解释]

While [不同观点] has some merit, I believe [你的立场] because [1句总结原因].

【话题类型】
• 教育: online vs in-person / grading policies / curriculum design
• 科技: AI impact / social media / remote work
• 社会: urbanization / environmental policy / public health
• 商业: marketing strategies / consumer behavior / startup culture

【时间分配】
0-1min: 读教授问题+两个学生回复→确定自己立场
1-3min: 写开头+第一个论点
3-6min: 展开第二个论点+例子
6-9min: 写结尾+让步
9-10min: 检查拼写和语法

【高分关键】
• 必须引用至少一个学生的观点(agree/disagree/build on)
• 不能只重复已有观点→必须贡献新内容
• 具体例子>抽象论述
• 不需要开头/结尾的复杂模板→教授和学生都看着呢`, tags: ['写作', 'Academic Discussion', '模板', '新题型'] },
    ],
    learningPath: [
      { phase: '诊断+词汇', duration: '1周', tasks: ['完成一套TPO模考确定分数', '开始AWL+学科词汇打卡', '制作听力速记符号闪卡'], topics: ['学术词汇'] },
      { phase: '阅读听力突破', duration: '4周', tasks: ['阅读每日1篇限时(18min)+错题分析', '听力每日1讲座+1对话精听', '速记符号熟练到肌肉记忆'], topics: ['阅读策略', '听力笔记法'] },
      { phase: '口语写作冲刺', duration: '3周', tasks: ['口语每日1套(T1-4)录音自评', '写作每日1篇Task1/2交替', 'Academic Discussion模板熟练'], topics: ['口语独立任务', '口语综合任务', '综合写作', '学术讨论写作'] },
      { phase: '全真模考', duration: '2周', tasks: ['隔日全真模考(阅读→听力→口语→写作)', '错题分析→针对性复习', '考试日流程演练'], topics: ['阅读策略', '口语综合任务'] },
    ],
    flashcards: [
      { front: 'TOEFL 满分多少？四科分数范围？', back: '满分120分。Reading 0-30, Listening 0-30, Speaking 0-30, Writing 0-30。各科独立计分。100+ = 平均每科25+。' },
      { front: 'TOEFL 新写作题型(2023)是什么？', back: 'Academic Discussion (学术讨论)。替代原Independent Writing。读教授问题+2个学生回复→10分钟写≥100词回应。考察快速阅读+观点表达+论证能力。' },
      { front: '听力讲座不回头听，笔记策略是什么？', back: '只听一遍！笔记策略：1)信号词后必记(but/however/importantly) 2)用速记符号(↑↓→∵★等10个) 3)组织结构>细节(记3-4个main points而非零散数字) 4)教授态度和结论必须记。' },
    ],
    tutorPrompts: ['给我一个Academic Discussion练习，包含教授问题和两个学生回复', '模拟TOEFL Speaking Task 2，给我阅读材料和听力要点', '随机出10个TOEFL高频词汇，测试我的同义替换能力'],
  },
};

// ═══════════════════════════════════════════════════════════════
// Official forest list
// ═══════════════════════════════════════════════════════════════

export function getOfficialForest(key: string): KnowledgeForest | null {
  return OFFICIAL_FORESTS[key] ?? null;
}

export function listOfficialForests(): { key: string; title: string; desc: string }[] {
  return [
    { key: 'ielts-75', title: 'IELTS 7.5+', desc: '雅思高分备考 — 听说读写全科覆盖' },
    { key: 'toefl-100', title: 'TOEFL 100+', desc: '托福高分备考 — 含2023新题型' },
    { key: 'ai-engineer', title: 'AI 工程师', desc: 'Python→ML→DL→NLP→MLOps' },
    { key: 'cfa-l1', title: 'CFA Level 1', desc: 'CFA一级 — 10大科目备考' },
  ];
}

// ═══════════════════════════════════════════════════════════════
// AI Generator — with enrichment pipeline
// ═══════════════════════════════════════════════════════════════

const FOREST_SYSTEM = `你是知识森林生成引擎。根据用户的学习目标，生成完整的知识体系。

输出严格JSON：
{
  "title": "森林标题",
  "description": "一句话描述",
  "estimatedWeeks": 8,
  "topics": [
    {"name":"主题名","type":"concept|skill|book|paper|topic|formula|project","summary":"详细的一句话定义(含关键术语和英文)","children":["子主题1","子主题2","子主题3"]}
  ],
  "resources": [
    {"title":"资源名","type":"book|course|video|paper|website|project","url":"真实URL(尽量给真实链接)","description":"简介(20-40字)","forTopic":"关联主题"}
  ],
  "notes": [
    {"title":"笔记标题","topic":"关联主题","body":"笔记内容(200-400字，结构：核心概念→要点→例子→易错点)","tags":["标签1","标签2"]}
  ],
  "learningPath": [
    {"phase":"阶段名","duration":"2周","tasks":["具体任务"],"topics":["主题"]}
  ],
  "flashcards": [
    {"front":"具体问题","back":"完整答案(含解释和例子)"}
  ],
  "tutorPrompts": ["AI导师引导问题"]
}

要求：
- 10-15个知识主题节点，每个有详细定义和3-5个子主题
- 6-10个学习资源推荐，优先给真实存在的书籍/课程/网站
- 8-12条笔记，每条200-400字，结构化
- 4-6个学习阶段
- 10-15张闪卡，问题具体、答案完整
- 内容具体、准确、可操作
- 中文为主，术语带英文`;

export async function generateForest(query: string): Promise<KnowledgeForest> {
  try {
    const raw = await completeChat([
      { role: "system", content: FOREST_SYSTEM },
      { role: "user", content: `请为以下学习目标生成知识森林：${query}` },
    ], { temperature: 0.5, maxTokens: 4000 });

    const json = extractJson(raw);
    const parsed = JSON.parse(json);

    return {
      title: parsed.title ?? `${query} 知识森林`,
      description: parsed.description ?? "",
      estimatedWeeks: parsed.estimatedWeeks ?? 8,
      topics: parsed.topics ?? [],
      resources: parsed.resources ?? [],
      notes: parsed.notes ?? [],
      learningPath: parsed.learningPath ?? [],
      flashcards: parsed.flashcards ?? [],
      tutorPrompts: parsed.tutorPrompts ?? [],
    };
  } catch {
    return OFFICIAL_FORESTS["ielts-75"];
  }
}

// ═══════════════════════════════════════════════════════════════
// Enrich forest with multi-source web content
// ═══════════════════════════════════════════════════════════════

export async function enrichForestFromWeb(
  topic: string,
  existingForest?: KnowledgeForest
): Promise<KnowledgeForest> {
  try {
    const res = await fetch("/api/forest/enrich", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, type: "all" }),
    });
    if (!res.ok) throw new Error("Enrich API failed");
    const data = await res.json();

    // Merge with existing if provided
    if (existingForest) {
      return {
        ...existingForest,
        topics: [...existingForest.topics, ...(data.topics ?? [])].slice(0, 18),
        resources: [...existingForest.resources, ...(data.resources ?? [])].slice(0, 15),
        notes: [...existingForest.notes, ...(data.notes ?? [])].slice(0, 20),
        flashcards: [...existingForest.flashcards, ...(data.flashcards ?? [])].slice(0, 25),
        learningPath: data.learningPath?.length ? data.learningPath : existingForest.learningPath,
        tutorPrompts: [...existingForest.tutorPrompts, ...(data.tutorPrompts ?? [])].slice(0, 10),
      };
    }

    return {
      title: `${topic} 知识森林`,
      description: `AI生成的多源知识体系`,
      estimatedWeeks: data.estimatedWeeks ?? 8,
      topics: data.topics ?? [],
      resources: data.resources ?? [],
      notes: data.notes ?? [],
      learningPath: data.learningPath ?? [],
      flashcards: data.flashcards ?? [],
      tutorPrompts: data.tutorPrompts ?? [],
    };
  } catch (err) {
    console.error("[forest-generator] enrichForestFromWeb failed:", err);
    return existingForest ?? OFFICIAL_FORESTS["ielts-75"];
  }
}
