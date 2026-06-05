"use client";

import * as React from "react";
import { Rocket, Calendar, ChevronRight, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useSubjects } from "@/lib/subjects";

// ─── Types ─────────────────────────────────────────────────────

export type ProjectStatus = "planning" | "in_progress" | "completed" | "submitted";
export type ProjectDifficulty = "beginner" | "intermediate" | "advanced";

export interface Project {
  id: string;
  name: string;
  subject: string;
  description: string;
  difficulty: ProjectDifficulty;
  learningGoals: string[];
  status: ProjectStatus;
  progress: number;
  startDate: string;
  resources: Resource[];
  tasks: ProjectTask[];
  submissionContent?: string;
  review?: ProjectReview;
}

export interface Resource {
  id: string;
  title: string;
  url: string;
  type: "article" | "video" | "course" | "book" | "tool";
}

export interface ProjectTask {
  id: string;
  title: string;
  done: boolean;
}

export interface ProjectReview {
  scores: {
    correctness: number;
    completeness: number;
    creativity: number;
    bestPractices: number;
  };
  suggestions: string[];
  summary: string;
}

// ─── Status config ─────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "info" | "success" }
> = {
  planning: { label: "规划中", variant: "secondary" as const },
  in_progress: { label: "进行中", variant: "default" as const },
  submitted: { label: "已提交", variant: "info" as const },
  completed: { label: "已完成", variant: "success" as const },
};

const DIFFICULTY_CONFIG: Record<ProjectDifficulty, { label: string; color: string }> = {
  beginner: { label: "入门", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  intermediate: { label: "中级", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  advanced: { label: "高级", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

// ─── Component ─────────────────────────────────────────────────

interface ProjectCardProps {
  project: Project;
  onClick?: (project: Project) => void;
  compact?: boolean;
}

export function ProjectCard({ project, onClick, compact }: ProjectCardProps) {
  const { getMeta } = useSubjects();
  const subjectMeta = getMeta(project.subject);
  const statusCfg = STATUS_CONFIG[project.status];
  const diffCfg = DIFFICULTY_CONFIG[project.difficulty];

  return (
    <Card
      className={cn(
        "rounded-2xl transition-all hover:shadow-md cursor-pointer group",
        onClick && "hover:border-primary/30"
      )}
      onClick={() => onClick?.(project)}
    >
      <CardContent className={cn("flex flex-col gap-3", compact ? "py-3.5" : "pt-5")}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge
                variant={statusCfg.variant}
                className="text-[10px] px-1.5 py-0"
              >
                {statusCfg.label}
              </Badge>
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0"
                style={{ backgroundColor: subjectMeta.color + "20", color: subjectMeta.color }}
              >
                {subjectMeta.short}
              </Badge>
            </div>
            <h3 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
              {project.name}
            </h3>
          </div>
          {onClick && (
            <ChevronRight className="size-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0 mt-1" />
          )}
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2.5">
          <Progress value={project.progress} className="h-1.5 flex-1" />
          <span className="text-xs text-muted-foreground tabular-nums font-medium">
            {project.progress}%
          </span>
        </div>

        {/* Footer: difficulty + date */}
        <div className="flex items-center justify-between">
          <span
            className={cn(
              "text-[10px] font-medium px-2 py-0.5 rounded-full",
              diffCfg.color
            )}
          >
            {diffCfg.label}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
            <Calendar className="size-3" />
            {new Date(project.startDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>

        {/* Completed badge */}
        {project.status === "completed" && (
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <Trophy className="size-3.5" />
            <span className="text-xs font-medium">Project Completed</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
