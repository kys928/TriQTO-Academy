import assert from "node:assert/strict";
import katex from "katex";
import { tutoring } from "../lib/tutoring.ts";
import { warmups } from "../lib/warmups.ts";
import { domains, lessons } from "../lib/content.ts";
import { blank, canSubmit, dayKey, finish, grade, guidedCount, mastery, readProgress, record, streak } from "../lib/progress.ts";

// Independent calculations for numeric exercises, and reviewed keys for categorical exercises.
const cos2 = x => Math.cos(x) ** 2;
const sin2 = x => Math.sin(x) ** 2;
const key = {
  eigenvalues: [6 + 2, 1, 2, Math.min(7, -2), (7 - Math.sqrt(7 ** 2 - 4 * 10)) / 2],
  eigenvectors: [3, 3 / Math.hypot(3, 4), 0, 1, 2],
  operators: [(Math.sqrt(3) / 2) ** 2, 2 * 0.2 - 1, 2, [1, 2, 0], cos2(Math.PI / 6)],
  hamiltonians: [Math.min(5 - 2, 5 + 2), 2, 0, cos2(2 * Math.PI / 8), 3],
  metrics: [1 - 0.99, (1 - 0.99) * (1 + 0.99), 1, 3 ** 2, (1 - 1) ** 2 + (2 * 1) ** 2],
  "state-geometry": [4 * ((1 / 2) ** 2), 1, Math.acos(Math.SQRT1_2), 2, 4 * (3 / 4) * (1 / 4) * (1 / 2) ** 2],
  fisher: [(1 / 4) ** 2 / (0.5 * 0.5), 2, 50 * 0.4, 3, 2 * (1 / 4) ** 2 / (1 / 4)],
  singular: [3 - 1, 6 / 2, 3, 1 / (0.01 + 0.09), 1],
  "natural-gradient": [-0.2 * 10 / 5, 0, 2, 1, 2 * (-0.1 * 8 / 4)],
  circuits: [sin2(Math.PI / 4), 2, [1, 2, 0], 1, 80 * sin2(Math.PI / 3)],
  algorithms: [2 ** 3 * 3 / 8, 0, 2 + Math.cos(Math.PI / 2), 2, -3 * 0.75 + (1 - 0.75)],
  hardware: [1 - 0.2, Math.sqrt(0.5 ** 2 / 100), 3, [2, 1, 0], (0.66 - 0.1) / (1 - 2 * 0.1)],
};
let count = 0;
let mathCount = 0;

function checkMath(text) {
  for (const match of text.matchAll(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g)) {
    const displayMode = match[0].startsWith("$$");
    katex.renderToString(match[0].slice(displayMode ? 2 : 1, displayMode ? -2 : -1), { throwOnError: true, displayMode });
    mathCount++;
  }
}
assert.deepEqual(lessons.map(lesson => lesson.id), Object.keys(key));
assert.equal(new Set(lessons.map(lesson => lesson.domain)).size, domains.length);
for (const lesson of lessons) {
  assert(lesson.sources.length >= 2);
  assert.equal(tutoring[lesson.id].length, lesson.questions.length);
  const warmup = warmups[lesson.id];
  assert.deepEqual(warmup.questions.map(q => q.kind), ["choice", "number"]);
  [warmup.read, warmup.example].forEach(checkMath);
  for (const q of warmup.questions) {
    [q.prompt, q.explanation, ...(q.choices ?? [])].forEach(checkMath);
    assert(grade(q, String(q.answer)));
  }
  assert.equal(lesson.questions.length, key[lesson.id].length);
  [lesson.intuition, lesson.concept, lesson.math, lesson.example].forEach(checkMath);
  lesson.questions.forEach((q, index) => {
    const guide = tutoring[lesson.id][index];
    assert.equal(guide.steps.length, 5);
    assert.equal(new Set(guide.steps).size, 5);
    for (const step of guide.steps) {
      assert(step.length > 30);
      assert(!step.includes(q.explanation));
      checkMath(step);
    }
    [guide.feedback, ...Object.values(guide.misconceptions ?? {})].forEach(checkMath);
    const answerKey = key[lesson.id][index];
    assert(q.explanation.length > 24);
    [q.prompt, q.explanation, ...(q.choices ?? []), ...(q.pairs ?? [])].forEach(checkMath);
    if (q.kind === "match") {
      assert.equal(new Set(answerKey).size, q.pairs.length);
      assert.equal(q.choices.length, q.pairs.length);
      assert(grade(q, answerKey.map(String)));
      assert(!canSubmit(q, [String(answerKey[0])]));
      assert(!grade(q, [...answerKey].reverse().map(String)));
    } else {
      if (q.kind !== "number") assert(q.choices.length > answerKey);
      assert(grade(q, String(answerKey)), lesson.id + ":" + index);
      assert(!grade(q, ""));
      assert(!grade(q, String(answerKey + 100)));
    }
    count++;
  });
}
const numeric = lessons.find(l => l.id === "metrics").questions[0];
assert(grade(numeric, "1/100"));
assert(grade(numeric, "0,01"));
assert(!grade(numeric, "1/0"));
assert(!grade(numeric, "0.01 degrees"));
assert(!grade(numeric, "0x1"));
assert(!grade(numeric, "0.01001"));

