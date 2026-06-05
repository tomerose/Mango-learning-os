"use client";

import * as React from "react";
import {
  Lightbulb,
  HelpCircle,
  Search,
  CalendarCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { SubjectId } from "@/lib/types";
import { useSubjects } from "@/lib/subjects";
import { useStore } from "@/lib/store";

// ─────────────────────────────────────────────────────────────
// Agent Suggestions — context-aware pill buttons that help the
// user discover what to ask the agent next.
// ─────────────────────────────────────────────────────────────

interface AgentSuggestionsProps {
  subject: SubjectId;
  onSelect: (prompt: string) => void;
  className?: string;
}

interface Suggestion {
  icon: React.ElementType;
  label: string;
  buildPrompt: (subjectLabel: string, weakTopic?: string) => string;
}

const SUGGESTIONS: Suggestion[] = [
  {
    icon: Lightbulb,
    label: "Explain",
    buildPrompt: (label: string) => `请讲解「${label}」的核心概念`,
  },
  {
    icon: HelpCircle,
    label: "Quiz me",
    buildPrompt: (_label: string, weakTopic?: string) =>
      weakTopic
        ? `请就「${weakTopic}」出几道题测试我的理解`
        : "请就我最近学的内容出几道测试题",
  },
  {
    icon: Search,
    label: "Analyze my mistakes",
    buildPrompt: () =>
      "请分析我最近的错题，找出我的思维误区并给出改进建议",
  },
  {
    icon: CalendarCheck,
    label: "Create study plan",
    buildPrompt: (label: string) =>
      `请为「${label}」制定一个为期一周的学习计划`,
  },
];

export function AgentSuggestions({
  subject,
  onSelect,
  className,
}: AgentSuggestionsProps) {
  const store = useStore();
  const { getMeta } = useSubjects();
  const subjectMeta = getMeta(subject);

  // Get the weakest topic for this subject to personalize suggestions
  const weakestTopic = React.useMemo(() => {
    const areas = store.weakAreas.filter((w) => w.subject === subject);
    return areas.length > 0 ? areas[0].topic : undefined;
  }, [store.weakAreas, subject]);

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {SUGGESTIONS.map((sug) => {
        const Icon = sug.icon;
        const prompt = sug.buildPrompt(subjectMeta.label, weakestTopic);

        return (
          <button
            key={sug.label}
            onClick={() => onSelect(prompt)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              "text-muted-foreground hover:bg-accent hover:text-accent-foreground active:scale-[0.97]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            )}
          >
            <Icon className="size-3.5" />
            <span>{sug.label}</span>
          </button>
        );
      })}
    </div>
  );
}
