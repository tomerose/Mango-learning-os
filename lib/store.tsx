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
  setTaskDone,
  upsertTask,
  insertNote,
  updateNote as updateNoteCloud,
  deleteNote as deleteNoteCloud,
  insertReflection,
  insertQuizAttempt,
  updateFlashcardSchedule,
  addProfileXp,
  migrateGuestToCloud,
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

// 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
// Dual-mode persistence store.
//
//   鈥?cloud  鈥?Supabase configured AND a user session exists. Reads/writes
//              the database; XP lives in the profiles row. First login on
//              an empty account is seeded with the demo content.
//   鈥?guest  鈥?no Supabase env (or no session). Falls back to localStorage,
//              exactly as before, so the product still runs with zero config.
//
// Mode is decided once on mount. The useStore() surface is identical in both
// modes, so no component knows or cares which backend is live.
//
// Action side-effects (network writes) fire OUTSIDE the setState updater,
// reading current state from stateRef 鈥?otherwise React Strict Mode's
// double-invoked updaters would double-fire writes (e.g. double XP).
// 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€

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
  storagePreference: "local" | "cloud";
  setStoragePreference: (pref: "local" | "cloud") => void;
  syncLocalToCloud: () => Promise<void>;
  guestActionCount: number;
  guestActionLimit: number;
  incrementGuestAction: () => boolean; // returns false if limit reached
  toggleTask: (id: string) => void;
  addTask: (task: Omit<Task, "id">) => void;
  addNote: (note: Omit<Note, "id" | "updatedLabel">) => void;
  updateNote: (id: string, updates: Partial<Omit<Note, "id" | "updatedLabel">>) => void;
  deleteNote: (id: string) => void;
  addReflection: (r: Omit<Reflection, "id" | "dateLabel">) => void;
  reviewCard: (id: string, grade: ReviewGrade) => void;
  recordQuiz: (a: Omit<QuizAttempt, "id" | "createdAt">) => void;
}

