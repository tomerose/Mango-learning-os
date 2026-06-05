"use client";

import * as React from "react";
import { PageShell } from "@/components/layout/page-shell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Heart, Rocket, Plus, MessageCircle } from "lucide-react";
import { JournalEditor } from "@/components/mind/journal-editor";
import { MoodTracker } from "@/components/mind/mood-tracker";
import { CbtReframer } from "@/components/mind/cbt-reframer";
import { AiCompanionChat } from "@/components/mind/ai-companion-chat";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectBuilder } from "@/components/projects/project-builder";
import { ProjectWorkspace } from "@/components/projects/project-workspace";
import { ProjectGallery } from "@/components/projects/project-gallery";
import type { Project } from "@/components/projects/project-card";
import { Button } from "@/components/ui/button";

// ─────────────────────────────────────────────────────────────
// 成长花园 — 心灵花园 + 项目实践 + 心灵陪伴
// ─────────────────────────────────────────────────────────────

const SEED_PROJECTS: Project[] = [
  {
    id: "p1", name: "用 Python 构建数据分析工具", subject: "ai",
    description: "从零搭建一个数据分析 CLI 工具", difficulty: "intermediate",
    status: "in_progress", progress: 45,
    learningGoals: ["掌握 pandas", "理解数据可视化", "CLI 设计"],
    startDate: "2026-05-20", resources: [], tasks: [],
  },
  {
    id: "p2", name: "经济学案例研究：碳税政策分析", subject: "economics",
    description: "研究碳税对市场均衡的影响", difficulty: "advanced",
    status: "planning", progress: 10,
    learningGoals: ["外部性理论", "政策评估方法", "成本收益分析"],
    startDate: "2026-06-01", resources: [], tasks: [],
  },
];

export function GrowContent() {
  const [activeTab, setActiveTab] = React.useState("mind");
  const [projects, setProjects] = React.useState<Project[]>(() => {
    try {
      const raw = localStorage.getItem("mango-grow-projects");
      return raw ? JSON.parse(raw) : SEED_PROJECTS;
    } catch { return SEED_PROJECTS; }
  });
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null);
  const [showBuilder, setShowBuilder] = React.useState(false);

  React.useEffect(() => {
    localStorage.setItem("mango-grow-projects", JSON.stringify(projects));
  }, [projects]);

  function handleCreate(project: Omit<Project, "id" | "progress" | "resources" | "tasks" | "status">) {
    const newProject: Project = { ...project, id: `p-${Date.now()}`, status: "planning", progress: 0, resources: [], tasks: [] };
    setProjects((prev) => [newProject, ...prev]);
    setShowBuilder(false);
  }

  function handleDelete(id: string) {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setSelectedProject(null);
  }

  if (selectedProject) {
    return (
      <PageShell title={selectedProject.name} description={selectedProject.description || ""}>
        <ProjectWorkspace
          project={selectedProject}
          onUpdate={(u) => setProjects((prev) => prev.map((p) => (p.id === selectedProject.id ? { ...p, ...u } : p)))}
          onDelete={() => handleDelete(selectedProject.id)}
          onBack={() => setSelectedProject(null)}
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Mango Friend"
      description="心灵日记 · 情绪追踪 · 心灵树洞 · 项目实践"
      actions={
        activeTab === "projects" ? (
          <Button size="sm" onClick={() => setShowBuilder(true)}><Plus className="size-4" /> 新建项目</Button>
        ) : undefined
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="mind"><Heart className="size-4" /> 心灵花园</TabsTrigger>
          <TabsTrigger value="companion"><MessageCircle className="size-4" /> 心灵树洞</TabsTrigger>
          <TabsTrigger value="projects"><Rocket className="size-4" /> 项目实践</TabsTrigger>
        </TabsList>

        {/* ── 心灵花园：日记 + 心情 + CBT ── */}
        <TabsContent value="mind" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-2">
            <JournalEditor />
            <div className="flex flex-col gap-4">
              <MoodTracker />
              <CbtReframer />
            </div>
          </div>
        </TabsContent>

        {/* ── 心灵树洞：匿名心灵对话 ── */}
        <TabsContent value="companion" className="mt-4">
          <AiCompanionChat />
        </TabsContent>

        {/* ── 项目实践 ── */}
        <TabsContent value="projects" className="mt-4">
          {projects.filter((p) => p.status !== "completed").length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Rocket className="size-10 mx-auto mb-3 opacity-25" />
              <p className="text-sm">还没有进行中的项目</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowBuilder(true)}>
                <Plus className="size-3.5" /> 创建第一个项目
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {projects.filter((p) => p.status !== "completed").map((p) => (
                <button key={p.id} className="text-left" onClick={() => setSelectedProject(p)}>
                  <ProjectCard project={p} />
                </button>
              ))}
            </div>
          )}
          {projects.filter((p) => p.status === "completed").length > 0 && (
            <div className="mt-8">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">已完成项目</h3>
              <ProjectGallery projects={projects.filter((p) => p.status === "completed")} onSelect={setSelectedProject} />
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ProjectBuilder open={showBuilder} onOpenChange={setShowBuilder} onCreate={handleCreate} />
    </PageShell>
  );
}
