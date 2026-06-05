import { PageShell } from "@/components/layout/page-shell";
import { ProjectsContent } from "./projects-content";

export const metadata = { title: "Projects · MangoLearningOS V2" };

export default function ProjectsPage() {
  return (
    <PageShell
      title="Learning Projects"
      description="Learn by building — create projects, get AI review, and showcase your work"
      maxWidth="xl"
    >
      <ProjectsContent />
    </PageShell>
  );
}
