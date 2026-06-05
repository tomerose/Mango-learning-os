"use client";

import * as React from "react";
import { Plus, Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useSubjects } from "@/lib/subjects";
import { cn } from "@/lib/utils";
import type { Project, ProjectDifficulty } from "./project-card";

// ─── Types ─────────────────────────────────────────────────────

interface ProjectBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (project: Omit<Project, "id" | "progress" | "resources" | "tasks" | "status">) => void;
}

const DIFFICULTIES: { value: ProjectDifficulty; label: string }[] = [
  { value: "beginner", label: "入门" },
  { value: "intermediate", label: "中级" },
  { value: "advanced", label: "高级" },
];

// ─── Component ─────────────────────────────────────────────────

export function ProjectBuilder({ open, onOpenChange, onCreate }: ProjectBuilderProps) {
  const { subjects } = useSubjects();

  const [name, setName] = React.useState("");
  const [selectedSubject, setSelectedSubject] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [difficulty, setDifficulty] = React.useState<ProjectDifficulty>("beginner");
  const [goalInput, setGoalInput] = React.useState("");
  const [goals, setGoals] = React.useState<string[]>([]);

  function addGoal() {
    const g = goalInput.trim();
    if (g && !goals.includes(g)) {
      setGoals((p) => [...p, g]);
      setGoalInput("");
    }
  }

  function removeGoal(goal: string) {
    setGoals((p) => p.filter((g) => g !== goal));
  }

  function handleGoalKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      addGoal();
    }
  }

  function handleCreate() {
    if (!name.trim() || !selectedSubject) return;

    onCreate({
      name: name.trim(),
      subject: selectedSubject,
      description: description.trim(),
      difficulty,
      learningGoals: goals,
      startDate: new Date().toISOString(),
    });

    // Reset form
    setName("");
    setSelectedSubject("");
    setDescription("");
    setDifficulty("beginner");
    setGoals([]);
    setGoalInput("");

    onOpenChange(false);
  }

  const isValid = name.trim() && selectedSubject;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="size-5 text-primary" />
            Create New Project
          </DialogTitle>
          <DialogDescription>
            Define your project. You can add tasks and resources from the
            workspace later.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 mt-2">
          {/* Project name */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Project Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Build a Stock Price Predictor"
              className="rounded-xl"
            />
          </div>

          {/* Subject selector */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Subject
            </label>
            <div className="flex flex-wrap gap-1.5">
              {subjects.map((s) => (
                <button
                  key={s.id}
                  onClick={() =>
                    setSelectedSubject(
                      selectedSubject === s.id ? "" : s.id
                    )
                  }
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                    selectedSubject === s.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted bg-muted/30 text-muted-foreground hover:border-muted-foreground/30"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="你想做什么项目？描述你的学习目标…"
              className="min-h-20 text-sm resize-y rounded-xl"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Difficulty
            </label>
            <div className="flex gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDifficulty(d.value)}
                  className={cn(
                    "flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-all border",
                    difficulty === d.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted bg-muted/30 text-muted-foreground hover:border-muted-foreground/30"
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Learning goals */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Learning Goals
            </label>
            <div className="flex items-center gap-2">
              <Input
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                onKeyDown={handleGoalKeyDown}
                placeholder="e.g., Understand linear regression"
                className="h-8 text-xs rounded-xl"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addGoal}
                disabled={!goalInput.trim()}
                className="h-8 text-xs rounded-xl shrink-0"
              >
                Add
              </Button>
            </div>
            {goals.length > 0 && (
              <div className="flex flex-col gap-1.5 mt-2">
                {goals.map((g, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-1.5"
                  >
                    <span className="text-xs text-muted-foreground">
                      {i + 1}. {g}
                    </span>
                    <button
                      onClick={() => removeGoal(g)}
                      className="text-muted-foreground/40 hover:text-destructive transition-colors"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create button */}
          <Button
            onClick={handleCreate}
            disabled={!isValid}
            className="rounded-xl w-full mt-1"
          >
            <Plus className="size-4 mr-2" /> Create Project
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
