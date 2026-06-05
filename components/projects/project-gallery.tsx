"use client";

import * as React from "react";
import { Trophy, Filter, Star, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubjects } from "@/lib/subjects";
import { cn } from "@/lib/utils";
import type { Project } from "./project-card";

// ─── Types ─────────────────────────────────────────────────────

interface ProjectGalleryProps {
  projects: Project[];
  onSelect?: (project: Project) => void;
}

// ─── Component ─────────────────────────────────────────────────

export function ProjectGallery({ projects, onSelect }: ProjectGalleryProps) {
  const { subjects, getMeta } = useSubjects();
  const [filter, setFilter] = React.useState<string>("all");
  const [expanded, setExpanded] = React.useState(true);
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  const completed = projects.filter((p) => p.status === "completed");

  const filtered =
    filter === "all"
      ? completed
      : completed.filter((p) => p.subject === filter);

  if (completed.length === 0) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="size-14 rounded-full bg-muted/50 flex items-center justify-center">
            <Trophy className="size-6 text-muted-foreground/40" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              No completed projects yet
            </p>
            <p className="text-xs text-muted-foreground/50 mt-1 max-w-xs">
              Finished projects will appear here as a showcase of your learning
              journey.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get unique subjects from completed projects
  const projectSubjects = [
    ...new Set(completed.map((p) => p.subject)),
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors"
        >
          <Trophy className="size-4 text-amber-500" />
          Project Gallery
          <span className="text-muted-foreground text-xs font-normal">
            ({completed.length})
          </span>
          {expanded ? (
            <ChevronUp className="size-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" />
          )}
        </button>

        {/* Subject filter */}
        {expanded && (
          <div className="flex items-center gap-1.5">
            <Filter className="size-3.5 text-muted-foreground" />
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all",
                filter === "all"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              All
            </button>
            {projectSubjects.map((subjId) => {
              const meta = getMeta(subjId);
              return (
                <button
                  key={subjId}
                  onClick={() =>
                    setFilter(filter === subjId ? "all" : subjId)
                  }
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all",
                    filter === subjId
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {meta.short}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Grid */}
      {expanded && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => {
            const meta = getMeta(project.subject);
            const avgScore = project.review
              ? Math.round(
                  (project.review.scores.correctness +
                    project.review.scores.completeness +
                    project.review.scores.creativity +
                    project.review.scores.bestPractices) /
                    4
                )
              : null;

            return (
              <Card
                key={project.id}
                className="rounded-2xl transition-all hover:shadow-md cursor-pointer relative group"
                onMouseEnter={() => setHoveredId(project.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onSelect?.(project)}
              >
                <CardContent className="flex flex-col gap-2.5 py-4">
                  {/* Subject badge + score */}
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0"
                      style={{
                        backgroundColor: meta.color + "20",
                        color: meta.color,
                      }}
                    >
                      {meta.short}
                    </Badge>
                    {avgScore !== null && (
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="size-3 fill-current" />
                        <span className="text-xs font-bold tabular-nums">
                          {avgScore}/10
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h4 className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                    {project.name}
                  </h4>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {project.description || "No description"}
                  </p>

                  {/* Learning goals */}
                  {project.learningGoals.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.learningGoals.slice(0, 2).map((g, i) => (
                        <span
                          key={i}
                          className="text-[10px] text-muted-foreground/60 bg-muted/30 px-1.5 py-0.5 rounded-md truncate max-w-[150px]"
                        >
                          {g}
                        </span>
                      ))}
                      {project.learningGoals.length > 2 && (
                        <span className="text-[10px] text-muted-foreground/40">
                          +{project.learningGoals.length - 2} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Hover tooltip: AI review summary */}
                  {hoveredId === project.id && project.review && (
                    <div className="absolute inset-0 bg-background/95 backdrop-blur-sm rounded-2xl p-4 flex flex-col gap-2 z-10 animate-in fade-in zoom-in-95">
                      <div className="flex items-center gap-1.5">
                        <Trophy className="size-3.5 text-amber-500" />
                        <span className="text-xs font-semibold">
                          AI Review Summary
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
                        {project.review.summary}
                      </p>
                      <div className="flex gap-4 mt-auto">
                        {(
                          [
                            { key: "correctness", label: "Correct" },
                            { key: "completeness", label: "Complete" },
                            { key: "creativity", label: "Creative" },
                            { key: "bestPractices", label: "Practices" },
                          ] as const
                        ).map(({ key, label }) => (
                          <div key={key} className="text-center">
                            <p className="text-sm font-bold tabular-nums">
                              {project.review!.scores[key]}
                            </p>
                            <p className="text-[9px] text-muted-foreground">
                              {label}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {expanded && filtered.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">
          No projects match this filter.
        </p>
      )}
    </div>
  );
}