const today = new Date(2026, 10, 21, 16);
const dates = n => new Date(2026, 10, 21 + n, 16);
let p = record(blank, "metrics:0", false, false, today);
assert.equal(p.xp, 0);
assert.equal(mastery(p, "metrics", 5), 0);
assert.equal(p.review["metrics:0"].due, dayKey(today, 1));
p = record(p, "metrics:0", true, false, today);
assert.equal(mastery(p, "metrics", 5), 0);
assert.equal(streak(p.days, today), 1);
assert.equal(record(p, "metrics:0", true, true, today), p);
p = record(p, "metrics:0", true, true, dates(1));
assert.equal(streak(p.days, dates(1)), 2);
assert.equal(p.xp, 5);
assert.equal(mastery(p, "metrics", 5), 20);
assert.equal(p.review["metrics:0"].due, dayKey(today, 4));
p = record(p, "metrics:0", false, true, dates(4));
assert.equal(mastery(p, "metrics", 5), 0);
p = record(p, "metrics:0", true, true, dates(5));
p = record(p, "metrics:0", true, true, dates(8));
p = record(p, "metrics:0", true, true, dates(15));
assert.equal(p.review["metrics:0"], undefined);
assert.equal(p.xp, 5);
p = record(p, "metrics:1", true, false, dates(15));
p = finish(p, "metrics", "state-geometry");
assert.equal(p.xp, 35);
assert.equal(finish(p, "metrics", "state-geometry").xp, 35);
assert.equal(p.current, "state-geometry");
assert.deepEqual(readProgress(JSON.stringify(p)), p);
assert.deepEqual(readProgress("corrupt"), blank);
const guided = record(blank, "metrics:0", true, false, today, true);
assert.equal(guided.xp, 8);
assert.equal(mastery(guided, "metrics", 5), 0);
assert.equal(guidedCount(guided, "metrics", 5), 1);
assert.equal(record(guided, "metrics:0", true, false, today, true).xp, 8);
const aidedReview = record(guided, "metrics:0", true, true, dates(1), true);
assert.equal(aidedReview.xp, 8);
assert.equal(mastery(aidedReview, "metrics", 5), 0);
const independent = record(aidedReview, "metrics:0", true, true, dates(2));
assert.equal(independent.xp, 10);
assert.equal(mastery(independent, "metrics", 5), 20);
assert.equal(guidedCount(independent, "metrics", 5), 0);
const retried = record(record(blank, "eigenvalues:0", false, false, today), "eigenvalues:0", true, false, today, true);
assert.equal(retried.xp, 8);
assert.equal(mastery(retried, "eigenvalues", 5), 0);
assert.equal(readProgress(null).current, "eigenvalues");
assert.equal(readProgress(JSON.stringify({ ...blank, current: "metrics" })).current, "metrics");

console.log(lessons.length + " lessons, " + count + " answer keys, " + mathCount + " KaTeX expressions, and progress/review rules passed.");
