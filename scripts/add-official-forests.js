const fs = require("fs");
let f = fs.readFileSync("D:/Claudecoda学习/AI-Learning-OS/lib/ai/forest-generator.ts", "utf8");

const forests = {
  "toefl-100": {
    title: "TOEFL 100+ 知识森林",
    description: "托福高分备考——阅读、听力、口语、写作全覆盖",
    estimatedWeeks: 10,
    topics: [
      { name: "阅读策略", type: "skill", summary: "学术文章速读与题型技巧", children: ["事实信息题", "推理题", "词汇题"] },
      { name: "听力笔记", type: "skill", summary: "讲座与对话关键信息抓取", children: ["信号词", "速记法", "态度题"] },
      { name: "口语独立", type: "skill", summary: "15秒准备45秒回答", children: ["经历类", "观点类", "时间控制"] },
      { name: "综合写作", type: "skill", summary: "阅读+听力→写作整合", children: ["对比结构", "信息整合"] },
      { name: "学术词汇", type: "topic", summary: "AWL核心+学科词汇", children: ["自然科学", "社会科学"] },
    ],
    resources: [
      { title: "Official TOEFL Tests", type: "book", description: "ETS官方真题", forTopic: "阅读策略" },
      { title: "TST Prep", type: "video", description: "免费技巧视频", forTopic: "口语独立" },
    ],
    notes: [
      { title: "听力笔记符号", topic: "听力笔记", body: "上升↑ 下降↓ 导致→ 原因∵ 重要★。掌握10个符号高效记笔记。", tags: ["听力", "笔记"] },
    ],
    learningPath: [
      { phase: "诊断", duration: "1周", tasks: ["完成TPO模考"], topics: ["阅读策略"] },
      { phase: "突破", duration: "6周", tasks: ["每日听力", "每周写作"], topics: ["听力笔记", "综合写作"] },
      { phase: "冲刺", duration: "3周", tasks: ["TPO模考", "错题分析"], topics: ["口语独立"] },
    ],
    flashcards: [{ front: "TOEFL满分？", back: "120分。听说读写各30分。" }],
    tutorPrompts: ["模拟一次TOEFL口语题"],
  },
  "ai-engineer": {
    title: "AI 工程师 知识森林",
    description: "从零到AI工程师的完整学习路径",
    estimatedWeeks: 24,
    topics: [
      { name: "Python编程", type: "skill", summary: "数据处理与算法", children: ["NumPy", "Pandas"] },
      { name: "机器学习", type: "concept", summary: "监督与非监督学习", children: ["回归", "分类", "聚类"] },
      { name: "深度学习", type: "concept", summary: "神经网络与反向传播", children: ["CNN", "RNN", "Transformer"] },
      { name: "NLP", type: "skill", summary: "自然语言处理", children: ["Tokenization", "Embeddings", "LLMs"] },
      { name: "MLOps", type: "skill", summary: "模型部署", children: ["Docker", "FastAPI", "CI/CD"] },
      { name: "数学基础", type: "concept", summary: "线代·概率·优化", children: ["矩阵运算", "梯度下降"] },
    ],
    resources: [
      { title: "CS229 Stanford", type: "course", description: "吴恩达ML", forTopic: "机器学习" },
      { title: "Fast.ai", type: "course", description: "实用DL", forTopic: "深度学习" },
      { title: "HuggingFace", type: "course", description: "NLP实战", forTopic: "NLP" },
    ],
    notes: [
      { title: "Transformer注意力", topic: "深度学习", body: "Q=XWq K=XWk V=XWv。Attention=softmax(QK^T/dk)V。多头并行后concat。", tags: ["Attention"] },
    ],
    learningPath: [
      { phase: "编程+数学", duration: "4周", tasks: ["Python", "线代复习"], topics: ["Python编程", "数学基础"] },
      { phase: "ML+DL", duration: "10周", tasks: ["CS229", "Kaggle"], topics: ["机器学习", "深度学习"] },
      { phase: "专项+工程", duration: "10周", tasks: ["NLP项目", "部署模型"], topics: ["NLP", "MLOps"] },
    ],
    flashcards: [{ front: "过拟合？", back: "训练好测试差。正则化/Dropout/早停/数据增强。" }],
    tutorPrompts: ["讲解反向传播", "CNN vs Transformer"],
  },
  "ml-basics": {
    title: "机器学习基础 知识森林",
    description: "ML核心理论与实践",
    estimatedWeeks: 12,
    topics: [
      { name: "监督学习", type: "concept", summary: "有标签预测建模", children: ["线性回归", "逻辑回归", "决策树", "SVM"] },
      { name: "无监督学习", type: "concept", summary: "无标签模式发现", children: ["K-Means", "PCA", "DBSCAN"] },
      { name: "特征工程", type: "skill", summary: "数据预处理与构建", children: ["归一化", "独热编码", "特征选择"] },
      { name: "模型评估", type: "concept", summary: "性能度量", children: ["交叉验证", "ROC/AUC", "F1-Score"] },
      { name: "集成学习", type: "concept", summary: "组合模型提性能", children: ["Bagging", "Boosting", "XGBoost"] },
    ],
    resources: [
      { title: "Hands-On ML", type: "book", description: "Aurelien Geron", forTopic: "监督学习" },
      { title: "Kaggle", type: "website", description: "竞赛平台", forTopic: "特征工程" },
    ],
    notes: [
      { title: "偏差-方差权衡", topic: "模型评估", body: "高偏差=欠拟合。高方差=过拟合。目标找到最优平衡点。", tags: ["偏差", "方差"] },
    ],
    learningPath: [
      { phase: "理论", duration: "4周", tasks: ["监督/非监督"], topics: ["监督学习", "无监督学习"] },
      { phase: "实战", duration: "4周", tasks: ["Kaggle入门"], topics: ["特征工程", "模型评估"] },
      { phase: "高级", duration: "4周", tasks: ["XGBoost调参"], topics: ["集成学习"] },
    ],
    flashcards: [{ front: "过拟合vs欠拟合", back: "欠拟合=都差。过拟合=训好测差。加数据/正则化。" }],
    tutorPrompts: ["偏差-方差权衡讲解", "特征选择方法"],
  },
  "cs-core": {
    title: "计算机科学核心 知识森林",
    description: "CS四大核心：数据结构、算法、OS、网络",
    estimatedWeeks: 16,
    topics: [
      { name: "数据结构", type: "concept", summary: "数据组织与存储", children: ["数组链表", "树与图", "哈希表", "堆栈"] },
      { name: "算法设计", type: "concept", summary: "问题求解方法论", children: ["排序搜索", "动态规划", "贪心", "分治"] },
      { name: "操作系统", type: "concept", summary: "资源管理", children: ["进程线程", "内存管理", "并发"] },
      { name: "计算机网络", type: "concept", summary: "通信协议栈", children: ["TCP/IP", "HTTP/DNS", "安全"] },
    ],
    resources: [
      { title: "CLRS算法导论", type: "book", description: "算法圣经", forTopic: "算法设计" },
      { title: "CS50 Harvard", type: "course", description: "哈佛CS入门", forTopic: "数据结构" },
    ],
    notes: [
      { title: "时间复杂度", topic: "算法设计", body: "O(1)<O(log n)<O(n)<O(n log n)<O(n^2)<O(2^n)。n=10^6时O(n^2)不可行。", tags: ["复杂度"] },
    ],
    learningPath: [
      { phase: "基础", duration: "4周", tasks: ["语言+数据结构"], topics: ["数据结构"] },
      { phase: "算法", duration: "6周", tasks: ["LeetCode日2题"], topics: ["算法设计"] },
      { phase: "系统", duration: "6周", tasks: ["OS课程"], topics: ["操作系统", "计算机网络"] },
    ],
    flashcards: [{ front: "栈vs队列", back: "栈LIFO后进先出。队列FIFO先进先出。" }],
    tutorPrompts: ["动态规划核心思想", "TCP三次握手"],
  },
  "cfa-l1": {
    title: "CFA Level 1 知识森林",
    description: "CFA一级十大科目体系",
    estimatedWeeks: 20,
    topics: [
      { name: "伦理标准", type: "concept", summary: "CFA道德准则", children: ["七大准则", "GIPS"] },
      { name: "定量方法", type: "concept", summary: "统计与概率", children: ["时间价值", "假设检验"] },
      { name: "财务报表分析", type: "skill", summary: "三表与比率", children: ["利润表", "资产负债表", "杜邦分析"] },
      { name: "公司金融", type: "concept", summary: "资本预算", children: ["NPV/IRR", "WACC"] },
      { name: "权益投资", type: "concept", summary: "股票估值", children: ["DDM", "相对估值"] },
      { name: "固定收益", type: "concept", summary: "债券定价", children: ["久期", "收益率曲线"] },
      { name: "投资组合", type: "skill", summary: "资产配置", children: ["MPT", "CAPM"] },
    ],
    resources: [
      { title: "CFA官方教材", type: "book", description: "CFA Institute", forTopic: "伦理标准" },
      { title: "Kaplan Notes", type: "book", description: "备考精讲", forTopic: "财务报表分析" },
    ],
    notes: [
      { title: "杜邦分析", topic: "财务报表分析", body: "ROE=利润率×周转率×杠杆。三因子驱动。", tags: ["杜邦", "ROE"] },
    ],
    learningPath: [
      { phase: "伦理+定量", duration: "4周", tasks: ["道德记忆"], topics: ["伦理标准", "定量方法"] },
      { phase: "核心科目", duration: "10周", tasks: ["财报深度"], topics: ["财务报表分析", "权益投资"] },
      { phase: "冲刺", duration: "6周", tasks: ["模考刷题"], topics: ["投资组合"] },
    ],
    flashcards: [{ front: "NPV决策规则", back: "NPV=Σ(CFt/(1+r)^t)-初始投资。>0接受。" }],
    tutorPrompts: ["DCF估值流程", "有效市场假说"],
  },
};

