# Day 4 Solution

## What changed

- `.claude/commands/review.md` — `/review` slash command: reviews the
  current diff against `CLAUDE.md` conventions, reports blocking/suggested/
  nit findings and a ready/needs-changes verdict.
- `.claude/commands/qa-report.md` — `/qa-report` slash command: runs lint,
  build, and test, and reports a real (not fabricated) green/red QA status.
- `.claude/skills/api-endpoint/SKILL.md` — a skill that codifies the
  7-step pattern for adding a new endpoint (validate → delegate to
  service → ownership check → error envelope → test → docs → verify),
  triggered whenever a learner is asked to add a route.

## Why

Day 4 is about giving Claude Code reusable, repo-specific tooling instead
of re-explaining conventions in every prompt. The two commands cover the
two most common repeated asks (review a change, get a QA status), and the
skill turns "add an endpoint" from a from-scratch task into a
fill-in-the-blank one that still enforces every repo convention.
