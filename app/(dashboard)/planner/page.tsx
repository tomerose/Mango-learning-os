import { PageShell } from "@/components/layout/page-shell";
import { PlannerContent } from "./planner-content-v2";
import { MissionHero, MobileShell } from "@/components/mobile/premium-mobile";

export const metadata = { title: "学习计划 · MangoLearningOS" };

export default function PlannerPage() {
  return (
    <>
    <div className="md:hidden">
      <MobileShell stage="paper">
        <MissionHero
          eyebrow="Planner"
          title="把目标压缩成今天能执行的任务"
          description="任务管理、智能计划、考试备战和闪卡复习保持原逻辑，只升级移动端阅读与操作层级。"
        />
        <section className="mango-paper-card p-3">
          <PlannerContent />
        </section>
      </MobileShell>
    </div>
    <div className="hidden md:block">
    <PageShell title="Mango Plan" description="任务管理 · 智能计划 · 闪卡复习 · 考试备战">
      <PlannerContent />
    </PageShell>
    </div>
    </>
  );
}
