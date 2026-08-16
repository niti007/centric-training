# Day 2 — Core Developer Workflows & Code Generation

Duration: 2 hours. Continues directly from Day 1 — same **TaskFlow API** repo, carried forward with Day 1's solution already merged in (`GET /tasks/:id/summary`, `CLAUDE.md`, `.claude/settings.json`).

## Objectives

By the end of today you can:

- Write prompts that get useful first-pass results by giving goal, constraints, file pointers, and a way to verify — not vague asks.
- Use Read/Write/Edit/MultiEdit deliberately, and understand how Claude locates the right files with Grep/Glob before touching them.
- Run builds, tests, and package-manager commands through Bash, including long-running background tasks, and feed failures back into the loop instead of debugging them yourself.
- Generate a new feature from a written spec, and generate documentation (JSDoc, README tables) from existing code.
- Refactor legacy code behavior-preservingly, using characterization tests as the safety net instead of "it looks the same to me."
- Manage context deliberately: read `/context`, know what `/compact` keeps and drops, and know when `/clear` or `--resume` is the right call.
- Pick a model tier (Opus / Sonnet / Haiku) by task cost-vs-capability, not by habit.

## What's different from Day 1

Day 2 ships **with `CLAUDE.md` and `.claude/settings.json` already in place** — you wrote them yourself yesterday (or they were provided if you're picking up here fresh). You are not starting from a blank `.claude/` directory. Read both files before you start; today's work depends on the conventions they document, and the grader assumes they're followed, not re-explained in every prompt.

## What you'll build

Working against the same TaskFlow API, you will: generate a new `POST /tasks/bulk` endpoint from a written spec, generate JSDoc and a README API table for the existing routes, refactor `util/money.ts` for readability without changing its behavior, deliberately run a session's context up and observe what `/compact` keeps, and compare the same task run on two model tiers.

The graded practical is separate from the lab: it's a real refactor of `src/legacy/reportBuilder.ts` — the ~275-line function you'll get a guided look at in the live demo — into at least three smaller, independently tested units, with existing behavior fully preserved.

## How to start

```bash
git clone <this-repo-url>
cd day2
npm ci
npm test
```

**`npm test` will show 3 failing tests on a fresh clone — the same 3 as Day 1.** Day 1's solution added a route; it did not fix any defects. That work is still ahead, on later days. If your failing-test count doesn't match, see `SETUP.md` before doing anything else.

Once your test run matches the expected state, follow `LAB.md` for the hands-on exercise, then `ASSESSMENT.md` for the graded practical.

## Files in this repo

| File | For |
|---|---|
| `TEACH.md` | trainer script |
| `LAB.md` | learner lab exercise |
| `ASSESSMENT.md` | graded practical task |
| `RUBRIC.md` | scoring criteria |
| `SETUP.md` | pre-session state check (short — see Day 1's `SETUP.md` for the original install walkthrough) |
| `CLAUDE.md` | project memory — already present, read it first |
| `.claude/settings.json` | permission policy — already present |
| `src/`, `tests/` | TaskFlow API, carried forward from Day 1's solution |
| `scripts/verify-setup.mjs` | machine readiness check (same as Day 1) |
| `scripts/grade.mjs` | deterministic grader for the assessment |
