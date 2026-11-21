"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  ArrowDown, ArrowLeft, ArrowRight, Atom, AudioLines, BookOpen, Check, ChevronRight, CircleHelp,
  Clock3, Compass, Cpu, Flame, Layers3, Moon, RotateCcw, Sigma, Sun, Target, Zap,
} from "lucide-react";
import { domains, lessons, type Domain, type Lesson, type Question } from "../lib/content";
import {
  canSubmit, dayKey, finish, grade, guidedCount, mastery, questionKey, readProgress, record, storageKey, streak,
  type Answer, type Progress,
} from "../lib/progress";
import { tutoring, tutorLabels, type Tutor } from "../lib/tutoring";
import { warmups } from "../lib/warmups";
import { Lab, MathText, OrbitArt } from "./graphics";

type View = "path" | "review" | Domain | "lesson";
const icons = { foundations: Sigma, computing: Cpu, geometry: Layers3 };
const themeKey = "triqto-academy-theme";
let progressFallback: string | null = null;
let themeFallback: string | null = null;
function readLocal(key: string, fallback: string | null) {
  try { return localStorage.getItem(key); } catch { return fallback; }
}
function saveLocal(key: string, value: string) {
  if (key === storageKey) progressFallback = value;
  if (key === themeKey) themeFallback = value;
  try { localStorage.setItem(key, value); } catch { /* Retain the session state in memory. */ }
  window.dispatchEvent(new Event("academy-update"));
}
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("academy-update", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("academy-update", callback);
  };
}

function Brand({ onClick }: { onClick: () => void }) {
  return <button className="brand" onClick={onClick} aria-label="TriQTO Academy home">
    <span className="brand-icon"><Atom size={24} strokeWidth={1.55} /></span>
    <span><strong>TriQTO</strong><small>ACADEMY</small></span>
  </button>;
}
function Track({ value, label }: { value: number; label: string }) {
  return <div className="progress-track" role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}><div style={{ width: value + "%" }} /></div>;
}
function LessonRow({ lesson, p, open }: { lesson: Lesson; p: Progress; open: (l: Lesson) => void }) {
  const Icon = icons[lesson.domain];
  const done = p.completed.includes(lesson.id);
  const isCurrent = p.current === lesson.id && !done;
  return <button className={"lesson-row " + (isCurrent ? "row-current" : "")} onClick={() => open(lesson)}>
    <span className={"row-icon " + lesson.domain}>{done ? <Check size={19} /> : <Icon size={19} />}</span>
    <span className="row-copy"><strong>{lesson.title}</strong><small>{lesson.summary}</small></span>
    <span className="row-info">
      {done ? <span className="row-score">{mastery(p, lesson.id, lesson.questions.length)}% mastery</span> : <span><Clock3 size={14} /> {lesson.minutes} min</span>}
      <ChevronRight size={17} className="row-chevron" />
    </span>
  </button>;
}

