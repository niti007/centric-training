# Day 1 — Introduction & Foundation

Duration: 2 hours. Audience: professional engineers, no prior Claude Code experience assumed.

## Objectives

By the end of today you can:

- Explain what Claude Code is (an agentic CLI, not an autocomplete plugin) and where it sits relative to Claude.ai, the Claude API, and the Agent SDK.
- Install, authenticate, and configure Claude Code on your own machine.
- Use interactive, headless, and plan modes appropriately.
- Configure the permission system so Claude Code cannot run destructive commands unsupervised.
- Write a `CLAUDE.md` that steers Claude to follow a codebase's real conventions, without repeating yourself in every prompt.

## What you'll build

Working against **TaskFlow API** — a small Node 20 + TypeScript + Express service — you will make Claude Code add a new read-only endpoint under plan mode, then author project configuration (`CLAUDE.md` and `.claude/settings.json`) that a grader checks automatically.

## Prerequisites

See `SETUP.md`. Complete it 48 hours before the session — installation and corporate auth issues are the most common time sink on Day 1, and there is no time in the 2-hour session to debug them from scratch.

## How to start

```bash
git clone <this-repo-url>
cd day1
npm ci
npm test
```

**`npm test` will show 3 failing tests on a fresh clone. This is intentional — do not fix them today.** They encode defects that are the subject of Day 3. Your job today is to notice and record which tests fail, not to make them pass.

Once cloned, follow `LAB.md` for the hands-on exercise, then `ASSESSMENT.md` for the graded practical.

## Files in this repo

| File | For |
|---|---|
| `TEACH.md` | trainer script |
| `LAB.md` | learner lab exercise |
| `ASSESSMENT.md` | graded practical task |
| `RUBRIC.md` | scoring criteria |
| `SETUP.md` | pre-work, send 48 hours ahead |
| `src/`, `tests/` | TaskFlow API baseline |
| `scripts/verify-setup.mjs` | machine readiness check |
| `scripts/grade.mjs` | deterministic grader for the assessment |
