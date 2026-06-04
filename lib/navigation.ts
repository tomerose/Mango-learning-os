import {
  LayoutDashboard,
  Bot,
  CalendarCheck,
  Library,
  GraduationCap,
  User,
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
    title: "Profile",
    href: "/profile",
    icon: User,
    description: "XP, achievements, statistics & reflections",
  },
];

export const SUBJECTS = [
  { id: "ai", label: "Artificial Intelligence", color: "var(--chart-1)" },
  { id: "economics", label: "Economics", color: "var(--chart-2)" },
  { id: "finance", label: "Finance", color: "var(--chart-3)" },
  { id: "math", label: "Mathematics", color: "var(--chart-4)" },
  { id: "english", label: "English", color: "var(--chart-5)" },
] as const;

export type SubjectId = (typeof SUBJECTS)[number]["id"];
