const fs = require("fs");
let f = fs.readFileSync("D:/Claudecoda学习/AI-Learning-OS/lib/ai/forest-generator.ts", "utf8");

const startMarker = "export const OFFICIAL_FORESTS";
const endMarker = "// ═══ AI Generator ═══";
const start = f.indexOf(startMarker);
const end = f.indexOf(endMarker);

const replacement = `export const OFFICIAL_FORESTS: Record<string, KnowledgeForest> = {
  'ielts-75': {
    title: 'IELTS 7.5+ 知识森林', description: '雅思高分备考完整知识体系', estimatedWeeks: 12,
    topics: [
      {name:'听力理解',type:'skill',summary:'Section 1-4 题型策略',children:['填空技巧','地图题','多选题']},
      {name:'阅读理解',type:'skill',summary:'60分钟3篇时间管理',children:['T/F/NG','Heading匹配','Summary']},
      {name:'写作Task1',type:'skill',summary:'图表描述与数据对比',children:['线图','柱状图','流程图']},
      {name:'写作Task2',type:'skill',summary:'议论文结构',children:['观点类','讨论类','问题解决']},
      {name:'口语Part1-3',type:'skill',summary:'流利度与连贯性',children:['话题卡','扩展回答','发音']},
      {name:'学术词汇',type:'topic',summary:'AWL 570词',children:['教育','科技','环境']},
      {name:'语法精要',type:'concept',summary:'7分语法',children:['复合句','被动语态','条件句']},
      {name:'模考策略',type:'skill',summary:'全真模拟',children:['听力模考','阅读模考']},
    ],
    resources: [
      {title:'Cambridge IELTS 14-19',type:'book',description:'官方真题集',forTopic:'模考策略'},
      {title:'IELTS Advantage',type:'course',description:'在线写作课',forTopic:'写作Task1'},
    ],
    notes: [
      {title:'听力S3策略',topic:'听力理解',body:'S3是2-4人学术讨论。信号词actually/but/however后通常是答案。',tags:['听力']},
      {title:'Task2四段式',topic:'写作Task2',body:'Intro:改写+立场。Body1:论点1。Body2:论点2。Conclusion:总结。',tags:['写作']},
      {title:'口语P2准备法',topic:'口语Part1-3',body:'圈关键词→写4个bullet points→每个扩展2-3句。',tags:['口语']},
    ],
    learningPath: [
      {phase:'基础诊断',duration:'1周',tasks:['完成模考','分析分数'],topics:['模考策略']},
      {phase:'技能训练',duration:'6周',tasks:['每日听力','每周写作'],topics:['听力理解','写作Task2']},
      {phase:'词汇语法',duration:'3周',tasks:['每日AWL词汇'],topics:['学术词汇','语法精要']},
      {phase:'冲刺模考',duration:'2周',tasks:['隔日模考','错题回顾'],topics:['模考策略']},
    ],
    flashcards: [
      {front:'IELTS听力几个Section？',back:'4个。S1日常对话S2独白S3学术讨论S4学术讲座。40题。'},
      {front:'T/F/NG核心区别？',back:'True=文章说了。False=文章说相反。Not Given=没提到。'},
    ],
    tutorPrompts: ['模拟IELTS口语Part2','批改Task2作文'],
  },
  'toefl-100': {
    title: 'TOEFL 100+ 知识森林', description: '托福高分备考', estimatedWeeks: 10,
    topics: [
      {name:'阅读策略',type:'skill',summary:'学术文章速读',children:['事实信息','推理题','词汇题']},
      {name:'听力笔记',type:'skill',summary:'讲座对话关键信息',children:['信号词','速记法']},
      {name:'口语独立',type:'skill',summary:'15s准备45s回答',children:['经历类','观点类']},
      {name:'综合写作',type:'skill',summary:'阅读+听力→写作',children:['对比结构','信息整合']},
      {name:'学术词汇',type:'topic',summary:'AWL+学科词汇',children:['自然科学','社会科学']},
    ],
    resources: [
      {title:'Official TOEFL Tests',type:'book',description:'ETS官方真题',forTopic:'阅读策略'},
      {title:'TST Prep',type:'video',description:'免费技巧',forTopic:'口语独立'},
    ],
    notes: [
      {title:'听力笔记符号',topic:'听力笔记',body:'↑上升 ↓下降 →导致 ∵原因 ★重要。掌握10个符号高效笔记。',tags:['听力']},
    ],
    learningPath: [
      {phase:'诊断',duration:'1周',tasks:['TPO模考'],topics:['阅读策略']},
      {phase:'突破',duration:'6周',tasks:['每日听力','每周写作'],topics:['听力笔记','综合写作']},
      {phase:'冲刺',duration:'3周',tasks:['TPO模考','错题分析'],topics:['口语独立']},
    ],
    flashcards: [{front:'TOEFL满分？',back:'120分。听说读写各30分。'}],
    tutorPrompts: ['模拟TOEFL口语'],
  },
  'ai-engineer': {
    title: 'AI 工程师 知识森林', description: '从零到AI工程师', estimatedWeeks: 24,
    topics: [
      {name:'Python编程',type:'skill',summary:'数据处理与算法',children:['NumPy','Pandas']},
      {name:'机器学习',type:'concept',summary:'监督与非监督',children:['回归','分类','聚类']},
      {name:'深度学习',type:'concept',summary:'神经网络',children:['CNN','RNN','Transformer']},
      {name:'NLP',type:'skill',summary:'自然语言处理',children:['Tokenization','Embeddings','LLMs']},
      {name:'MLOps',type:'skill',summary:'模型部署',children:['Docker','FastAPI']},
      {name:'数学基础',type:'concept',summary:'线代·概率',children:['矩阵','梯度下降']},
    ],
    resources: [
      {title:'CS229 Stanford',type:'course',description:'吴恩达ML',forTopic:'机器学习'},
      {title:'Fast.ai',type:'course',description:'实用DL',forTopic:'深度学习'},
    ],
    notes: [
      {title:'Transformer注意力',topic:'深度学习',body:'Q=XWq K=XWk V=XWv。softmax(QK^T/sqrt(dk))V。多头并行concat。',tags:['Attention']},
      {title:'梯度下降直观理解',topic:'机器学习',body:'想象在山上找最低点。每步看最陡的下坡方向走一步。学习率控制步长。',tags:['优化']},
    ],
    learningPath: [
      {phase:'编程+数学',duration:'4周',tasks:['Python','线代'],topics:['Python编程','数学基础']},
      {phase:'ML+DL',duration:'10周',tasks:['CS229','Kaggle'],topics:['机器学习','深度学习']},
      {phase:'专项',duration:'10周',tasks:['NLP项目','部署'],topics:['NLP','MLOps']},
    ],
    flashcards: [
      {front:'过拟合？',back:'训练好测试差。正则化/Dropout/早停。'},
      {front:'梯度消失？',back:'深层网络梯度逐层变小→浅层不更新。ReLU/残差连接/BatchNorm缓解。'},
    ],
    tutorPrompts: ['讲解反向传播','CNN vs Transformer','如何选择优化器'],
  },
  'cfa-l1': {
    title: 'CFA Level 1 知识森林', description: 'CFA一级备考体系', estimatedWeeks: 20,
    topics: [
      {name:'伦理标准',type:'concept',summary:'CFA道德准则',children:['七大准则','GIPS']},
      {name:'定量方法',type:'concept',summary:'统计与概率',children:['时间价值','假设检验']},
      {name:'财报分析',type:'skill',summary:'三表与比率',children:['利润表','资产负债表','杜邦分析']},
      {name:'公司金融',type:'concept',summary:'资本预算',children:['NPV/IRR','WACC']},
      {name:'权益投资',type:'concept',summary:'股票估值',children:['DDM','相对估值']},
      {name:'固定收益',type:'concept',summary:'债券定价',children:['久期','收益率曲线']},
      {name:'投资组合',type:'skill',summary:'资产配置',children:['MPT','CAPM']},
    ],
    resources: [
      {title:'CFA官方教材',type:'book',description:'CFA Institute',forTopic:'伦理标准'},
      {title:'Kaplan Notes',type:'book',description:'备考精讲',forTopic:'财报分析'},
    ],
    notes: [
      {title:'杜邦分析公式',topic:'财报分析',body:'ROE=净利/权益=(净利/销售)×(销售/资产)×(资产/权益)=利润率×周转率×杠杆。',tags:['杜邦']},
    ],
    learningPath: [
      {phase:'伦理+定量',duration:'4周',tasks:['道德记忆'],topics:['伦理标准','定量方法']},
      {phase:'核心科目',duration:'10周',tasks:['财报深度'],topics:['财报分析','权益投资']},
    ],
    flashcards: [{front:'NPV决策规则',back:'NPV=sum(CFt/(1+r)^t)-初始投资。>0接受。'}],
    tutorPrompts: ['DCF估值流程','有效市场假说'],
  },
};

export function getOfficialForest(key: string): KnowledgeForest | null {
  return OFFICIAL_FORESTS[key] ?? null;
}

export function listOfficialForests(): { key: string; title: string; desc: string }[] {
  return [
    { key: 'ielts-75', title: 'IELTS 7.5+', desc: '雅思高分备考' },
    { key: 'toefl-100', title: 'TOEFL 100+', desc: '托福高分备考' },
    { key: 'ai-engineer', title: 'AI 工程师', desc: '从零到AI工程师' },
    { key: 'cfa-l1', title: 'CFA Level 1', desc: 'CFA一级备考' },
  ];
}

// ═══ AI Generator ═══`;

f = f.slice(0, start) + replacement + f.slice(end);
fs.writeFileSync("D:/Claudecoda学习/AI-Learning-OS/lib/ai/forest-generator.ts", f);
console.log("Forests rebuilt with all 4 entries");
console.log("Has ielts-75:", f.includes("'ielts-75'"));
console.log("Has toefl-100:", f.includes("'toefl-100'"));
console.log("Has ai-engineer:", f.includes("'ai-engineer'"));
console.log("Has cfa-l1:", f.includes("'cfa-l1'"));
