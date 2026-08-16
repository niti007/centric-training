# Day 5 — Hooks, Automation & CI/CD

Duration: 2 hours. Continues directly from Day 4 — same **TaskFlow API** repo, carried forward with Day 4's solution already merged in (`/review` and `/qa-report` custom commands, the `api-endpoint` skill).

## Objectives

By the end of today you can:

- Explain the full Claude Code hook lifecycle — `SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, `Notification`, `PreCompact`, `Stop`, `SubagentStop`, `SessionEnd` (nine events total) — not just "before/after a tool call."
- Write a hook command, wire it into `.claude/settings.json` under the right event with the right matcher, and read the JSON payload the hook receives on stdin.
- Explain the hook exit-code contract precisely: `0` = pass silently, `2` = block (the message is fed back to Claude, not just the user), any other non-zero = an error the user sees but that does **not** block anything. This distinction trips almost everyone up the first time — see `TEACH.md`.
- Run Claude Code headlessly with `claude -p`, parse `--output-format json`, and use that in a script or CI job instead of an interactive session.
- Wire Claude Code into a GitHub Actions workflow (and describe the Azure DevOps equivalent) that runs on pull requests, with secrets handled correctly and cost controlled (scoped to changed files / gated by a label).
- Apply least privilege in automation: explain concretely why CI must never get unscoped `Write` + `Bash`, and how `--allowedTools` restricts what an automated run can touch.

## What's different from Day 4

Day 5 ships **with `CLAUDE.md`, `.claude/settings.json`, `.claude/commands/`, and `.claude/skills/` already in place**, carried forward unchanged from Day 4. There is **no `.claude/hooks/` directory and no `.github/workflows/` yet** — that's today's build, the same way Day 4 started with no `commands/`/`skills/`. You are not editing something pre-provided in either case; you're creating both from scratch.

## What you'll build

Working against the same TaskFlow API, you will: wire a `PostToolUse` hook that lints every `.ts`/`.tsx` file Claude writes or edits, a `PreToolUse` hook that blocks any write containing an API-key-shaped string, a `Stop` hook that prints a completion notice, a headless `claude -p` review of a diff with its JSON output parsed by a script, and a `.github/workflows/claude-review.yml` that runs Claude Code on pull requests with tools restricted to `Read`/`Grep`/`Glob` and fails the build on a critical finding.

The graded practical is narrower than the full lab: a working lint hook plus a headless CI workflow that demonstrably fails on a bad PR and passes on a clean one. See `ASSESSMENT.md`.

## How to start

```bash
git clone <this-repo-url>
cd day5
npm ci
npm test
```

**`npm test` should show all tests passing.** By Day 4 the seeded defects were fixed and the suite went fully green; Day 5 doesn't touch `src/` or `tests/`, so it stays green here too. If you see any failures, that's a genuine problem — check your Node version and see `SETUP.md` before doing anything else.

Once your test run is green, follow `LAB.md` for the hands-on exercise, then `ASSESSMENT.md` for the graded practical.

## Capstone brief

The capstone brief is handed out at the end of today's session — budget the last ~15 minutes of class for it. It lives at `capstone/CAPSTONE.md` in the root of this training programme (not duplicated here). Skim the scenario and the three tracks before next time so team formation on the day is fast; you don't need to have picked a track yet.

## Files in this repo

| File | For |
|---|---|
| `TEACH.md` | trainer script |
| `LAB.md` | learner lab exercise |
| `ASSESSMENT.md` | graded practical task |
| `RUBRIC.md` | scoring criteria |
| `SETUP.md` | pre-session state check (short — see Day 1's `SETUP.md` for the original install walkthrough) |
| `CLAUDE.md` | project memory — already present, read it first |
| `.claude/settings.json` | permission policy — already present; you'll extend it with a `hooks` block |
| `.claude/commands/`, `.claude/skills/` | carried forward from Day 4, unchanged |
| `src/`, `tests/` | TaskFlow API, carried forward from Day 4's solution, fully green |
| `scripts/verify-setup.mjs` | machine readiness check (same as earlier days) |
| `scripts/grade.mjs` | deterministic grader for the assessment |
