"use client";

import * as React from "react";
import { seedStats } from "@/lib/mock-data";
import { review, todayISO } from "@/lib/srs";
import { aggregateWeakAreas } from "@/lib/weakness";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import {
  fetchTasks,
  fetchNotes,
  fetchFlashcards,
  fetchReflections,
  fetchQuizAttempts,
  fetchProfile,
  seedNewUser,
  setTaskDone,
  insertNote,
  deleteNote as deleteNoteCloud,
  insertReflection,
  insertQuizAttempt,
  updateFlashcardSchedule,
  addProfileXp,
} from "@/lib/supabase/queries";
import {
  seedTasks,
  seedNotes,
  seedReflections,
  seedFlashcards,
  seedQuizAttempts,
} from "@/lib/mock-data";
import type {
  DashboardStats,
  Flashcard,
  Note,
  QuizAttempt,
  Reflection,
  ReviewGrade,
  Task,
  WeakArea,
} from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// Dual-mode persistence store.
//
//   • cloud  — Supabase configured AND a user session exists. Reads/writes
//              the database; XP lives in the profiles row. First login on
//              an empty account is seeded with the demo content.
//   • guest  — no Supabase env (or no session). Falls back to localStorage,
//              exactly as before, so the product still runs with zero config.
//
// Mode is decided once on mount. The useStore() surface is identical in both
// modes, so no component knows or cares which backend is live.
//
// Action side-effects (network writes) fire OUTSIDE the setState updater,
// reading current state from stateRef — otherwise React Strict Mode's
// double-invoked updaters would double-fire writes (e.g. double XP).
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = "ai-learning-os::v3";
const XP_PER_TASK = 30;
const XP_PER_REVIEW = 5;
const XP_PER_LEVEL = 500;

type Mode = "guest" | "cloud";

interface StoreState {
  tasks: Task[];
  notes: Note[];
  reflections: Reflection[];
  flashcards: Flashcard[];
  quizAttempts: QuizAttempt[];
  mode: Mode;
  userId: string | null;
  // guest: XP gained this session (added to seed base in deriveStats)
  // cloud: absolute total XP from the profiles row
  xp: number;
  streakDays: number;
}

interface StoreValue extends StoreState {
  hydrated: boolean;
  stats: DashboardStats;
  weakAreas: WeakArea[];
  toggleTask: (id: string) => void;
  addNote: (note: Omit<Note, "id" | "updatedLabel">) => void;
  deleteNote: (id: string) => void;
  addReflection: (r: Omit<Reflection, "id" | "dateLabel">) => void;
  reviewCard: (id: string, grade: ReviewGrade) => void;
  recordQuiz: (a: Omit<QuizAttempt, "id" | "createdAt">) => void;
}

const initialState: StoreState = {
  tasks: seedTasks,
  notes: seedNotes,
  reflections: seedReflections,
  flashcards: seedFlashcards,
  quizAttempts: seedQuizAttempts,
  mode: "guest",
  userId: null,
  xp: 0,
  streakDays: seedStats.streakDays,
};

const StoreContext = React.createContext<StoreValue | null>(null);

// ---- guest localStorage --------------------------------------
interface GuestSnapshot {
  tasks: Task[];
  notes: Note[];
  reflections: Reflection[];
  flashcards: Flashcard[];
  quizAttempts: QuizAttempt[];
  xp: number;
}

function loadGuest(): GuestSnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GuestSnapshot>;
    return {
      tasks: parsed.tasks ?? seedTasks,
      notes: parsed.notes ?? seedNotes,
      reflections: parsed.reflections ?? seedReflections,
      flashcards: parsed.flashcards ?? seedFlashcards,
      quizAttempts: parsed.quizAttempts ?? seedQuizAttempts,
      xp: parsed.xp ?? 0,
    };
  } catch {
    return null;
  }
}

