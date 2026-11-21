# TriQTO Academy

An interactive learning path across quantum fundamentals, quantum computing, and differential geometry. New learners start with Eigenvalues. Returning learners resume their saved lesson. The full path includes 12 lessons, 60 original exercises, and 24 unscored warm-ups.

## Run locally

Requires Node.js 22.13 or later.

    npm ci
    npm run dev

Open http://localhost:3000. Use npm run lint, npm test, and npm run build to verify the app. The build writes a static site to out/. Vercel can build the repository with the Next.js preset.

## Learning and progress

Each lesson contains intuition, concepts, mathematics, a worked example, exercises with feedback, and a transfer challenge. Lesson records are in lib/content.ts and contain their source attributions. The curriculum uses original examples and distinguishes the TriQTO research proposal from experimental results.

A first unaided correct answer earns 10 XP. A guided first completion earns 8 XP, with another 2 XP available on an independent spaced review. A learner can request progressive hints, retry, or reveal the worked solution after submitting. Completing a lesson earns 20 XP once. A missed or assisted question returns after one calendar day, then three and seven days after successful reviews. A wrong review restarts its schedule. The first successful spaced recovery of an initially missed exercise earns up to 5 XP. Mastery measures the fraction of exercises with an unaided first success or a successful spaced recovery. Progress, XP, streak, theme, and lesson position use browser-local storage.

The exercises grade numerical entries, selection, and matching. Labs model idealized metric lengths and measurement probabilities. The Qiskit example is provided as Python code for local execution. The app requires no accounts or backend.
