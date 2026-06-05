import { PageShell } from "@/components/layout/page-shell";
import { PlannerContent } from "./planner-content-v2";

export const metadata = { title: "学习计划 · MangoLearningOS" };

export default function PlannerPage() {
  return (
    <PageShell title="Mango Plan" description="智能生成学习计划 · 任务管理">
      <PlannerContent />
    </PageShell>
  );
}