export default function Academy() {
  const stored = useSyncExternalStore(subscribe, () => readLocal(storageKey, progressFallback), () => null);
  const theme = useSyncExternalStore(subscribe, () => readLocal(themeKey, themeFallback) ?? "dark", () => "dark");
  const p = readProgress(stored);
  const [view, setView] = useState<View>("path");
  const [active, setActive] = useState("metrics");
  const [showAll, setShowAll] = useState(false);
  const lesson = lessons.find(item => item.id === active) ?? lessons[4];
  const current = lessons.find(item => item.id === p.current) ?? lessons[4];
  const due = Object.entries(p.review).filter(([, review]) => review.due <= dayKey()).length;
  const selectedDomain = domains.find(domain => domain.id === view);
  const overall = Math.round(100 * p.completed.length / lessons.length);
  useEffect(() => { document.documentElement.classList.toggle("dark", theme !== "light"); }, [theme]);

  function update(next: (latest: Progress) => Progress) {
    saveLocal(storageKey, JSON.stringify(next(readProgress(readLocal(storageKey, progressFallback)))));
  }
  function markHelp(id: string) {
    update(latest => ({ ...latest, helpUsed: { ...latest.helpUsed, [id]: true } }));
  }
  function navigate(next: View) {
    setView(next);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function open(next: Lesson) {
    update(latest => ({ ...latest, current: next.id }));
    setActive(next.id);
    navigate("lesson");
  }
  const themeButton = <button className="theme-button" aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    onClick={() => saveLocal(themeKey, theme === "dark" ? "light" : "dark")}>{theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}</button>;

  return (
    <div className="shell">
      <aside className="sidebar" aria-label="Main navigation">
        <Brand onClick={() => navigate("path")} />
        <nav>
          <div className="nav-label">WORKSPACE</div>
          <button className={"nav-item " + (view === "path" || view === "lesson" ? "selected" : "")} onClick={() => navigate("path")}><Compass size={18} /><span>Learning path</span></button>
          <button className={"nav-item " + (view === "review" ? "selected" : "")} onClick={() => navigate("review")}><RotateCcw size={17} /><span>Review</span>{due > 0 && <b>{due}</b>}</button>
          <div className="nav-label domain-label">DOMAINS</div>
          {domains.map(domain => { const Icon = icons[domain.id]; return <button key={domain.id} className={"nav-item " + (view === domain.id ? "selected" : "")} onClick={() => navigate(domain.id)}><Icon size={17} /><span>{domain.name}</span></button>; })}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-progress"><span>Overall progress</span><strong>{overall}%</strong></div>
          <Track value={overall} label="Overall progress" />
          <small>{p.completed.length} of {lessons.length} lessons complete</small>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="mobile-brand"><Brand onClick={() => navigate("path")} /></div>
          <div className="breadcrumb"><BookOpen size={16} /><span>Academy</span><ChevronRight size={14} /><strong>{view === "review" ? "Review" : selectedDomain?.short ?? "Learning path"}</strong></div>
          <div className="account-stats">
            <span className="header-stat streak" title="Learning streak"><Flame size={18} /><b>{streak(p.days)}</b><span>day streak</span></span>
            <span className="header-stat xp" title="Experience points"><Zap size={17} /><b>{p.xp}</b><span>XP</span></span>
            {themeButton}
          </div>
        </header>
        <nav className="mobile-nav" aria-label="Learning navigation">
          <button aria-pressed={view === "path" || view === "lesson"} onClick={() => navigate("path")}><Compass size={17} /> Path</button>
          <button aria-pressed={view === "review"} onClick={() => navigate("review")}><RotateCcw size={17} /> Review {due > 0 && due}</button>
          {domains.map(domain => <button key={domain.id} aria-pressed={view === domain.id} onClick={() => navigate(domain.id)}>{domain.short}</button>)}
        </nav>
        <main id="main-content" className={"main-content " + (view === "lesson" || view === "review" ? "reading-width" : "")}>
          {view === "path" && <>
            <section className="hero">
              <OrbitArt />
              <div className="hero-content">
                <div className="eyebrow hero-kicker"><span /> YOUR QUANTUM LEARNING PATH</div>
                <h1>Think in <em>quantum.</em></h1>
                <p>Build the math, explore quantum circuits, and see how geometry connects them in TriQTO.</p>
                <button className="primary" onClick={() => open(current)}>Continue learning <ArrowRight size={17} /></button>
              </div>
            </section>
            <section className="dashboard-section">
              <div className="section-head"><h2>Learning domains</h2><span>3 interconnected domains</span></div>
              <div className="domain-grid">
                {domains.map(domain => {
                  const Icon = icons[domain.id];
                  const related = lessons.filter(item => item.domain === domain.id);
                  const complete = related.filter(item => p.completed.includes(item.id)).length;
                  return <button key={domain.id} onClick={() => navigate(domain.id)} className={"domain-card " + domain.id}>
                    <div className="domain-top"><span className="domain-icon"><Icon size={22} strokeWidth={1.65} /></span><ChevronRight size={17} /></div>
                    <h3>{domain.name}</h3>
                    <p>{domain.description}</p>
                    <div className="domain-progress"><Track value={Math.round(100 * complete / related.length)} label={domain.name + " progress"} /><span>{complete}/{related.length} lessons</span></div>
                  </button>;
                })}
              </div>
            </section>
            <section className="dashboard-section">
              <div className="section-head"><h2>{showAll ? "Full learning path" : "Your next lessons"}</h2>
                <button className="text-button" onClick={() => setShowAll(!showAll)}>{showAll ? "Show next lessons" : "View all lessons"} <ArrowDown size={15} /></button></div>
              <div className="lesson-list">
                {(showAll ? lessons : [...lessons.slice(lessons.indexOf(current)), ...lessons.slice(0, lessons.indexOf(current))].filter(item => !p.completed.includes(item.id)).slice(0, 3)).map(item => <LessonRow key={item.id} lesson={item} p={p} open={open} />)}
                {!showAll && p.completed.length === lessons.length && <p className="finished-path">You’ve completed the path. Revisit any lesson or check your review schedule.</p>}
              </div>
            </section>
            <footer className="path-footer"><Atom size={15} /> TriQTO Academy <span>Learn at your own pace</span></footer>
          </>}
          {selectedDomain && <section className={"domain-page " + selectedDomain.id}>
            <button className="text-button back" onClick={() => navigate("path")}><ArrowLeft size={16} /> Learning path</button>
            <div className="domain-banner">
              <div className="eyebrow">Domain {selectedDomain.roman}</div>
              <h1>{selectedDomain.full}</h1>
              <p>{selectedDomain.description}</p>
            </div>
            <div className="section-head"><h2>Lessons</h2><span>{lessons.filter(item => item.domain === view && p.completed.includes(item.id)).length} complete</span></div>
            <div className="lesson-list">{lessons.filter(item => item.domain === view).map(item => <LessonRow key={item.id} lesson={item} p={p} open={open} />)}</div>
          </section>}
          {view === "lesson" && <LessonView key={lesson.id} lesson={lesson} initial={p.position[lesson.id] ?? 0} p={p}
            exit={() => navigate("path")} open={open}
            onHelp={markHelp}
            onAttempt={(index, correct, assisted) => update(latest => record(latest, questionKey(lesson.id, index), correct, false, new Date(), assisted))}
            onAdvance={index => update(latest => ({ ...latest, position: { ...latest.position, [lesson.id]: index } }))}
            onFinish={() => update(latest => {
              const next = lessons[lessons.indexOf(lesson) + 1] ?? lessons.find(item => !latest.completed.includes(item.id) && item.id !== lesson.id) ?? lesson;
              return finish(latest, lesson.id, next.id);
            })} />}
          {view === "review" && <ReviewView key="review" p={p} open={open}
            onHelp={markHelp}
            onAttempt={(id, correct, assisted) => update(latest => record(latest, id, correct, true, new Date(), assisted))} />}
        </main>
      </div>
    </div>
  );
}

type LessonViewProps = {
  lesson: Lesson; initial: number; p: Progress; exit: () => void; open: (lesson: Lesson) => void;
  onHelp: (id: string) => void;
  onAttempt: (index: number, correct: boolean, assisted: boolean) => void; onAdvance: (index: number) => void; onFinish: () => void;
};
function LessonView({ lesson, initial, p, exit, open, onHelp, onAttempt, onAdvance, onFinish }: LessonViewProps) {
  const [stage, setStage] = useState<"learn" | "warmup" | "practice" | "done">(initial > 0 && initial < lesson.questions.length ? "practice" : "learn");
  const [index, setIndex] = useState(initial > 0 && initial < lesson.questions.length ? initial : 0);
  const [warmupIndex, setWarmupIndex] = useState(0);
  const [warmupComplete, setWarmupComplete] = useState(false);
  const warmup = warmups[lesson.id];
  const key = questionKey(lesson.id, index);
  const heading = useRef<HTMLHeadingElement>(null);
  const domain = domains.find(item => item.id === lesson.domain)!;
  const next = lessons[lessons.indexOf(lesson) + 1];
  function focusHeading() {
    window.scrollTo({ top: 0, behavior: "instant" });
    requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
  }
  function begin(nextStage: "learn" | "warmup" | "practice") {
    setStage(nextStage);
    focusHeading();
  }
  function advance() {
    if (index + 1 === lesson.questions.length) {
      onFinish();
      setStage("done");
    } else {
      setIndex(index + 1);
      onAdvance(index + 1);
    }
    focusHeading();
  }
  return <div className={"reader " + lesson.domain}>
    <button className="text-button back" onClick={exit}><ArrowLeft size={16} /> Learning path</button>
    {stage === "learn" && <>
      <div className="reader-header"><div className="eyebrow">{domain.name}</div><h1 tabIndex={-1} ref={heading}>{lesson.title}</h1><p>{lesson.summary}</p><span className="reader-time"><Clock3 size={15} /> {lesson.minutes} min · {lesson.questions.length} exercises</span></div>
      <div className="lesson-body">
        <section className="worked">
          <h2>Before you start</h2>
          <p><MathText text={warmup.read} /></p>
          <h3>Worked example</h3>
          <p><MathText text={warmup.example} /></p>
          <button className="primary" onClick={() => begin("warmup")}>Try the warm-up <ArrowRight size={17} /></button>
        </section>
        {([["Intuition", lesson.intuition], ["The concept", lesson.concept], ["The mathematics", lesson.math], ["Worked example", lesson.example]]).map(([title, body]) =>
          <section key={title} className={title === "Worked example" ? "worked" : ""}><h2>{title}</h2><p><MathText text={body} /></p></section>)}
        {lesson.code && <pre className="code-example"><code>{lesson.code}</code></pre>}
        {lesson.lab && <Lab variant={lesson.lab} />}
        <details className="sources"><summary>Lesson sources</summary><ul>{lesson.sources.map(source => <li key={source}>{source}</li>)}</ul></details>
        <div className="exercise-actions">
          {!warmupComplete && <button className="primary" onClick={() => begin("warmup")}>Try the warm-up <ArrowRight size={17} /></button>}
          <button className={warmupComplete ? "primary" : "text-button"} onClick={() => begin("practice")}>Start practice <ArrowRight size={17} /></button>
        </div>
      </div>
    </>}
    {stage === "warmup" && <>
      <div className="practice-top"><span>{lesson.title}</span><span>{warmupIndex + 1} of {warmup.questions.length}</span></div>
      <div className="exercise-wrap">
        <h1 tabIndex={-1} ref={heading}>Warm-up</h1>
        <details className="warmup-notes" open>
          <summary>Prerequisite and worked example</summary>
          <p><MathText text={warmup.read} /></p>
          <p><MathText text={warmup.example} /></p>
        </details>
        <Exercise key={warmupIndex} q={warmup.questions[warmupIndex]} warmupNote={warmup.read}
          onNext={() => {
            if (warmupIndex + 1 === warmup.questions.length) {
              setWarmupComplete(true);
              begin("learn");
            } else {
              setWarmupIndex(warmupIndex + 1);
              focusHeading();
            }
          }} nextLabel={warmupIndex + 1 === warmup.questions.length ? "Return to lesson" : "Next warm-up"} />
        <button className="text-button warmup-skip" onClick={() => begin("learn")}>Return to lesson <ArrowLeft size={16} /></button>
      </div>
    </>}
    {stage === "practice" && <>
      <div className="practice-top"><span>{lesson.title}</span><span>{index + 1} of {lesson.questions.length}</span></div>
      <Track value={Math.round(100 * index / lesson.questions.length)} label="Practice progress" />
      <div className="exercise-wrap">
        <h1 tabIndex={-1} ref={heading}>{index === lesson.questions.length - 1 ? "Mastery challenge" : "Practice"}</h1>
        <Exercise key={key} q={lesson.questions[index]} tutor={tutoring[lesson.id][index]}
          helpedBefore={p.helpUsed?.[key] || Boolean(p.attempts[key] && !p.attempts[key].firstCorrect && !p.attempts[key].recovered)} onHelp={() => onHelp(key)}
          onAttempt={(correct, assisted) => onAttempt(index, correct, assisted)} onNext={advance}
          nextLabel={index + 1 === lesson.questions.length ? "Finish lesson" : "Continue"} />
      </div>
    </>}
    {stage === "done" && <section className="completion">
      <span className="completion-icon"><Check size={34} /></span>
      <h1 tabIndex={-1} ref={heading}>Lesson complete</h1><p>{lesson.title}</p>
      <div className="completion-stats"><div><Target size={20} /><strong>{mastery(p, lesson.id, lesson.questions.length)}%</strong><small>Mastery</small></div><div><Zap size={20} /><strong>{p.xp}</strong><small>Total XP</small></div></div>
      <p>{guidedCount(p, lesson.id, lesson.questions.length)} guided completions awaiting independent practice.</p>
      <p>Mastery reflects unaided first attempts and successful unaided spaced reviews. Guided and missed questions return in Review.</p>
      <div className="completion-actions">{next && <button className="primary" onClick={() => open(next)}>Next lesson <ArrowRight size={17} /></button>}<button className="secondary" onClick={exit}>Learning path</button></div>
    </section>}
  </div>;
}

type ExerciseProps = {
  q: Question;
  tutor?: Tutor;
  warmupNote?: string;
  helpedBefore?: boolean;
  onHelp?: () => void;
  onAttempt?: (correct: boolean, assisted: boolean) => void;
  onNext: () => void;
  nextLabel: string;
};

function Exercise({ q, tutor, warmupNote, helpedBefore, onHelp, onAttempt, onNext, nextLabel }: ExerciseProps) {
  const [answer, setAnswer] = useState<Answer>(() => q.pairs?.map(() => "") ?? "");
  const [result, setResult] = useState<"correct" | "guided" | "incorrect" | "revealed" | null>(null);
  const [submitted, setSubmitted] = useState<Answer | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [hintCount, setHintCount] = useState(0);
  const disabled = !canSubmit(q, answer);
  const assessed = result === "correct" || result === "guided" || result === "revealed";
  const sameAnswer = submitted !== null && JSON.stringify(submitted) === JSON.stringify(answer);
  const misconception = typeof submitted === "string" ? tutor?.misconceptions?.[submitted.trim()] : undefined;
  const solutionAnswer = Array.isArray(q.answer)
    ? q.answer.map((value, index) => (q.pairs?.[index] ?? "") + " → " + (q.choices?.[value] ?? "")).join(" · ")
    : q.kind === "number" ? null : q.choices?.[q.answer];
  const labels = { number: "Numerical answer", choice: "Choose an answer", step: "Complete the derivation", mistake: "Identify the mistake", match: "Match the pairs" };

  function submit() {
    if (disabled || sameAnswer) return;
    const correct = grade(q, answer);
    const assisted = Boolean(tutor && (hintCount || helpedBefore || submitted !== null));
    setResult(correct ? assisted ? "guided" : "correct" : "incorrect");
    setSubmitted(answer);
    if (correct || submitted === null) onAttempt?.(correct, assisted);
  }

  function advanceHelp() {
    if (hintCount === 0) onHelp?.();
    setHintCount(hintCount + 1);
  }

  return <form className="exercise" onSubmit={event => { event.preventDefault(); if (assessed) onNext(); else submit(); }}>
    <div className="eyebrow">{labels[q.kind]}</div>
    <h2><MathText text={q.prompt} /></h2>
    {q.kind === "number" && <label className="number-input"><span>Your answer</span>
      <input type="text" inputMode="text" placeholder="Decimal or fraction" value={String(answer)} disabled={assessed} onChange={event => setAnswer(event.target.value)} />
    </label>}
    {q.kind === "match" && Array.isArray(answer) && <div className="matching">{q.pairs?.map((pair, row) =>
      <label key={pair}><span><MathText text={pair} /></span><select aria-label={"Match item " + (row + 1)} value={answer[row]} disabled={assessed} onChange={event => setAnswer(answer.map((value, index) => index === row ? event.target.value : value))}>
        <option value="">Choose a match</option>{q.choices?.map((option, index) => <option key={option} value={index}>{option}</option>)}</select></label>)}
      {answer.filter(Boolean).length === answer.length && new Set(answer).size !== answer.length && <small>Use each match once.</small>}
    </div>}
    {q.kind !== "number" && q.kind !== "match" && <fieldset className="choices" aria-label="Answer options">{q.choices?.map((option, index) =>
      <label key={option} className={"choice " + (answer === String(index) ? "chosen" : "") + (showSolution && index === q.answer ? " solution" : "")}>
        <input type="radio" name="answer" value={index} checked={answer === String(index)} disabled={assessed} onChange={() => setAnswer(String(index))} />
        <span className="choice-letter">{String.fromCharCode(65 + index)}</span><span><MathText text={option} /></span>
        {showSolution && index === q.answer && <Check size={17} className="choice-check" />}
      </label>)}</fieldset>}
    {result === "incorrect" && <div className="feedback incorrect" role="status">
      <strong>Try again</strong>
      <p><MathText text={misconception ?? tutor?.feedback ?? warmupNote ?? ""} /></p>
    </div>}
    {(result === "correct" || result === "guided") && <div className="feedback" role="status">
      <strong>{result === "guided" ? "Correct · guided completion" : "Correct"}</strong>
    </div>}
    {tutor && hintCount > 0 && <section className="tutor-panel" aria-label="Step-by-step help" aria-live="polite">
      <ol>{tutor.steps.slice(0, hintCount).map((step, index) => <li key={tutorLabels[index]}>
        <h3>{tutorLabels[index]}</h3><p><MathText text={step} /></p>
      </li>)}</ol>
      {hintCount < tutor.steps.length && !assessed && <button type="button" className="text-button" onClick={advanceHelp}>Next hint <ArrowRight size={16} /></button>}
    </section>}
    {showSolution && <section className="feedback" aria-label="Worked solution">
      <strong>Worked solution</strong>
      {solutionAnswer && <p><MathText text={solutionAnswer} /></p>}
      <p><MathText text={q.explanation} /></p>
    </section>}
    <div className="exercise-actions">
      {assessed ? <button type="submit" className="primary">{nextLabel} <ArrowRight size={17} /></button>
        : <button type="submit" className="primary" disabled={disabled || sameAnswer}>{result === "incorrect" ? "Check revised answer" : "Check answer"} <Check size={17} /></button>}
      {tutor && hintCount === 0 && !assessed && <button type="button" className="text-button" onClick={advanceHelp}><CircleHelp size={16} /> Help</button>}
      {submitted !== null && !showSolution && <button type="button" className="text-button" onClick={() => {
        setShowSolution(true);
        if (result === "incorrect") setResult("revealed");
      }}>Reveal solution</button>}
    </div>
  </form>;
}

function ReviewView({ p, onAttempt, onHelp, open }: { p: Progress; onAttempt: (id: string, correct: boolean, assisted: boolean) => void; onHelp: (id: string) => void; open: (lesson: Lesson) => void }) {
  const [active, setActive] = useState<string | null>(null);
  const entries = lessons.flatMap(lesson => lesson.questions.map((question, index) => ({ id: questionKey(lesson.id, index), lesson, question, index })))
    .filter(item => p.review[item.id] || item.id === active);
  const today = dayKey();
  const ready = entries.filter(item => p.review[item.id]?.due <= today);
  const scheduled = entries.filter(item => p.review[item.id]?.due > today).sort((a, b) => p.review[a.id].due.localeCompare(p.review[b.id].due));
  const current = entries.find(item => item.id === active);
  const helpKey = "review:" + active + ":" + today;
  return <section className="review-page">
    <div className="reader-header"><div className="eyebrow">Spaced repetition</div><h1>Review</h1>
      <p>Return to missed questions after a day. Successful reviews are spaced out over the following days.</p></div>
    {current ? <div className="exercise-wrap">
      <button className="text-button back" onClick={() => setActive(null)}><ArrowLeft size={16} /> Review queue</button>
      <div className="practice-top"><span>{current.lesson.title}</span></div>
      <Exercise key={current.id} q={current.question} tutor={tutoring[current.lesson.id][current.index]}
        helpedBefore={p.helpUsed?.[helpKey]} onHelp={() => onHelp(helpKey)}
        onAttempt={(correct, assisted) => onAttempt(current.id, correct, assisted)} onNext={() => setActive(null)} nextLabel="Back to review" />
    </div> : <>
      <div className="section-head"><h2>Due today</h2><span>{ready.length} exercises</span></div>
      {ready.length ? <div className="lesson-list">{ready.map(item => <button key={item.id} className="lesson-row" onClick={() => setActive(item.id)}><span className="row-icon geometry"><RotateCcw size={19} /></span><span className="row-copy"><strong>{item.lesson.title}</strong><small><MathText text={item.question.prompt} /></small></span><ChevronRight size={18} /></button>)}</div>
        : <div className="review-empty"><AudioLines size={26} /><h3>You’re caught up</h3><p>Missed exercises appear here when they’re due.</p></div>}
      {scheduled.length > 0 && <><div className="section-head review-scheduled"><h2>Scheduled</h2><span>{scheduled.length} exercises</span></div>
        <div className="lesson-list">{scheduled.map(item => <button key={item.id} className="lesson-row" onClick={() => open(item.lesson)}><span className="row-icon"><Clock3 size={18} /></span><span className="row-copy"><strong>{item.lesson.title}</strong><small>Revisit lesson</small></span><span className="row-info"><time dateTime={p.review[item.id].due}>{p.review[item.id].due}</time></span></button>)}</div></>}
    </>}
  </section>;
}
