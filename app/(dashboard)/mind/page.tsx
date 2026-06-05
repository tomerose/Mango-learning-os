import { PageShell } from "@/components/layout/page-shell";
import { JournalEditor } from "@/components/mind/journal-editor";
import { MoodTracker } from "@/components/mind/mood-tracker";
import { CbtReframer } from "@/components/mind/cbt-reframer";
import { AiCompanionChat } from "@/components/mind/ai-companion-chat";
import { GrowthTimeline } from "@/components/mind/growth-timeline";
import { WeeklySummaryCard } from "@/components/mind/weekly-summary-card";
import { MindTabs } from "./tabs";

export const metadata = { title: "Mind Garden · MangoLearningOS V2" };

export default function MindPage() {
  return (
    <PageShell
      title="Mind Garden"
      description="Your mental wellness companion — journal, reflect, and grow"
      maxWidth="xl"
    >
      <div className="flex flex-col gap-6">
        {/* Weekly Summary Card */}
        <WeeklySummaryCard />

        {/* Tabbed sections */}
        <MindTabs />
      </div>
    </PageShell>
  );
}
