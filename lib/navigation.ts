import {
  LayoutDashboard,
  Bot,
  CalendarCheck,
  Library,
  GraduationCap,
  User,
  Dna,
  Heart,
  BookMarked,
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
    title: "Mind Garden",
    href: "/mind-garden",
    icon: Heart,
    description: "Personal reflection, emotional support & CBT journal",
  },
  {
    title: "Exam Master",
    href: "/exam-master",
    icon: BookMarked,
    description: "Structured final exam preparation & review packages",
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
