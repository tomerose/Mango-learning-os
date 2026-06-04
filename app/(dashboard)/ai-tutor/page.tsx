import { TutorTabs } from "@/components/ai-tutor/tutor-tabs";
import type { SubjectId } from "@/lib/navigation";

export const metadata = { title: "AI Tutor · Mango Learning OS" };

const VALID_SUBJECTS: SubjectId[] = [
  "ai",
  "economics",
  "finance",
  "math",
  "english",
];

export default async function AITutorPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; subject?: string; topic?: string }>;
}) {
  const params = await searchParams;
  const subject = VALID_SUBJECTS.includes(params.subject as SubjectId)
    ? (params.subject as SubjectId)
    : undefined;

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">AI 导师</h1>
        <p className="text-muted-foreground text-sm">
          概念讲解、测验生成、错题分析 —— 覆盖 AI、经济、金融、数学、英语
        </p>
      </header>

      <TutorTabs
        initialTab={params.tab}
        initialSubject={subject}
        initialTopic={params.topic}
      />
    </div>
  );
}
