import type {
  ActivityEvent,
  DashboardStats,
  Flashcard,
  Note,
  QuizAttempt,
  Reflection,
  SubjectId,
  SubjectProgress,
  Task,
  WeeklyGoal,
} from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// Seed data layer. Every getter is async to mirror the eventual
// Supabase data layer — components already `await` these, so the
// swap to real queries is a one-file change with zero UI churn.
// The `seed*` consts are also exported synchronously so the
// client persistence store can hydrate localStorage on first run.
// ─────────────────────────────────────────────────────────────

import { getStoredSubjects, type SubjectDef } from "@/lib/subjects";

// Dynamic subject meta lookup. Falls back to seed defaults if subject not found.
export function subjectMeta(id: string): SubjectDef {
  const stored = getStoredSubjects();
  const found = stored.find(s => s.id === id);
  if (found) return found;
  // Client-side fallback via localStorage
  try {
    const all = typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("mango-subjects-v1") ?? "[]")
      : stored;
    return all.find((s: SubjectDef) => s.id === id) ?? { id, label: id, short: id.slice(0,4), color: "var(--chart-1)" };
  } catch { return { id, label: id, short: id.slice(0,4), color: "var(--chart-1)" }; }
}

// Legacy alias — components pass subjectMeta(id).color etc.
export const SUBJECT_META = new Proxy({} as Record<string, SubjectDef>, {
  get(_t, key: string) {
    return subjectMeta(key);
  },
});

export const seedTasks: Task[] = [
  { id: "t1", title: "复习 Transformer 注意力机制推导", subject: "ai", done: true, priority: "high", dueLabel: "Today 09:00", estimatedMin: 45 },
  { id: "t2", title: "微观经济学：消费者剩余习题 1-12", subject: "economics", done: true, priority: "medium", dueLabel: "Today 11:00", estimatedMin: 40 },
  { id: "t3", title: "DCF 估值模型：搭建三表联动", subject: "finance", done: false, priority: "high", dueLabel: "Today 14:00", estimatedMin: 60 },
  { id: "t4", title: "线性代数：特征值与特征向量证明", subject: "math", done: false, priority: "high", dueLabel: "Today 16:00", estimatedMin: 50 },
  { id: "t5", title: "雅思精读：The Economist 一篇 + 生词卡", subject: "english", done: false, priority: "medium", dueLabel: "Today 20:00", estimatedMin: 35 },
  { id: "t6", title: "复盘今日错题，更新间隔重复队列", subject: "ai", done: false, priority: "low", dueLabel: "Today 21:30", estimatedMin: 20 },
];

export const seedWeeklyGoals: WeeklyGoal[] = [
  { id: "g1", title: "AI 深度学习专题", subject: "ai", current: 6.5, target: 10, unit: "hrs" },
  { id: "g2", title: "金融建模练习", subject: "finance", current: 4, target: 6, unit: "hrs" },
  { id: "g3", title: "数学证明题", subject: "math", current: 18, target: 30, unit: "problems" },
  { id: "g4", title: "雅思词汇", subject: "english", current: 220, target: 350, unit: "cards" },
];

export const seedSubjectProgress: SubjectProgress[] = [
  { subject: "ai", masteryPct: 72, weeklyMinutes: 390 },
  { subject: "economics", masteryPct: 64, weeklyMinutes: 210 },
  { subject: "finance", masteryPct: 58, weeklyMinutes: 240 },
  { subject: "math", masteryPct: 81, weeklyMinutes: 300 },
  { subject: "english", masteryPct: 69, weeklyMinutes: 180 },
];

export const seedActivity: ActivityEvent[] = [
  { id: "a1", kind: "achievement", label: "解锁成就「7 日连续学习」", timeLabel: "1h ago" },
  { id: "a2", kind: "quiz", label: "完成 AI 测验，正确率 85%", subject: "ai", timeLabel: "2h ago" },
  { id: "a3", kind: "note", label: "新建笔记《消费者剩余 vs 生产者剩余》", subject: "economics", timeLabel: "4h ago" },
  { id: "a4", kind: "study", label: "专注学习线性代数 50 分钟", subject: "math", timeLabel: "6h ago" },
  { id: "a5", kind: "reflection", label: "提交每日反思", timeLabel: "Yesterday" },
];