function deriveStats(s: StoreState): DashboardStats {
  const doneToday = s.tasks.filter((t) => t.done).length;

  if (s.mode === "cloud") {
    const level = Math.floor(s.xp / XP_PER_LEVEL) + 1;
    return {
      streakDays: s.streakDays,
      totalXp: s.xp,
      level,
      xpForCurrentLevel: (level - 1) * XP_PER_LEVEL,
      xpToNextLevel: level * XP_PER_LEVEL,
      minutesToday: seedStats.minutesToday,
      minutesGoal: seedStats.minutesGoal,
      tasksDoneToday: doneToday,
      tasksTotalToday: s.tasks.length,
    };
  }

  // guest — preserve the original seed-based display, only XP + task counts move
  return {
    ...seedStats,
    totalXp: seedStats.totalXp + s.xp,
    tasksDoneToday: doneToday,
    tasksTotalToday: s.tasks.length,
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<StoreState>(initialState);
  const [hydrated, setHydrated] = React.useState(false);

  // Mirror state into a ref so actions can read the latest value without
  // running network side-effects inside the (possibly double-invoked) updater.
  const stateRef = React.useRef(state);
  React.useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ── Mode detection + initial load ──────────────────────────
  React.useEffect(() => {
    let cancelled = false;

    async function init() {
      // Guest path: no backend configured.
      if (!isSupabaseConfigured()) {
        const snap = loadGuest();
        if (!cancelled && snap) {
          setState((s) => ({ ...s, ...snap, mode: "guest" }));
        }
        if (!cancelled) setHydrated(true);
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Configured but no session = the visitor chose "继续以游客身份"
      // (middleware let them through on the guest cookie). Run on
      // localStorage just like the unconfigured guest path.
      if (!user) {
        const snap = loadGuest();
        if (!cancelled && snap) {
          setState((s) => ({ ...s, ...snap, mode: "guest" }));
        }
        if (!cancelled) setHydrated(true);
        return;
      }

      // Cloud path.
      let [tasks, notes, flashcards, reflections, quizAttempts] =
        await Promise.all([
          fetchTasks(),
          fetchNotes(),
          fetchFlashcards(),
          fetchReflections(),
          fetchQuizAttempts(),
        ]);
      const profile = await fetchProfile(user.id);

      // First login on a fresh account → seed demo content, then refetch.
      if (
        tasks.length === 0 &&
        notes.length === 0 &&
        flashcards.length === 0
      ) {
        await seedNewUser(user.id);
        [tasks, notes, flashcards, reflections, quizAttempts] =
          await Promise.all([
            fetchTasks(),
            fetchNotes(),
            fetchFlashcards(),
            fetchReflections(),
            fetchQuizAttempts(),
          ]);
      }

      if (cancelled) return;
      setState({
        tasks,
        notes,
        reflections,
        flashcards,
        quizAttempts,
        mode: "cloud",
        userId: user.id,
        xp: profile?.total_xp ?? 0,
        streakDays: profile?.streak_days ?? 0,
      });
      setHydrated(true);
    }

    init().catch((err) => {
      console.error("[store] init failed:", err);
      if (!cancelled) setHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // ── Persist (guest mode only; cloud lives in the DB) ───────
  React.useEffect(() => {
    if (!hydrated || state.mode !== "guest") return;
    try {
      const snap: GuestSnapshot = {
        tasks: state.tasks,
        notes: state.notes,
        reflections: state.reflections,
        flashcards: state.flashcards,
        quizAttempts: state.quizAttempts,
        xp: state.xp,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snap));
    } catch {
      // storage full / disabled — degrade to in-memory only
    }
  }, [state, hydrated]);

  // ── Actions ────────────────────────────────────────────────
  const toggleTask = React.useCallback((id: string) => {
    const prev = stateRef.current;
    const task = prev.tasks.find((t) => t.id === id);
    if (!task) return;
    const newDone = !task.done;
    const delta = newDone ? XP_PER_TASK : -XP_PER_TASK;

    setState((p) => ({
      ...p,
      tasks: p.tasks.map((t) => (t.id === id ? { ...t, done: newDone } : t)),
      xp: Math.max(0, p.xp + delta),
    }));

    if (prev.mode === "cloud" && prev.userId) {
      setTaskDone(id, newDone).catch((e) => console.error("[store] setTaskDone:", e));
      addProfileXp(prev.userId, delta).catch((e) =>
        console.error("[store] addProfileXp:", e)
      );
    }
  }, []);

  const addNote = React.useCallback(
    (note: Omit<Note, "id" | "updatedLabel">) => {
      const prev = stateRef.current;
      if (prev.mode === "cloud" && prev.userId) {
        insertNote(prev.userId, note)
          .then((saved) =>
            setState((p) => ({ ...p, notes: [saved, ...p.notes] }))
          )
          .catch((e) => console.error("[store] insertNote:", e));
      } else {
        setState((p) => ({
          ...p,
          notes: [
            {
              ...note,
              id: `n-${p.notes.length}-${Date.now()}`,
              updatedLabel: "刚刚",
            },
            ...p.notes,
          ],
        }));
      }
    },
    []
  );

  const deleteNote = React.useCallback((id: string) => {
    const prev = stateRef.current;
    setState((p) => ({ ...p, notes: p.notes.filter((n) => n.id !== id) }));
    if (prev.mode === "cloud") {
      deleteNoteCloud(id).catch((e) => console.error("[store] deleteNote:", e));
    }
  }, []);

  const addReflection = React.useCallback(
    (r: Omit<Reflection, "id" | "dateLabel">) => {
      const prev = stateRef.current;
      if (prev.mode === "cloud" && prev.userId) {
        insertReflection(prev.userId, r)
          .then((saved) =>
            setState((p) => ({ ...p, reflections: [saved, ...p.reflections] }))
          )
          .catch((e) => console.error("[store] insertReflection:", e));
      } else {
        setState((p) => ({
          ...p,
          reflections: [
            { ...r, id: `r-${p.reflections.length}-${Date.now()}`, dateLabel: "今天" },
            ...p.reflections,
          ],
        }));
      }
    },
    []
  );

  const reviewCard = React.useCallback((id: string, grade: ReviewGrade) => {
    const prev = stateRef.current;
    const card = prev.flashcards.find((c) => c.id === id);
    if (!card) return;
    const sm2 = review(card, grade, todayISO());

    setState((p) => ({
      ...p,
      flashcards: p.flashcards.map((c) =>
        c.id === id ? { ...c, ...sm2 } : c
      ),
      xp: p.xp + XP_PER_REVIEW,
    }));

    if (prev.mode === "cloud" && prev.userId) {
      updateFlashcardSchedule(id, sm2).catch((e) =>
        console.error("[store] updateFlashcardSchedule:", e)
      );
      addProfileXp(prev.userId, XP_PER_REVIEW).catch((e) =>
        console.error("[store] addProfileXp:", e)
      );
    }
  }, []);

  // Record a graded quiz run. XP scales with the score (correct × per-task/6,
  // a light reward) so quizzing nudges the same progression as tasks/reviews.
  const recordQuiz = React.useCallback(
    (a: Omit<QuizAttempt, "id" | "createdAt">) => {
      const prev = stateRef.current;
      const xpGain = a.correct * 3;

      if (prev.mode === "cloud" && prev.userId) {
        insertQuizAttempt(prev.userId, a)
          .then((saved) =>
            setState((p) => ({
              ...p,
              quizAttempts: [saved, ...p.quizAttempts],
              xp: p.xp + xpGain,
            }))
          )
          .catch((e) => console.error("[store] insertQuizAttempt:", e));
        addProfileXp(prev.userId, xpGain).catch((e) =>
          console.error("[store] addProfileXp:", e)
        );
      } else {
        setState((p) => ({
          ...p,
          quizAttempts: [
            {
              ...a,
              id: `qa-${p.quizAttempts.length}-${Date.now()}`,
              createdAt: new Date().toISOString(),
            },
            ...p.quizAttempts,
          ],
          xp: p.xp + xpGain,
        }));
      }
    },
    []
  );

  const value = React.useMemo<StoreValue>(
    () => ({
      ...state,
      hydrated,
      stats: deriveStats(state),
      weakAreas: aggregateWeakAreas(state.quizAttempts),
      toggleTask,
      addNote,
      deleteNote,
      addReflection,
      reviewCard,
      recordQuiz,
    }),
    [
      state,
      hydrated,
      toggleTask,
      addNote,
      deleteNote,
      addReflection,
      reviewCard,
      recordQuiz,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = React.useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
