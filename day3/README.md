# Day 3 — QA Workflows & Testing Automation

Duration: 2 hours. Audience: professional engineers who completed Day 1 (install, permissions, CLAUDE.md) and Day 2 (conversation-driven coding, refactoring, context management).

## Objectives

By the end of today you can:

- Explain why, in an agentic-coding workflow, generation is cheap and verification is the scarce skill — and act accordingly.
- Generate a meaningful unit test suite for an existing module: enumerate edge cases and boundary values before writing assertions, not after.
- Write Supertest integration tests against an Express app, with fixtures and isolation.
- Practice TDD with Claude Code: write the failing test first, own the red, then let Claude make it green.
- Run a debugging loop — reproduce, isolate, hypothesize, verify — using failing test output as the feedback signal.
- Ask Claude Code for a structured code review (correctness / security / performance) instead of a vague "does this look okay?".
- Recognize when AI-generated output is plausible but wrong: spot a tautological assertion, a test that would pass either way, or a deleted hard case.
- Set up regression tests that lock in a fix and would fail again if the fix were reverted.

## What you'll build

Working against **TaskFlow API** at its Day 2 end-state, you will write a real unit and integration test suite for `services/` and `routes/tasks.ts`, TDD a small new feature, and find and fix two bugs that are currently hiding behind a deliberately sparse test suite — each with a regression test that proves the fix actually did something.

## Prerequisites

You should already have Claude Code installed and authenticated from Day 1, and be comfortable with plan mode, `/context`, and conversation-driven prompting from Day 2. See `SETUP.md` for the (short) pre-session check for today.

`CLAUDE.md` and `.claude/settings.json` are already present in this repo, carried forward from Day 2 — you do not need to recreate them, but you should read `CLAUDE.md` before starting, since it documents this repo's conventions and its "Do Not Touch" list.

## How to start

```bash
git clone <this-repo-url>
cd day3
npm ci
npm test
```

**`npm test` will show 3 failing tests on a fresh clone. This is intentional — the same 3 failures you saw on Day 1 and Day 2.** They encode defects that today's lab and graded practical are about. Two of them are your job today; do not "fix" them by guessing before you've read `LAB.md`.

Once cloned, follow `LAB.md` for the hands-on exercise, then `ASSESSMENT.md` for the graded practical.

## Files in this repo

| File | For |
|---|---|
| `TEACH.md` | trainer script |
| `LAB.md` | learner lab exercise |
| `ASSESSMENT.md` | graded practical task |
| `RUBRIC.md` | scoring criteria |
| `SETUP.md` | short pre-session check |
| `src/`, `tests/` | TaskFlow API at its Day 2 end-state — deliberately sparse tests |
| `scripts/verify-setup.mjs` | machine readiness check |
| `scripts/grade.mjs` | deterministic grader for the assessment |
