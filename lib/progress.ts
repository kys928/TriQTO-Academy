import type { Question } from "./content.ts";

export type Attempt = { firstCorrect: boolean; recovered: boolean; earnedRecovery?: boolean; guided?: boolean };
type Review = { due: string; step: number };
export type Progress = {
  xp: number;
  days: string[];
  completed: string[];
  attempts: Record<string, Attempt>;
  review: Record<string, Review>;
  position: Record<string, number>;
  current: string;
  helpUsed?: Record<string, true>;
};
export type Answer = string | string[];
export const storageKey = "triqto-academy-v1";
export const blank: Progress = { xp: 0, days: [], completed: [], attempts: {}, review: {}, position: {}, current: "eigenvalues" };
const numericPattern = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i;

function numberValue(raw: string) {
  const value = raw.trim().replace(",", ".");
  if (numericPattern.test(value)) return Number(value);
  const terms = value.split("/").map(term => term.trim());
  if (terms.length === 2 && terms.every(term => numericPattern.test(term)) && Number(terms[1]) !== 0) {
    return Number(terms[0]) / Number(terms[1]);
  }
  return NaN;
}

export function canSubmit(question: Question, answer: Answer) {
  if (question.kind === "match") {
    return Array.isArray(answer) && answer.length === question.pairs?.length && answer.every(value => value !== "") && new Set(answer).size === answer.length;
  }
  if (Array.isArray(answer)) return false;
  if (question.kind === "number") return Number.isFinite(numberValue(answer));
  return answer !== "";
}

export function grade(question: Question, answer: Answer) {
  if (!canSubmit(question, answer)) return false;
  if (Array.isArray(question.answer)) {
    return Array.isArray(answer) && question.answer.every((index, row) => String(index) === answer[row]);
  }
  if (typeof answer !== "string") return false;
  if (question.kind === "number") {
    return Math.abs(numberValue(answer) - question.answer) <= (question.tolerance ?? 0);
  }
  return String(question.answer) === answer;
}

export function dayKey(date = new Date(), offset = 0) {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate() + offset, 12);
  return [local.getFullYear(), local.getMonth() + 1, local.getDate()]
    .map((part, index) => index === 0 ? String(part) : String(part).padStart(2, "0")).join("-");
}

export function streak(days: string[], now = new Date()) {
  const known = new Set(days);
  const start = known.has(dayKey(now)) ? 0 : -1;
  let length = 0;
  while (known.has(dayKey(now, start - length))) length++;
  return length;
}

export function record(p: Progress, id: string, correct: boolean, reviewing: boolean, now = new Date(), assisted = false): Progress {
  const today = dayKey(now);
  const old = p.attempts[id];
  const pending = p.review[id];
  const review = { ...p.review };
  let xp = p.xp;
  let attempts = p.attempts;
  if (reviewing) {
    if (!pending || !old || pending.due > today) return p;
    if (correct && !assisted) {
      if (!old.firstCorrect && !old.earnedRecovery) xp += old.guided ? 2 : 5;
      attempts = { ...attempts, [id]: { ...old, recovered: true, earnedRecovery: true } };
      if (pending.step === 2) delete review[id];
      else review[id] = { step: pending.step + 1, due: dayKey(now, pending.step === 0 ? 3 : 7) };
    } else {
      attempts = { ...attempts, [id]: { ...old, recovered: false } };
      review[id] = { step: 0, due: dayKey(now, 1) };
    }
  } else if (!old && correct && !assisted) {
    attempts = { ...attempts, [id]: { firstCorrect: true, recovered: false } };
    xp += 10;
  } else {
    const guided = correct && assisted && !old?.firstCorrect && !old?.recovered && !old?.guided;
    if (guided) xp += old?.earnedRecovery ? 5 : 8;
    if (guided || !old) {
      attempts = { ...attempts, [id]: { ...(old ?? { firstCorrect: false, recovered: false }), ...(guided ? { guided: true } : {}) } };
    }
    if ((!correct || guided) && !pending) review[id] = { step: 0, due: dayKey(now, 1) };
  }
  return { ...p, xp, attempts, review, days: p.days.includes(today) ? p.days : [...p.days, today] };
}

export function finish(p: Progress, id: string, next: string) {
  const completed = p.completed.includes(id);
  return {
    ...p, current: next, position: { ...p.position, [id]: 0 },
    completed: completed ? p.completed : [...p.completed, id],
    xp: completed ? p.xp : p.xp + 20,
  };
}

export function questionKey(id: string, index: number) {
  return id + ":" + index;
}

export function mastery(p: Progress, id: string, count: number) {
  return Math.round(Array.from({ length: count }, (_, index) => p.attempts[questionKey(id, index)])
    .filter(attempt => attempt?.firstCorrect || attempt?.recovered).length * 100 / count);
}

export function guidedCount(p: Progress, id: string, count: number) {
  return Array.from({ length: count }, (_, index) => p.attempts[questionKey(id, index)])
    .filter(attempt => attempt?.guided && !attempt.recovered).length;
}

export function readProgress(raw: string | null): Progress {
  try {
    if (!raw) return blank;
    const p = JSON.parse(raw);
    if (typeof p.xp !== "number" || !Array.isArray(p.days) || !Array.isArray(p.completed)
      || !p.attempts || !p.review || !p.position || typeof p.current !== "string") return blank;
    return p;
  } catch {
    return blank;
  }
}
