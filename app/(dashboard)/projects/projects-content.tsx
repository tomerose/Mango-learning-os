"use client";

import * as React from "react";
import { Plus, Rocket, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectBuilder } from "@/components/projects/project-builder";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectWorkspace } from "@/components/projects/project-workspace";
import { ProjectGallery } from "@/components/projects/project-gallery";
import type { Project } from "@/components/projects/project-card";

// ─── Local storage persistence ─────────────────────────────────

const STORAGE_KEY = "mango-projects-v1";

function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveProjects(projects: Project[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  } catch {
    // Storage full — degrade to in-memory
  }
}

// ─── Seed data ─────────────────────────────────────────────────

const SEED_PROJECTS: Project[] = [
  {
    id: "proj-seed-1",
    name: "Build a Stock Price Predictor",
    subject: "finance",
    description:
      "Build a machine learning model to predict stock prices using historical data and technical indicators.",
    difficulty: "intermediate",
    learningGoals: [
      "Understand time series analysis",
      "Implement linear regression from scratch",
      "Evaluate model performance with RMSE",
    ],
    status: "in_progress",
    progress: 45,
    startDate: new Date(Date.now() - 7 * 86400000).toISOString(),
    resources: [],
    tasks: [
      { id: "t1", title: "Collect historical stock data", done: true },
      { id: "t2", title: "Clean and preprocess data", done: true },
      { id: "t3", title: "Implement linear regression model", done: false },
      { id: "t4", title: "Train and evaluate model", done: false },
      { id: "t5", title: "Write project report", done: false },
    ],
  },
  {
    id: "proj-seed-2",
    name: "Economics Case Study: GDP Analysis",
    subject: "economics",
    description:
      "Analyze GDP trends across OECD countries and identify key economic drivers.",
    difficulty: "beginner",
    learningGoals: [
      "Understand GDP components",
      "Learn data visualization with charts",
      "Write an economic analysis report",
    ],
    status: "in_progress",
    progress: 20,
    startDate: new Date(Date.now() - 3 * 86400000).toISOString(),
    resources: [],
    tasks: [
      { id: "t1", title: "Research GDP calculation methods", done: true },
      { id: "t2", title: "Collect OECD GDP data", done: false },
      { id: "t3", title: "Create data visualizations", done: false },
    ],
  },
  {
    id: "proj-seed-3",
    name: "Neural Network from Scratch",
    subject: "ai",
    description:
      "Implement a feedforward neural network with backpropagation using only NumPy.",
    difficulty: "advanced",
    learningGoals: [
      "Understand neural network architecture",
      "Implement forward and backward propagation",
      "Train on MNIST dataset",
    ],
    status: "completed",
    progress: 100,
    startDate: new Date(Date.now() - 21 * 86400000).toISOString(),
    resources: [],
    tasks: [
      { id: "t1", title: "Implement dense layer", done: true },
      { id: "t2", title: "Implement activation functions", done: true },
      { id: "t3", title: "Implement backpropagation", done: true },
      { id: "t4", title: "Train on MNIST", done: true },
      { id: "t5", title: "Achieve >90% accuracy", done: true },
    ],
    submissionContent:
      "Implemented a 2-layer neural network with ReLU activation and softmax output. Achieved 92% accuracy on MNIST test set after 10 epochs.",
    review: {
      scores: {
        correctness: 9,
        completeness: 8,
        creativity: 8,
        bestPractices: 7,
      },
      suggestions: [
        "Add more detailed comments explaining the math behind backpropagation",
        "Consider implementing batch normalization for faster convergence",
        "Add unit tests for individual layer operations",
      ],
      summary:
        "Excellent work! Your neural network implementation is correct and achieves strong performance. The code is well-structured overall. To take this further, consider adding more architectural features like dropout or batch normalization, and improve test coverage.",
    },
  },
];

// ─── Component ─────────────────────────────────────────────────

export function ProjectsContent() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [hydrated, setHydrated] = React.useState(false);
  const [builderOpen, setBuilderOpen] = React.useState(false);
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(
    null
  );

  // Load from localStorage on mount
  React.useEffect(() => {
    const stored = loadProjects();
    setProjects(stored.length > 0 ? stored : SEED_PROJECTS);
    setHydrated(true);
  }, []);

  // Persist on changes
  React.useEffect(() => {
    if (hydrated) saveProjects(projects);
  }, [projects, hydrated]);

  // ── Actions ─────────────────────────────────────────────────

  function handleCreate(
    data: Omit<
      Project,
      "id" | "progress" | "resources" | "tasks" | "status"
    >
  ) {
    const newProject: Project = {
      ...data,
      id: `proj-${Date.now()}`,
      status: "planning",
      progress: 0,
      resources: [],
      tasks: [],
    };
    setProjects((prev) => [newProject, ...prev]);
    // Automatically select the new project
    setSelectedProject(newProject);
  }

  function handleUpdate(updated: Project) {
    setProjects((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
    setSelectedProject(updated);
  }

  function handleSelect(project: Project) {
    setSelectedProject(project);
  }

  function handleBack() {
    setSelectedProject(null);
  }

  // ── Derived data ────────────────────────────────────────────

  const inProgress = projects.filter(
    (p) => p.status !== "completed"
  );

  if (!hydrated) return null;

  // ── Workspace view ──────────────────────────────────────────
  if (selectedProject) {
    // Refresh selected project from state
    const current = projects.find((p) => p.id === selectedProject.id);
    if (!current) {
      setSelectedProject(null);
      return null;
    }
    return (
      <ProjectWorkspace
        project={current}
        onBack={handleBack}
        onUpdate={handleUpdate}
      />
    );
  }

  // ── List view ───────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Rocket className="size-5 text-primary" />
          My Projects
          <span className="text-muted-foreground text-sm font-normal">
            ({inProgress.length})
          </span>
        </h2>
        <Button
          onClick={() => setBuilderOpen(true)}
          className="rounded-xl"
        >
          <Plus className="size-4 mr-2" /> New Project
        </Button>
      </div>

      {/* In-progress projects */}
      {inProgress.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="size-16 rounded-full bg-muted/50 flex items-center justify-center">
            <Rocket className="size-8 text-muted-foreground/30" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              No active projects
            </p>
            <p className="text-xs text-muted-foreground/50 mt-1 max-w-xs">
              Create your first project to start learning by building. Get AI
              review and build your portfolio.
            </p>
          </div>
          <Button
            onClick={() => setBuilderOpen(true)}
            variant="outline"
            className="rounded-xl"
          >
            <Plus className="size-4 mr-2" /> Create Project
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {inProgress.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={handleSelect}
            />
          ))}
        </div>
      )}

      {/* Project Gallery (completed) */}
      <div className="mt-2">
        <ProjectGallery
          projects={projects}
          onSelect={handleSelect}
        />
      </div>

      {/* Project Builder Dialog */}
      <ProjectBuilder
        open={builderOpen}
        onOpenChange={setBuilderOpen}
        onCreate={handleCreate}
      />
    </div>
  );
}
