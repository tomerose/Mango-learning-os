"use client";

import * as React from "react";
import {
  BookOpen,
  CheckSquare,
  Send,
  ArrowLeft,
  Plus,
  Trash2,
  ExternalLink,
  FileText,
  Video,
  Book,
  Wrench,
  Globe,
  Loader2,
  Sparkles,
  Check,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AiReviewPanel } from "./ai-review-panel";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import type { Project, ProjectTask, Resource } from "./project-card";

// ─── Types ─────────────────────────────────────────────────────

interface ProjectWorkspaceProps {
  project: Project;
  onBack: () => void;
  onUpdate: (updated: Project) => void;
  onDelete?: () => void;
}

const RESOURCE_TYPE_ICONS: Record<Resource["type"], typeof BookOpen> = {
  article: FileText,
  video: Video,
  course: Book,
  book: Book,
  tool: Wrench,
};

const RESOURCE_TYPE_COLORS: Record<Resource["type"], string> = {
  article: "text-blue-500",
  video: "text-red-500",
  course: "text-purple-500",
  book: "text-amber-500",
  tool: "text-emerald-500",
};

// ─── Curated resources based on project subject ────────────────

function getCuratedResources(subject: string, difficulty: string): Resource[] {
  const baseResources: Record<string, Resource[]> = {
    ai: [
      { id: "r-ai-1", title: "Machine Learning Crash Course by Google", url: "https://developers.google.com/machine-learning/crash-course", type: "course" },
      { id: "r-ai-2", title: "Fast.ai Practical Deep Learning", url: "https://course.fast.ai/", type: "course" },
      { id: "r-ai-3", title: "3Blue1Brown Neural Networks", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi", type: "video" },
      { id: "r-ai-4", title: "PyTorch Documentation", url: "https://pytorch.org/docs/stable/", type: "article" },
    ],
    math: [
      { id: "r-math-1", title: "Khan Academy Mathematics", url: "https://www.khanacademy.org/math", type: "course" },
      { id: "r-math-2", title: "3Blue1Brown Essence of Linear Algebra", url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab", type: "video" },
      { id: "r-math-3", title: "MIT OpenCourseWare 18.06 Linear Algebra", url: "https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/", type: "course" },
    ],
    economics: [
      { id: "r-econ-1", title: "Principles of Economics (Mankiw)", url: "https://www.cengage.com/c/principles-of-economics-9e-mankiw", type: "book" },
      { id: "r-econ-2", title: "Marginal Revolution University", url: "https://mru.org/", type: "course" },
      { id: "r-econ-3", title: "The Economist — Daily Economics", url: "https://www.economist.com/", type: "article" },
    ],
    finance: [
      { id: "r-fin-1", title: "CFA Institute Research Foundation", url: "https://www.cfainstitute.org/learning", type: "course" },
      { id: "r-fin-2", title: "Investopedia — Financial Terms", url: "https://www.investopedia.com/", type: "article" },
      { id: "r-fin-3", title: "Yahoo Finance API Guide", url: "https://www.yahoofinanceapi.com/", type: "tool" },
    ],
    english: [
      { id: "r-eng-1", title: "BBC Learning English", url: "https://www.bbc.co.uk/learningenglish/", type: "course" },
      { id: "r-eng-2", title: "Grammarly Blog — Writing Tips", url: "https://www.grammarly.com/blog/", type: "article" },
      { id: "r-eng-3", title: "TED Talks with Transcripts", url: "https://www.ted.com/talks", type: "video" },
    ],
  };

  const resources = baseResources[subject] ?? [
    { id: "r-gen-1", title: "FreeCodeCamp", url: "https://www.freecodecamp.org/", type: "course" },
    { id: "r-gen-2", title: "Coursera — Free Courses", url: "https://www.coursera.org/courses?query=free", type: "course" },
    { id: "r-gen-3", title: "YouTube Learning", url: "https://www.youtube.com/", type: "video" },
  ];

  // For advanced, add extra resources
  if (difficulty === "advanced") {
    resources.push(
      { id: `r-adv-1`, title: "arXiv.org — Research Papers", url: "https://arxiv.org/", type: "article" },
      { id: `r-adv-2`, title: "Papers With Code", url: "https://paperswithcode.com/", type: "tool" }
    );
  }

  return resources;
}

// ─── Component ─────────────────────────────────────────────────

export function ProjectWorkspace({ project, onBack, onUpdate, onDelete }: ProjectWorkspaceProps) {
  const [activeTab, setActiveTab] = React.useState("learn");
  const [newTask, setNewTask] = React.useState("");
  const [noteContent, setNoteContent] = React.useState(project.submissionContent ?? "");
  const [submitting, setSubmitting] = React.useState(false);

  const resources = React.useMemo(
    () => getCuratedResources(project.subject, project.difficulty),
    [project.subject, project.difficulty]
  );

  const completedTasks = project.tasks.filter((t) => t.done).length;
  const totalTasks = project.tasks.length;
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  function addTask() {
    const title = newTask.trim();
    if (!title) return;
    const task: ProjectTask = {
      id: `task-${Date.now()}`,
      title,
      done: false,
    };
    onUpdate({
      ...project,
      tasks: [...project.tasks, task],
    });
    setNewTask("");
  }

  function toggleTask(taskId: string) {
    onUpdate({
      ...project,
      tasks: project.tasks.map((t) =>
        t.id === taskId ? { ...t, done: !t.done } : t
      ),
    });
  }

  function deleteTask(taskId: string) {
    onUpdate({
      ...project,
      tasks: project.tasks.filter((t) => t.id !== taskId),
    });
  }

  async function handleSubmit() {
    if (!noteContent.trim() || submitting) return;
    setSubmitting(true);

    try {
      await fetch("/api/projects/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          content: noteContent.trim(),
        }),
      });

      onUpdate({
        ...project,
        status: "submitted",
        submissionContent: noteContent.trim(),
      });
    } catch {
      // Submit still succeeds locally even if API is unavailable
      onUpdate({
        ...project,
        status: "submitted",
        submissionContent: noteContent.trim(),
      });
    } finally {
      setSubmitting(false);
    }
  }

  const handleReviewComplete = React.useCallback(
    (review: Project["review"]) => {
      onUpdate({
        ...project,
        review,
        status: "completed",
        progress: 100,
      });
    },
    [project, onUpdate]
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-8 rounded-lg">
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold truncate">{project.name}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="secondary" className="text-[10px]">
              {project.subject}
            </Badge>
            <Badge
              className={cn(
                "text-[10px]",
                project.status === "completed"
                  ? "bg-emerald-100 text-emerald-700"
                  : project.status === "submitted"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-muted text-muted-foreground"
              )}
            >
              {project.status === "planning" ? "规划中" : project.status === "in_progress" ? "进行中" : project.status === "submitted" ? "已提交" : project.status === "completed" ? "已完成" : project.status}
            </Badge>
          </div>
        </div>
        {onDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                title="删除项目"
              >
                <Trash2 className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>确定要删除这个项目吗？</AlertDialogTitle>
                <AlertDialogDescription>
                  此操作不可撤销。项目及其所有学习记录将被永久删除。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  删除
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <Progress value={project.progress} className="h-2 flex-1" />
        <span className="text-sm font-semibold tabular-nums">
          {project.progress}%
        </span>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="learn">
            <BookOpen className="size-4 mr-1.5" /> 学习资料
          </TabsTrigger>
          <TabsTrigger value="build">
            <CheckSquare className="size-4 mr-1.5" /> 构建实践
          </TabsTrigger>
          <TabsTrigger value="submit">
            <Send className="size-4 mr-1.5" /> 提交成果
          </TabsTrigger>
        </TabsList>

        {/* ── Learn Tab ─────────────────────────────────────── */}
        <TabsContent value="learn" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Resources */}
            <div className="lg:col-span-2">
              <Card className="rounded-2xl">
                <CardContent className="flex flex-col gap-3 pt-5">
                  <div className="flex items-center gap-2">
                    <BookOpen className="size-4 text-primary" />
                    <h3 className="text-sm font-semibold">
                      Curated Resources
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Recommended learning materials for your project on{" "}
                    <strong>{project.subject}</strong> at{" "}
                    <strong>{project.difficulty}</strong> level.
                  </p>
                  <div className="flex flex-col gap-2">
                    {resources.map((r) => {
                      const Icon = RESOURCE_TYPE_ICONS[r.type];
                      return (
                        <a
                          key={r.id}
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/60
                            transition-colors group"
                        >
                          <Icon
                            className={cn(
                              "size-4 shrink-0",
                              RESOURCE_TYPE_COLORS[r.type]
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                              {r.title}
                            </p>
                            <p className="text-[10px] text-muted-foreground capitalize">
                              {r.type}
                            </p>
                          </div>
                          <ExternalLink className="size-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                        </a>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Notes */}
            <div>
              <Card className="rounded-2xl h-full">
                <CardContent className="flex flex-col gap-3 pt-5 h-full">
                  <h3 className="text-sm font-semibold">Notes</h3>
                  <Textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="在这里记录学习笔记…"
                    className="flex-1 min-h-[200px] text-sm resize-y rounded-xl"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ── Build Tab ─────────────────────────────────────── */}
        <TabsContent value="build" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Task checklist */}
            <Card className="rounded-2xl">
              <CardContent className="flex flex-col gap-4 pt-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="size-4 text-primary" />
                    <h3 className="text-sm font-semibold">Task Checklist</h3>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    {completedTasks}/{totalTasks} done
                  </Badge>
                </div>

                {/* Add task input */}
                <div className="flex items-center gap-2">
                  <Input
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTask();
                      }
                    }}
                    placeholder="添加任务…"
                    className="h-8 text-xs rounded-xl"
                  />
                  <Button
                    size="sm"
                    onClick={addTask}
                    disabled={!newTask.trim()}
                    className="h-8 rounded-xl shrink-0"
                  >
                    <Plus className="size-3.5" />
                  </Button>
                </div>

                {/* Task list */}
                {project.tasks.length === 0 ? (
                  <div className="text-center py-8 text-xs text-muted-foreground/50">
                    No tasks yet. Add tasks to track your progress.
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5 max-h-80 overflow-y-auto">
                    {project.tasks.map((task) => (
                      <div
                        key={task.id}
                        className={cn(
                          "flex items-center gap-2.5 p-2.5 rounded-xl transition-colors group",
                          task.done
                            ? "bg-emerald-50/50 dark:bg-emerald-950/10"
                            : "bg-muted/20 hover:bg-muted/40"
                        )}
                      >
                        <button
                          onClick={() => toggleTask(task.id)}
                          className={cn(
                            "size-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
                            task.done
                              ? "bg-emerald-500 border-emerald-500"
                              : "border-muted-foreground/30 hover:border-primary/50"
                          )}
                        >
                          {task.done && (
                            <Check className="size-3 text-white" strokeWidth={3} />
                          )}
                        </button>
                        <span
                          className={cn(
                            "flex-1 text-sm",
                            task.done &&
                              "line-through text-muted-foreground/60"
                          )}
                        >
                          {task.title}
                        </span>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground/40 hover:text-destructive transition-all"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Task progress */}
                {totalTasks > 0 && (
                  <div className="flex items-center gap-2.5">
                    <Progress value={taskProgress} className="h-1.5 flex-1" />
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {taskProgress}%
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Progress tracker */}
            <Card className="rounded-2xl">
              <CardContent className="flex flex-col gap-3 pt-5">
                <h3 className="text-sm font-semibold">Project Progress</h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/30 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold text-primary">
                      {project.tasks.filter((t) => t.done).length}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Tasks Done
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-3 text-center">
                    <p className="text-2xl font-bold">
                      {project.learningGoals.length}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      学习目标
                    </p>
                  </div>
                </div>

                {/* Learning goals */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    学习目标
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {project.learningGoals.map((goal, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 text-sm bg-muted/20 rounded-lg px-3 py-2"
                      >
                        <span className="text-primary font-medium text-xs mt-0.5">
                          {i + 1}.
                        </span>
                        <span className="text-muted-foreground">{goal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Submit Tab ────────────────────────────────────── */}
        <TabsContent value="submit" className="mt-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Submission area */}
            <Card className="rounded-2xl">
              <CardContent className="flex flex-col gap-4 pt-5">
                <div className="flex items-center gap-2">
                  <Send className="size-4 text-primary" />
                  <h3 className="text-sm font-semibold">
                    提交你的作品
                  </h3>
                </div>

                <Textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="粘贴代码、撰写分析，或描述你的成果…"
                  className="min-h-40 text-sm resize-y rounded-xl"
                />

                <Button
                  onClick={handleSubmit}
                  disabled={!noteContent.trim() || submitting}
                  className="rounded-xl w-full"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      提交中…
                    </>
                  ) : (
                    <>
                      <Send className="size-4 mr-2" /> 提交项目
                    </>
                  )}
                </Button>

                {project.status === "submitted" && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-3 text-xs text-blue-700 dark:text-blue-400 flex items-center gap-2">
                    <Sparkles className="size-3.5" />
                    Submitted! Request an AI review below.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Review */}
            <AiReviewPanel
              project={project}
              onReviewComplete={handleReviewComplete}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