export const seedNotes: Note[] = [
  { id: "n1", title: "Transformer 自注意力机制", subject: "ai", body: "Q/K/V 的本质是可学习的检索系统：Query 去和所有 Key 算相似度，softmax 归一化后对 Value 加权求和。多头注意力允许多个表示子空间。", tags: ["深度学习", "NLP", "注意力机制", "Transformer"], updatedLabel: "2h ago" },
  { id: "n2", title: "消费者剩余 vs 生产者剩余", subject: "economics", body: "消费者剩余 = 需求曲线下方、价格上方的面积；生产者剩余 = 价格下方、供给曲线上方的面积。总剩余最大化时市场效率最高。", tags: ["微观经济", "市场效率", "供需曲线", "福利经济学"], updatedLabel: "5h ago" },
  { id: "n3", title: "DCF 三表联动逻辑", subject: "finance", body: "利润表的净利润 → 现金流量表起点 → 影响资产负债表的现金与未分配利润，三表通过勾稽关系闭环。", tags: ["估值", "建模", "DCF", "财务报表"], updatedLabel: "1d ago" },
  { id: "n4", title: "特征值与特征向量的几何意义", subject: "math", body: "特征向量是线性变换下方向不变的向量，特征值是其被拉伸的倍数。对角化可以将矩阵分解为特征值矩阵。", tags: ["线性代数", "特征值", "对角化", "矩阵分解"], updatedLabel: "2d ago" },
  { id: "n5", title: "反向传播算法推导", subject: "ai", body: "链式法则逐层计算梯度。输出层误差 → 隐藏层梯度 → 参数更新。关键理解：梯度消失来源于sigmoid导数饱和。", tags: ["深度学习", "反向传播", "梯度下降", "优化算法"], updatedLabel: "1d ago" },
  { id: "n6", title: "市场失灵与外部性", subject: "economics", body: "外部性导致私人成本≠社会成本。负外部性→过度生产，正外部性→生产不足。庇古税和科斯定理是两种解决方案。", tags: ["微观经济", "市场失灵", "外部性", "公共政策"], updatedLabel: "3d ago" },
  { id: "n7", title: "CAPM 资本资产定价模型", subject: "finance", body: "E(Ri) = Rf + βi(E(Rm)-Rf)。β衡量系统性风险，α衡量超额收益。CAPM假设市场有效、无交易成本。", tags: ["估值", "CAPM", "风险定价", "投资组合"], updatedLabel: "2d ago" },
  { id: "n8", title: "奇异值分解 SVD", subject: "math", body: "A = UΣV^T。U的列是左奇异向量，V的列是右奇异向量，Σ对角线是奇异值。SVD适用于任何矩阵，是最重要的矩阵分解。", tags: ["线性代数", "SVD", "矩阵分解", "降维"], updatedLabel: "4d ago" },
];

export const seedReflections: Reflection[] = [
  { id: "r1", dateLabel: "6月3日", mood: "专注", body: "Transformer 推导终于打通，注意力机制不再是黑盒。" },
  { id: "r2", dateLabel: "6月2日", mood: "充实", body: "金融建模进度超预期，但数学证明拖了后腿，明天补。" },
  { id: "r3", dateLabel: "6月1日", mood: "疲惫", body: "状态一般，雅思阅读速度还需提升，调整作息。" },
];

