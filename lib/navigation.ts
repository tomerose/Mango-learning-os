import {
  LayoutDashboard,
  Bot,
  CalendarCheck,
  Library,
  GraduationCap,
  User,
  Dna,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description: string;
}

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Today's tasks, goals, progress & streaks",
  },
  {
    title: "AI Tutor",
    href: "/ai-tutor",
    icon: Bot,
    description: "Concept explanation, quizzes & study help",
  },
  {
    title: "Study Planner",
    href: "/study-planner",
    icon: CalendarCheck,
    description: "Daily, weekly, monthly & semester plans",
  },
  {
    title: "Knowledge Hub",
    href: "/knowledge-hub",
    icon: Library,
    description: "Notes, flashcards, resources & knowledge graph",
  },
  {
    title: "Exam Mode",
    href: "/exam-mode",
    icon: GraduationCap,
    description: "Course review, mock tests & weakness analysis",
  },
  {
    title: "Mango DNA",
    href: "/mango-dna",
    icon: Dna,
    description: "AI persona, thinking style & long-term memory",
  },
  {
    title: "Profile",
    href: "/profile",
    icon: User,
    description: "XP, achievements, statistics & reflections",
  },
];

export { getStoredSubjects as getSubjects, type SubjectDef } from "@/lib/subjects";
export type SubjectId = string;