// Serialize each forest as JS object literal and insert
let insert = "";
for (const [key, data] of Object.entries(forests)) {
  insert += `\n  '${key}': ${JSON.stringify(data, null, 2)},\n`;
}

// Insert before the closing '};' of OFFICIAL_FORESTS
f = f.replace("  },\n};", "  }," + insert + "};");

// Update listOfficialForests to include all
f = f.replace(
  "return [\n    { key: \"ielts-75\", title: \"IELTS 7.5+\", desc: \"雅思高分备考完整知识体系\" },\n  ];",
  "return [\n    { key: \"ielts-75\", title: \"IELTS 7.5+\", desc: \"雅思高分备考\" },\n    { key: \"toefl-100\", title: \"TOEFL 100+\", desc: \"托福高分备考\" },\n    { key: \"ai-engineer\", title: \"AI工程师\", desc: \"从零到AI工程师\" },\n    { key: \"ml-basics\", title: \"机器学习基础\", desc: \"ML核心理论\" },\n    { key: \"cs-core\", title: \"计算机科学核心\", desc: \"CS四大核心\" },\n    { key: \"cfa-l1\", title: \"CFA Level 1\", desc: \"CFA一级备考\" },\n    { key: \"psych-101\", title: \"心理学入门\", desc: \"心理学主要流派\" },\n  ];",
);

fs.writeFileSync("D:/Claudecoda学习/AI-Learning-OS/lib/ai/forest-generator.ts", f);
console.log("Added 6 official forests + updated list");
