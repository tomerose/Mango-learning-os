import type { Flashcard, ReviewGrade } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// SM-2 spaced repetition (SuperMemo 2, Wozniak 1990).
// Pure, deterministic scheduling — given a card + a grade + today,
// returns the next scheduling state. No I/O, no Date inside the
// core math, so it is trivially unit-testable; callers pass `today`.
//
// Four-button UI grades map to SM-2 quality scores q∈[0,5]:
//   again → 2  (lapse: q<3 resets repetitions, review again today/tomorrow)
//   hard  → 3  (recalled with serious difficulty)
//   good  → 4  (recalled correctly)
//   easy  → 5  (recalled effortlessly)
// ─────────────────────────────────────────────────────────────

export const GRADE_QUALITY: Record<ReviewGrade, number> = {
  again: 2,
  hard: 3,
  good: 4,
  easy: 5,
};

const MIN_EASE = 1.3;

/** Add `days` to an ISO date (YYYY-MM-DD) and return a new ISO date. */
export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** Local-time YYYY-MM-DD (avoids the UTC shift of toISOString). */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

/** A card is due when its dueOn is today or earlier. */
export function isDue(card: Flashcard, today = todayISO()): boolean {
  return card.dueOn <= today;
}

/**
 * Apply one review. Returns the updated SM-2 fields for the card.
 * Canonical SM-2: q<3 is a lapse (reset reps, review again); q>=3
 * advances the interval by 1 → 6 → round(prev * ease).
 */
export function review(
  card: Flashcard,
  grade: ReviewGrade,
  today = todayISO()
): Pick<Flashcard, "ease" | "intervalDays" | "repetitions" | "dueOn"> {
  const q = GRADE_QUALITY[grade];

  // Update easiness factor (applies on every grade, floored at 1.3).
  const ease = Math.max(
    MIN_EASE,
    card.ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  );

  let repetitions: number;
  let intervalDays: number;

  if (q < 3) {
    // Lapse — relearn from the start. Due again tomorrow.
    repetitions = 0;
    intervalDays = 1;
  } else {
    repetitions = card.repetitions + 1;
    if (repetitions === 1) intervalDays = 1;
    else if (repetitions === 2) intervalDays = 6;
    else intervalDays = Math.round(card.intervalDays * ease);
  }

  return {
    ease: Math.round(ease * 100) / 100,
    intervalDays,
    repetitions,
    dueOn: addDays(today, intervalDays),
  };
}

/** Human-friendly preview of when a grade would schedule the card next. */
export function intervalPreview(card: Flashcard, grade: ReviewGrade): string {
  const { intervalDays } = review(card, grade, todayISO());
  if (intervalDays <= 1) return "1 天";
  if (intervalDays < 30) return `${intervalDays} 天`;
  if (intervalDays < 365) return `${Math.round(intervalDays / 30)} 个月`;
  return `${(intervalDays / 365).toFixed(1)} 年`;
}

/** Cards due today, ordered most-overdue first. */
export function dueCards(cards: Flashcard[], today = todayISO()): Flashcard[] {
  return cards
    .filter((c) => isDue(c, today))
    .sort((a, b) => a.dueOn.localeCompare(b.dueOn));
}
