import { PageShell } from "@/components/layout/page-shell";
import { PlannerContent } from "./planner-content-v2";

export const metadata = { title: "Mango Plan · MangoLearningOS" };

export default function PlannerPage() {
  return (
    <PageShell
      title="Mango Plan"
      description="AI 智能生成 · 任务管理 · 知识库（笔记·闪卡·资源·图谱）"
    >
      <PlannerContent />
    </PageShell>
  );
}
