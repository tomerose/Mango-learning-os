import {
  Trophy,
  FileText,
  BookOpen,
  Brain,
  PencilLine,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getActivity, SUBJECT_META } from "@/lib/mock-data";
import type { ActivityEvent } from "@/lib/types";

const kindMeta: Record<
  ActivityEvent["kind"],
  { icon: LucideIcon; color: string }
> = {
  achievement: { icon: Trophy, color: "var(--chart-1)" },
  quiz: { icon: Brain, color: "var(--chart-4)" },
  note: { icon: FileText, color: "var(--chart-2)" },
  study: { icon: BookOpen, color: "var(--chart-5)" },
  reflection: { icon: PencilLine, color: "var(--chart-3)" },
};

export async function ActivityFeed() {
  const events = await getActivity();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>近期动态</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative flex flex-col gap-4">
          {events.map((e, i) => {
            const meta = kindMeta[e.kind];
            const Icon = meta.icon;
            return (
              <li key={e.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: `color-mix(in oklch, ${meta.color} 15%, transparent)`,
                    }}
                  >
                    <Icon className="size-4" style={{ color: meta.color }} />
                  </span>
                  {i < events.length - 1 && (
                    <span className="bg-border mt-1 w-px flex-1" />
                  )}
                </div>
                <div className="min-w-0 flex-1 pb-1">
                  <p className="text-sm leading-snug">{e.label}</p>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {e.subject ? `${SUBJECT_META[e.subject].short} · ` : ""}
                    {e.timeLabel}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