const initialState: StoreState = {
  tasks: [],
  notes: [],
  reflections: [],
  flashcards: [],
  quizAttempts: [],
  mode: "guest",
  userId: null,
  xp: 0,
  streakDays: 0,
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
      minutesToday: 0,
      minutesGoal: 180,
      tasksDoneToday: doneToday,
      tasksTotalToday: s.tasks.length,
    };
  }

  // guest 鈥?preserve the original seed-based display, only XP + task counts move
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

  // 鈹€鈹€ Mode detection + initial load 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
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

      // Configured but no session = the visitor chose "缁х画浠ユ父瀹㈣韩浠?
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

      // Cloud path — fetch user data from Supabase.
      const [cloudTasks, cloudNotes, cloudFlashcards, cloudReflections, cloudQuizAttempts] =
        await Promise.all([
          fetchTasks(),
          fetchNotes(),
          fetchFlashcards(),
          fetchReflections(),
          fetchQuizAttempts(),
        ]);
      const profile = await fetchProfile(user.id);

      // First login — if cloud data is empty, auto-seed demo data
      // so users see value immediately instead of empty states
      const isEmpty = cloudTasks.length === 0 && cloudNotes.length === 0;
      const demoData = isEmpty ? {
        tasks: seedTasks,
        notes: seedNotes,
        reflections: seedReflections,
        flashcards: seedFlashcards,
        quizAttempts: seedQuizAttempts,
      } : null;

      if (isEmpty && demoData) {
        // Fire-and-forget: migrate demo data to Supabase
        import("@/lib/supabase/queries").then(({ migrateGuestToCloud }) => {
          migrateGuestToCloud(user.id, demoData).catch((e) =>
            console.error("[store] auto-seed failed:", e),
          );
        });
      }

      if (cancelled) return;
      setState({
        tasks: isEmpty ? demoData!.tasks : cloudTasks,
        notes: isEmpty ? demoData!.notes : cloudNotes,
        reflections: isEmpty ? demoData!.reflections : cloudReflections,
        flashcards: isEmpty ? demoData!.flashcards : cloudFlashcards,
        quizAttempts: isEmpty ? demoData!.quizAttempts : cloudQuizAttempts,
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

  // ── Knowledge Extraction trigger ──────────────────────────
  const triggerKnowledgeExtraction = React.useCallback((n: Note) => {
    // Fire-and-forget: AI knowledge extraction
    import("@/lib/ai/knowledge-engine").then(({ extractFromNote }) => {
      extractFromNote(n).then((result) => {
        // Auto-add extracted tags to the note (if not already present)
        if (result.autoTags.length > 0 || result.flashcards.length > 0) {
          // Store extraction results in localStorage for the Knowledge Network
          try {
            const key = `mango-extraction-${n.id}`;
            localStorage.setItem(key, JSON.stringify(result));
          } catch {}
        }
        // Auto-add generated flashcards
        if (result.flashcards.length > 0) {
          const newCards = result.flashcards.map((f, i) => ({
            id: `fc-${n.id}-${i}`,
            deck: n.subject,
            subject: n.subject,
            front: f.front,
            back: f.back,
            ease: 2.5,
            intervalDays: 0,
            repetitions: 0,
            dueOn: new Date().toISOString().slice(0, 10),
          }));
          setState((p) => ({ ...p, flashcards: [...newCards, ...p.flashcards] }));
        }
      }).catch(() => {/* extraction is best-effort */});
    }).catch(() => {/* module may not be available */});
  }, []);

  // ── Storage preference ───────────────────────────────────
  const [storagePreference, setStoragePreferenceState] = React.useState<"local" | "cloud">(() => {
    try { return (localStorage.getItem("mango-storage-pref") as "local" | "cloud") || "local"; }
    catch { return "local"; }
  });

  // ── Guest 2-use total limit (persisted in localStorage, ref for instant reads) ──
  const GUEST_LIMIT = 50; // Full demo experience; limit only cloud writes
  const GUEST_COUNT_KEY = "mango-guest-action-count";
  const [guestActionCount, setGuestActionCount] = React.useState(() => {
    try { return parseInt(localStorage.getItem(GUEST_COUNT_KEY) ?? "0", 10); }
    catch { return 0; }
  });
  const guestCountRef = React.useRef(guestActionCount);

  const incrementGuestAction = React.useCallback((): boolean => {
    const prev = stateRef.current;
    if (prev.mode === "cloud") return true;
    const next = guestCountRef.current + 1;
    guestCountRef.current = next;
    setGuestActionCount(next);
    try { localStorage.setItem(GUEST_COUNT_KEY, String(next)); } catch {}
    return next <= GUEST_LIMIT;
  }, []);

  // Guest: force local-only storage
  const effectiveStorageMode = state.mode === "cloud" ? storagePreference : "local";

  // Persist: always to localStorage when storagePreference is "local"
  // StoragePreference "cloud" → only Supabase (no localStorage dual-write)
  React.useEffect(() => {
    if (!hydrated) return;
    if (state.mode !== "guest" && storagePreference !== "local") return;
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
    } catch { /* storage full */ }
  }, [state, hydrated, storagePreference]);

  // 鈹€鈹€ Actions 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
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

  const addTask = React.useCallback(
    (task: Omit<Task, "id">) => {
      if (!incrementGuestAction()) return; // guest limit reached
      const prev = stateRef.current;
      if (prev.mode === "cloud" && prev.userId) {
        upsertTask(prev.userId, task).catch((e) =>
          console.error("[store] upsertTask:", e)
        );
        // Refetch tasks to get the server-assigned (or client-generated) row.
        fetchTasks()
          .then((fresh) => setState((p) => ({ ...p, tasks: fresh })))
          .catch((e) => console.error("[store] fetchTasks after add:", e));
      } else {
        const id = `t-${prev.tasks.length}-${Date.now()}`;
        setState((p) => ({
          ...p,
          tasks: [...p.tasks, { ...task, id } as Task],
        }));
      }
    },
    []
  );

  const addNote = React.useCallback(
    (note: Omit<Note, "id" | "updatedLabel">) => {
      const prev = stateRef.current;
      if (!incrementGuestAction()) return; // guest limit reached

      const newId = `n-${prev.notes.length}-${Date.now()}`;
      const savedNote = { ...note, id: newId, updatedLabel: "刚刚" } as Note;

      if (prev.mode === "cloud" && prev.userId && storagePreference === "cloud") {
        insertNote(prev.userId, note)
          .then((saved) => {
            setState((p) => ({ ...p, notes: [saved, ...p.notes] }));
            // Auto-extract knowledge from new note
            triggerKnowledgeExtraction(saved ?? savedNote);
          })
          .catch((e) => console.error("[store] insertNote:", e));
      } else {
        setState((p) => ({ ...p, notes: [savedNote, ...p.notes] }));
        // Auto-extract knowledge from new note
        triggerKnowledgeExtraction(savedNote);
      }
    },
    [incrementGuestAction, storagePreference]
  );

  const deleteNote = React.useCallback((id: string) => {
    const prev = stateRef.current;
    setState((p) => ({ ...p, notes: p.notes.filter((n) => n.id !== id) }));
    if (prev.mode === "cloud") {
      deleteNoteCloud(id).catch((e) => console.error("[store] deleteNote:", e));
    }
  }, []);

  const updateNote = React.useCallback((id: string, updates: Partial<Omit<Note, "id" | "updatedLabel">>) => {
    setState((p) => ({
      ...p,
      notes: p.notes.map((n) =>
        n.id === id ? { ...n, ...updates, updatedLabel: "刚刚编辑" } : n
      ),
    }));
    const prev = stateRef.current;
    if (prev.mode === "cloud") {
      updateNoteCloud(id, updates).catch((e) => console.error("[store] updateNote:", e));
    }
  }, []);

  const addReflection = React.useCallback(
    (r: Omit<Reflection, "id" | "dateLabel">) => {
      const prev = stateRef.current;
      if (prev.mode === "cloud" && prev.userId && storagePreference === "cloud") {
        insertReflection(prev.userId, r)
          .then((saved) =>
            setState((p) => ({ ...p, reflections: [saved, ...p.reflections] }))
          )
          .catch((e) => console.error("[store] insertReflection:", e));
      } else {
        setState((p) => ({
          ...p,
          reflections: [
            { ...r, id: `r-${p.reflections.length}-${Date.now()}`, dateLabel: "浠婂ぉ" },
            ...p.reflections,
          ],
        }));
      }
    },
    [storagePreference]
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

  // Record a graded quiz run. XP scales with the score (correct 脳 per-task/6,
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

  const setStoragePreference = React.useCallback((pref: "local" | "cloud") => {
    setStoragePreferenceState(pref);
    try { localStorage.setItem("mango-storage-pref", pref); } catch {}
  }, []);

  const syncLocalToCloud = React.useCallback(async () => {
    const prev = stateRef.current;
    if (!prev.userId || prev.mode !== "cloud") return;
    try {
      await migrateGuestToCloud(prev.userId, {
        tasks: prev.tasks, notes: prev.notes, reflections: prev.reflections,
        flashcards: prev.flashcards, quizAttempts: prev.quizAttempts,
      });
    } catch (e) { console.error("[store] syncLocalToCloud failed:", e); throw e; }
  }, []);

  const value = React.useMemo<StoreValue>(
    () => ({
      ...state,
      hydrated,
      stats: deriveStats(state),
      weakAreas: aggregateWeakAreas(state.quizAttempts),
      storagePreference,
      setStoragePreference,
      syncLocalToCloud,
      guestActionCount,
      guestActionLimit: GUEST_LIMIT,
      incrementGuestAction,
      toggleTask,
      addTask,
      addNote,
      updateNote,
      deleteNote,
      addReflection,
      reviewCard,
      recordQuiz,
    }),
    [
      state,
      hydrated,
      storagePreference,
      setStoragePreference,
      syncLocalToCloud,
      guestActionCount,
      incrementGuestAction,
      toggleTask,
      addTask,
      addNote,
      updateNote,
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
