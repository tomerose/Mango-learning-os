import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSubjectProgress, SUBJECT_META } from "@/lib/mock-data";

export async function SubjectProgress() {
  const progress = await getSubjectProgress();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>学科掌握度</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {progress.map((p) => {
          const meta = SUBJECT_META[p.subject];
          const hours = (p.weeklyMinutes / 60).toFixed(1);
          return (
            <div key={p.subject} className="flex items-center gap-3">
              <div className="relative flex size-12 shrink-0 items-center justify-center">
                <svg className="size-12 -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke="var(--muted)"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke={meta.color}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${(p.masteryPct / 100) * 97.4} 97.4`}
                  />
                </svg>
                <span className="absolute text-xs font-semibold tabular-nums">
                  {p.masteryPct}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{meta.label}</p>
                <p className="text-muted-foreground text-xs">
                  本周 {hours} 小时
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
