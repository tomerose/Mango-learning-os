import { NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────
// GET /api/analytics — returns all analytics data (KPIs, chart
// series, heatmap, streaks, goals, weak topics, mastery).
// Used by every card on the analytics dashboard.
// ─────────────────────────────────────────────────────────────

interface WeeklyDay {
  day: string;
  minutes: number;
}

interface DailyHours {
  date: string;
  total: number;
  ai?: number;
  economics?: number;
  finance?: number;
  math?: number;
  english?: number;
}

interface SubjectMastery {
  subject: string;
  mastery: number;
}

interface WeakTopic {
  subject: string;
  topic: string;
  accuracy: number;
  attempts: number;
  trend: "up" | "down" | "flat";
}

interface GoalMilestone {
  label: string;
  date: string;
  completed: boolean;
}

interface LearningGoal {
  id: string;
  title: string;
  subject: string;
  current: number;
  target: number;
  unit: string;
  startDate: string;
  targetDate: string;
  milestones: GoalMilestone[];
}

interface HeatmapDay {
  date: string;
  minutes: number;
  dayOfWeek: number;
}

interface CalendarStreak {
  date: string;
  studied: boolean;
  minutes?: number;
}

interface AnalyticsResponse {
  totalHoursThisWeek: number;
  focusScoreAvg: number;
  quizAccuracy: number;
  streakDays: number;
  weeklyMinutes: WeeklyDay[];
  learningHours: DailyHours[];
  subjects: SubjectMastery[];
  weakTopics: WeakTopic[];
  goalProgress: LearningGoal[];
  heatmapData: HeatmapDay[];
  calendarStreaks: CalendarStreak[];
}

const DAY_LABELS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function generateWeeklyMinutes(): WeeklyDay[] {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  return DAY_LABELS_EN.map((day, i) => {
    const isPastOrToday = i <= daysFromMonday;
    const minutes = isPastOrToday ? Math.floor(Math.random() * 90 + 30) : 0;
    return { day, minutes };
  });
}

function generateLearningHours(): DailyHours[] {
  const data: DailyHours[] = [];
  const now = new Date();
  const subjects = ["ai", "economics", "finance", "math", "english"];

  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    // More study on weekdays
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const entry: DailyHours = {
      date: dateStr,
      total: 0,
    };

    // Randomly assign study time to 2-3 subjects
    const numSubjects = isWeekend ? Math.floor(Math.random() * 2 + 1) : Math.floor(Math.random() * 2 + 2);
    const chosen = [...subjects].sort(() => Math.random() - 0.5).slice(0, numSubjects);

    let total = 0;
    for (const subj of chosen) {
      const hours = isWeekend
        ? Math.round((Math.random() * 1.5 + 0.5) * 2) / 2 // 0.5-2h
        : Math.round((Math.random() * 2.5 + 0.5) * 2) / 2; // 0.5-3h
      (entry as unknown as Record<string, number>)[subj] = hours;
      total += hours;
    }

    entry.total = Math.round(total * 2) / 2;
    data.push(entry);
  }

  return data;
}

function generateSubjects(): SubjectMastery[] {
  return [
    { subject: "math", mastery: 81 },
    { subject: "ai", mastery: 72 },
    { subject: "english", mastery: 69 },
    { subject: "economics", mastery: 64 },
    { subject: "finance", mastery: 58 },
  ];
}

function generateWeakTopics(): WeakTopic[] {
  return [
    { subject: "math", topic: "多元函数极值", accuracy: 42, attempts: 12, trend: "down" },
    { subject: "economics", topic: "市场失灵与外部性", accuracy: 50, attempts: 10, trend: "flat" },
    { subject: "ai", topic: "反向传播推导", accuracy: 55, attempts: 11, trend: "up" },
    { subject: "finance", topic: "DCF 估值", accuracy: 75, attempts: 8, trend: "up" },
    { subject: "english", topic: "雅思长难句", accuracy: 80, attempts: 10, trend: "up" },
    { subject: "ai", topic: "梯度消失与爆炸", accuracy: 45, attempts: 6, trend: "flat" },
  ];
}

function generateGoalProgress(): LearningGoal[] {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  return [
    {
      id: "goal-1",
      title: "AI 深度学习专题 — 10 小时",
      subject: "ai",
      current: 6.5,
      target: 10,
      unit: "hrs",
      startDate: "2026-05-26",
      targetDate: "2026-06-12",
      milestones: [
        { label: "Transformer 注意力机制", date: "2026-05-30", completed: true },
        { label: "反向传播与优化器", date: "2026-06-03", completed: true },
        { label: "CNN / RNN 经典架构", date: "2026-06-07", completed: false },
        { label: "综合项目实践", date: "2026-06-12", completed: false },
      ],
    },
    {
      id: "goal-2",
      title: "金融建模练习 6 小时",
      subject: "finance",
      current: 4,
      target: 6,
      unit: "hrs",
      startDate: "2026-05-28",
      targetDate: "2026-06-15",
      milestones: [
        { label: "DCF 三表联动", date: "2026-06-02", completed: true },
        { label: "敏感性分析", date: "2026-06-08", completed: false },
        { label: "案例实操", date: "2026-06-15", completed: false },
      ],
    },
    {
      id: "goal-3",
      title: "数学证明题 30 道",
      subject: "math",
      current: 18,
      target: 30,
      unit: "problems",
      startDate: "2026-05-25",
      targetDate: "2026-06-10",
      milestones: [
        { label: "线性代数 10 题", date: "2026-05-31", completed: true },
        { label: "概率论 10 题", date: "2026-06-05", completed: false },
        { label: "优化理论 10 题", date: "2026-06-10", completed: false },
      ],
    },
  ];
}

function generateHeatmapData(): HeatmapDay[] {
  const data: HeatmapDay[] = [];
  const now = new Date();

  for (let i = 27; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Some days have no study
    const studied = isWeekend ? Math.random() > 0.4 : Math.random() > 0.15;

    data.push({
      date: dateStr,
      minutes: studied ? Math.floor(Math.random() * (isWeekend ? 60 : 120) + 15) : 0,
      dayOfWeek,
    });
  }

  return data;
}

function generateCalendarStreaks(): CalendarStreak[] {
  const data: CalendarStreak[] = [];
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();

  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(year, month, d);
    const dateStr = date.toISOString().slice(0, 10);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isPast = d <= today;

    // Past days generally studied, weekends have a chance
    const studied = isPast
      ? isWeekend
        ? Math.random() > 0.35
        : Math.random() > 0.1
      : false;

    data.push({
      date: dateStr,
      studied,
      minutes: studied
        ? Math.floor(Math.random() * (isWeekend ? 60 : 120) + 20)
        : 0,
    });
  }

  return data;
}

export async function GET() {
  const weeklyMinutes = generateWeeklyMinutes();
  const totalMinutes = weeklyMinutes.reduce((s, d) => s + d.minutes, 0);
  const totalHoursThisWeek = Math.round((totalMinutes / 60) * 10) / 10;

  const data: AnalyticsResponse = {
    totalHoursThisWeek,
    focusScoreAvg: 78,
    quizAccuracy: 82,
    streakDays: 7,
    weeklyMinutes,
    learningHours: generateLearningHours(),
    subjects: generateSubjects(),
    weakTopics: generateWeakTopics(),
    goalProgress: generateGoalProgress(),
    heatmapData: generateHeatmapData(),
    calendarStreaks: generateCalendarStreaks(),
  };

  return NextResponse.json(data, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
