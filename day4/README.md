# Day 4 — Slash Commands, Skills & Customisation

Duration: 2 hours. Continues directly from Day 3 — same **TaskFlow API** repo, carried forward with Day 3's solution already merged in (defects 1 and 3 fixed with regression tests, service-layer coverage at 80%+).

## Objectives

By the end of today you can:

- Explain the difference between a built-in slash command and a custom one, and know when to reach for each.
- Write a custom command in `.claude/commands/<name>.md`: frontmatter (`description`, `argument-hint`, `allowed-tools`), `$ARGUMENTS`, `!` bash pre-execution, and `@` file references.
- Write a `SKILL.md` that auto-activates from a natural request, without the user naming the skill or the file — and understand why the `description` field *is* the trigger.
- Organise `.claude/` (commands / skills / agents / rules / settings) so it's shareable across a project and a team, and know what belongs in version control versus a personal, local override.
- Apply progressive disclosure: keep `CLAUDE.md` lean and push detail into skill files that load on demand instead of every prompt.

## What's different from Day 3

Day 4 ships **with `CLAUDE.md` and `.claude/settings.json` already in place**, carried forward unchanged from earlier days — but there is **no `.claude/commands/` and no `.claude/skills/` yet**. That's today's build, the same way Day 1 started from a blank `CLAUDE.md`: you are not editing something pre-provided, you're creating it from scratch.

## What you'll build

Working against the same TaskFlow API, you will build `.claude/commands/review.md` (a structured diff review), `.claude/commands/qa-report.md` (a lint/build/test status report), and `.claude/skills/api-endpoint/SKILL.md` (a skill that encodes this repo's route-adding convention and fires without anyone naming it). You'll also slim `CLAUDE.md` by moving detail into the skill, and swap `.claude/` directories with a partner to confirm your command runs unmodified on someone else's machine.

The graded practical is narrower than the full lab: ship a working `/qa-report` command plus one auto-activating `SKILL.md` (the `api-endpoint` skill). See `ASSESSMENT.md`.

## How to start

```bash
git clone <this-repo-url>
cd day4
npm ci
npm test
```

**`npm test` should show all tests passing — 32 passed, 0 failed.** By Day 4 the seeded defects from Day 1 are fixed and the test suite is fully green. If you see any failures here, that's a genuine problem, not an intentional part of the exercise — check your Node version and see `SETUP.md` before doing anything else.

Once your test run is green, follow `LAB.md` for the hands-on exercise, then `ASSESSMENT.md` for the graded practical.

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
| `src/`, `tests/` | TaskFlow API, carried forward from Day 3's solution, fully green |
| `scripts/verify-setup.mjs` | machine readiness check (same as earlier days) |
| `scripts/grade.mjs` | deterministic grader for the assessment |
