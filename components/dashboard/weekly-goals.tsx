import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getWeeklyGoals, SUBJECT_META } from "@/lib/mock-data";

export async function WeeklyGoals() {
  const goals = await getWeeklyGoals();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>本周目标</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {goals.map((goal) => {
          const meta = SUBJECT_META[goal.subject];
          const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
          return (
            <div key={goal.id} className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-medium">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: meta.color }}
                  />
                  {goal.title}
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {goal.current}/{goal.target} {goal.unit}
                </span>
              </div>
              <Progress value={pct} />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
