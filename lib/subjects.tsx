"use client";

import * as React from "react";

const STORAGE_KEY = "mango-subjects-v1";
const COLORS = [
  "var(--chart-1)", "var(--chart-2)", "var(--chart-3)",
  "var(--chart-4)", "var(--chart-5)", "#f59e0b", "#10b981",
  "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16",
];

export interface SubjectDef {
  id: string;
  label: string;
  short: string;
  color: string;
}

const SEED: SubjectDef[] = [
  { id: "ai",         label: "Artificial Intelligence", short: "AI",   color: COLORS[0] },
  { id: "economics",  label: "Economics",               short: "Econ", color: COLORS[1] },
  { id: "finance",    label: "Finance",                  short: "Fin",  color: COLORS[2] },
  { id: "math",       label: "Mathematics",              short: "Math", color: COLORS[3] },
  { id: "english",    label: "English",                  short: "Eng",  color: COLORS[4] },
];

function load(): SubjectDef[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : SEED;
  } catch { return SEED; }
}
function save(items: SubjectDef[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
}

interface SubjectCtx {
  subjects: SubjectDef[];
  addSubject: (s: Omit<SubjectDef, "color">) => void;
  removeSubject: (id: string) => void;
  getMeta: (id: string) => SubjectDef;
  getColor: (id: string) => string;
}

const Ctx = React.createContext<SubjectCtx | null>(null);

export function SubjectProvider({ children }: { children: React.ReactNode }) {
  const [subjects, setSubjects] = React.useState<SubjectDef[]>([]);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    setSubjects(load());
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (hydrated) save(subjects);
  }, [subjects, hydrated]);

  const addSubject = React.useCallback((s: Omit<SubjectDef, "color">) => {
    setSubjects(prev => {
      if (prev.find(x => x.id === s.id)) return prev;
      const usedColors = new Set(prev.map(x => x.color));
      const nextColor = COLORS.find(c => !usedColors.has(c)) ?? COLORS[prev.length % COLORS.length];
      return [...prev, { ...s, color: nextColor }];
    });
  }, []);

  const removeSubject = React.useCallback((id: string) => {
    setSubjects(prev => prev.filter(x => x.id !== id));
  }, []);

  const getMeta = React.useCallback(
    (id: string) => subjects.find(s => s.id === id) ?? { id, label: id, short: id.slice(0, 4), color: COLORS[0] },
    [subjects]
  );

  const getColor = React.useCallback(
    (id: string) => getMeta(id).color,
    [getMeta]
  );

  const value = React.useMemo(() => ({
    subjects, addSubject, removeSubject, getMeta, getColor,
  }), [subjects, addSubject, removeSubject, getMeta, getColor]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSubjects(): SubjectCtx {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useSubjects must be used within SubjectProvider");
  return ctx;
}

// Non-reactive getter for non-React contexts (API routes can't use hooks)
export function getStoredSubjects(): SubjectDef[] {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    return raw ? JSON.parse(raw) : SEED;
  } catch { return SEED; }
}
