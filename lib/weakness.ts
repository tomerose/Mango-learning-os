import type { QuizAttempt, WeakArea } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// Weakness analysis. Pure aggregation over quiz attempts — no I/O,
// deterministic, unit-testable. Groups attempts by subject+topic,
// pools correct/total across runs, and ranks weakest-first so the
// Exam Mode panel and the practice-loop deep link both read from one
// source of truth.
// ─────────────────────────────────────────────────────────────

// Pool every attempt for a (subject, topic) pair, then accuracy is the
// pooled correct/total — not an average of per-run rates, which would
// over-weight a single lucky 1-question run.
export function aggregateWeakAreas(attempts: QuizAttempt[]): WeakArea[] {
  const buckets = new Map<
    string,
    { subject: QuizAttempt["subject"]; topic: string; correct: number; total: number; attempts: number }
  >();

  for (const a of attempts) {
    if (a.total <= 0) continue;
    const key = `${a.subject}::${a.topic}`;
    const b =
      buckets.get(key) ??
      { subject: a.subject, topic: a.topic, correct: 0, total: 0, attempts: 0 };
    b.correct += a.correct;
    b.total += a.total;
    b.attempts += 1;
    buckets.set(key, b);
  }

  return [...buckets.values()]
    .map((b) => ({
      subject: b.subject,
      topic: b.topic,
      accuracy: Math.round((b.correct / b.total) * 100),
      attempts: b.attempts,
    }))
    .sort((a, b) => a.accuracy - b.accuracy); // weakest first
}

// The single weakest topic — drives the "生成针对性练习" deep link.
export function weakestArea(attempts: QuizAttempt[]): WeakArea | null {
  const areas = aggregateWeakAreas(attempts);
  return areas[0] ?? null;
}