// Seed flashcards. dueOn uses fixed past dates so cards start "due"
// on first run, demonstrating the review flow immediately. After the
// first review the SM-2 scheduler takes over with real future dates.
export const seedFlashcards: Flashcard[] = [
  { id: "f1", deck: "AI 术语速记", subject: "ai", front: "什么是过拟合 (Overfitting)？", back: "模型在训练集上表现好、在新数据上差，即学到了噪声而非泛化规律。缓解：正则化、Dropout、早停、更多数据。", ease: 2.5, intervalDays: 0, repetitions: 0, dueOn: "2020-01-01" },
  { id: "f2", deck: "AI 术语速记", subject: "ai", front: "梯度消失 (Vanishing Gradient) 是什么？", back: "深层网络反向传播时梯度逐层变小趋近 0，浅层几乎不更新。缓解：ReLU、残差连接、BatchNorm。", ease: 2.5, intervalDays: 0, repetitions: 0, dueOn: "2020-01-01" },
  { id: "f3", deck: "金融公式卡", subject: "finance", front: "CAPM 模型公式？", back: "E(Ri) = Rf + βi · (E(Rm) − Rf)。预期收益 = 无风险利率 + β × 市场风险溢价。", ease: 2.5, intervalDays: 0, repetitions: 0, dueOn: "2020-01-01" },
  { id: "f4", deck: "金融公式卡", subject: "finance", front: "DCF 估值的核心逻辑？", back: "企业价值 = 未来自由现金流按 WACC 折现之和。核心：现金流预测 + 折现率 + 永续增长率。", ease: 2.5, intervalDays: 0, repetitions: 0, dueOn: "2020-01-01" },
  { id: "f5", deck: "数学概念", subject: "math", front: "特征值与特征向量的定义？", back: "若 Av = λv（v≠0），则 λ 是特征值、v 是特征向量。几何意义：变换下方向不变、仅被拉伸 λ 倍。", ease: 2.5, intervalDays: 0, repetitions: 0, dueOn: "2020-01-01" },
  { id: "f6", deck: "雅思核心词汇", subject: "english", front: "sustainable (adj.)", back: "可持续的；能维持的。例：sustainable development 可持续发展。同义：viable, enduring。", ease: 2.5, intervalDays: 0, repetitions: 0, dueOn: "2020-01-01" },
  { id: "f7", deck: "经济学原理", subject: "economics", front: "价格弹性 (Price Elasticity) 衡量什么？", back: "需求量对价格变化的敏感度 = %ΔQ / %ΔP。|E|>1 富有弹性，<1 缺乏弹性。", ease: 2.5, intervalDays: 0, repetitions: 0, dueOn: "2020-01-01" },
];

export const seedStats: DashboardStats = {
  streakDays: 7,
  totalXp: 4820,
  level: 8,
  xpForCurrentLevel: 4500,
  xpToNextLevel: 5200,
  minutesToday: 95,
  minutesGoal: 180,
  tasksDoneToday: 2,
  tasksTotalToday: 6,
};

// Seed quiz history — gives the weakness analysis real content on first
// run. Topics + accuracies mirror the original static weak areas so the
// Exam Mode panel looks identical until the user takes their own quizzes.
export const seedQuizAttempts: QuizAttempt[] = [
  { id: "qa1", subject: "math", topic: "多元函数极值", total: 12, correct: 5, createdAt: "2026-06-02T10:00:00Z" },
  { id: "qa2", subject: "economics", topic: "市场失灵与外部性", total: 10, correct: 5, createdAt: "2026-06-02T14:00:00Z" },
  { id: "qa3", subject: "ai", topic: "反向传播推导", total: 11, correct: 6, createdAt: "2026-06-03T09:00:00Z" },
  { id: "qa4", subject: "finance", topic: "DCF 估值", total: 8, correct: 6, createdAt: "2026-06-03T16:00:00Z" },
  { id: "qa5", subject: "english", topic: "雅思长难句", total: 10, correct: 8, createdAt: "2026-06-03T20:00:00Z" },
];

// simulate async I/O
const wait = <T,>(v: T): Promise<T> => Promise.resolve(v);

export const getTasks = () => wait(seedTasks);
export const getWeeklyGoals = () => wait(seedWeeklyGoals);
export const getSubjectProgress = () => wait(seedSubjectProgress);
export const getActivity = () => wait(seedActivity);
export const getDashboardStats = () => wait(seedStats);
export const getFlashcards = () => wait(seedFlashcards);
export const getQuizAttempts = () => wait(seedQuizAttempts);
