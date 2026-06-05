import { PageShell } from "@/components/layout/page-shell";
import { PlannerContent } from "./planner-content-v2";

export const metadata = { title: "学习计划 · MangoLearningOS" };

export default function PlannerPage() {
  return (
    <PageShell title="Mango Plan" description="任务管理 · 智能计划 · 闪卡复习 · 考试备战">
      <PlannerContent />
    </PageShell>
  );
}
