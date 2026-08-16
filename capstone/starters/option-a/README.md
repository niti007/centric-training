# Capstone Starter — Track A (Feature Development + Test Automation)

This starter saves you the blank-page setup time so three hours is enough
to build the thing, not scaffold it. Read `capstone/CAPSTONE.md` in full
before you touch any of this — the section you want is **Track A —
Feature Development + Test Automation**. This README does not restate the
brief; it only tells you what's in this folder and what still isn't.

## How to use this starter

Drop these files into your own clone of the repo at the state your team is
starting from (post Day 7, Block 1). Paths below are relative to that
repo's root, matching where each file belongs once copied in — e.g.
`src/util/recurrence.ts` here goes to `src/util/recurrence.ts` in your
clone, next to the existing `src/util/dates.ts`.

## What this starter gives you

- `src/util/recurrence.ts` — function signatures and JSDoc for the
  recurrence date-math, with the `Task` type extension called out. Bodies
  throw `TODO` — you write the logic.
- `tests/recurrence.test.ts` — a `describe`/`it` skeleton naming every
  required case from CAPSTONE.md (daily/weekly/monthly advance, month-end
  rollover, field inheritance, completion-state reset). Every case is
  `it.todo(...)` — none are implemented.
- `.github/workflows/capstone-ci.yml` — lint/build/test wired and
  runnable as-is; the headless Claude Code review step is a TODO stub you
  have to fill in (deliverable 4 in CAPSTONE.md).
- `plugins/README.md` — a pointer for the plugin-packaging deliverable
  (deliverable 6), referencing the structural example already in this repo
  at `day6/plugins/taskflow-kit/`.

## What you still have to build

Everything CAPSTONE.md lists under Track A's mandatory deliverables,
specifically:

1. The actual recurrence implementation — the `Task` type extension, the
   service-layer wiring into the completion endpoint, and the date-math
   inside `src/util/recurrence.ts`. Note: the completion endpoint that
   exists in this codebase today is `POST /tasks/:id/complete`
   (`src/routes/tasks.ts`) — confirm against CAPSTONE.md's requirements
   table before you decide whether that route's method/shape needs to
   change.
2. Every test in `tests/recurrence.test.ts`, plus integration tests for
   the completion endpoint covering both recurring and non-recurring
   paths (CAPSTONE.md deliverable 3) — those aren't scaffolded here at
   all, add them alongside the existing `tests/tasks.*.test.ts` files.
3. The headless Claude Code review step in the CI workflow, wired to fail
   the build on a critical finding.
4. A sub-agent review team (security + performance + style) run against
   your own diff, with consolidated output committed as `REVIEW.md`. This
   repo already has three reviewer agents you can start from —
   `day7/.claude/agents/{security,perf,style}-reviewer.md` — but
   running them against *your* diff and consolidating the output is your
   work, not scaffolded here.
5. Packaging the whole workflow (recurrence feature + tests + CI + review
   agents) as an installable plugin — see `plugins/README.md`.

## Definition of done

See CAPSTONE.md's Track A section — `npm test` green, CI visible passing
on a clean branch and failing on a seeded-bad branch, `REVIEW.md` present
with real findings, plugin installs.
