/**
 * MangoOS V14.2 — Planner Bridge
 *
 * Converts any artifact into a structured learning plan.
 * Default cycles: 3-day sprint, 5-day focus, 7-day deep dive.
 */
import type { Artifact, ArtifactSection } from "@/lib/artifact/types";

export interface PlanDay {
  day: number;
  theme: string;
  tasks: PlanTask[];
  estimatedMinutes: number;
}

export interface PlanTask {
  title: string;
  description: string;
  materialRef: string;     // which artifact section to review
  practiceRef: string;     // practice/action item
  estimatedMin: number;
  done: boolean;
}

// ── Generate plan from artifact ────────────────────────────────

export function artifactToPlan(
  artifact: Artifact,
  days: 3 | 5 | 7 = 5,
): PlanDay[] {
  const sections = artifact.sections;
  if (sections.length === 0) return [];

  const plan: PlanDay[] = [];
  const criticalSections = sections.filter(s => s.importance === "critical" || s.importance === "high");
  const otherSections = sections.filter(s => s.importance === "medium" || s.importance === "reference");

  // Distribute sections across days
  const sectionsPerDay = Math.ceil(criticalSections.length / days) || 1;

  for (let d = 0; d < days; d++) {
    const daySections = criticalSections.slice(d * sectionsPerDay, (d + 1) * sectionsPerDay);
    if (d === days - 1) {
      // Last day: review + remaining
      daySections.push(...otherSections);
    }

    const tasks: PlanTask[] = daySections.map((s, i) => ({
      title: `学习：${s.title.replace(/^[📋🧠🎯📝📐⚠️📅✏️📦📑🔑📖🔬💭💡📂🔗❓🕳️🔄🔍📊🗣️🏗️🎙️🎤💪🎨🌳🗺️🏊🔧]/g, "").trim().slice(0, 30)}`,
      description: `复习 "${s.title}" 章节内容`,
      materialRef: s.id,
      practiceRef: s.importance === "critical" ? "完成章节配套练习" : "浏览并标记重点",
      estimatedMin: s.importance === "critical" ? 45 : 25,
      done: false,
    }));

    // Add review task for non-first days
    if (d > 0) {
      tasks.unshift({
        title: `快速回顾前一天内容`,
        description: "5 分钟回顾昨天的关键概念和错题",
        materialRef: "",
        practiceRef: "自测：能否不看笔记复述核心内容？",
        estimatedMin: 10,
        done: false,
      });
    }

    plan.push({
      day: d + 1,
      theme: d === 0 ? "建立基础" : d === days - 1 ? "综合复习" : `深度学习 Day ${d + 1}`,
      tasks,
      estimatedMinutes: tasks.reduce((sum, t) => sum + t.estimatedMin, 0),
    });
  }

  return plan;
}

/** Save plan tasks to the global store */
export function planToStoreTasks(
  plan: PlanDay[],
  subject: string,
): Array<{ title: string; subject: string; done: boolean; priority: "high" | "medium" | "low"; dueLabel: string; estimatedMin: number }> {
  const tasks: Array<{ title: string; subject: string; done: boolean; priority: "high" | "medium" | "low"; dueLabel: string; estimatedMin: number }> = [];

  for (const day of plan) {
    for (const t of day.tasks) {
      tasks.push({
        title: `[Day ${day.day}] ${t.title}`,
        subject,
        done: false,
        priority: day.day <= 2 ? "high" : "medium",
        dueLabel: `Day ${day.day}`,
        estimatedMin: t.estimatedMin,
      });
    }
  }

  return tasks;
}
