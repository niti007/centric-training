# Day 7 Solution

## What changed

- `src/services/notifyService.ts` — fixed defect #6: added `escapeHtml()`
  and applied it to every user-supplied value (`task.title`,
  `task.description`, `user.name`) before interpolating into notification
  HTML bodies.
- `tests/notifyService.xss.test.ts` — regression test asserting a
  `<script>` tag in a task title is escaped, not passed through raw.
- `.claude/settings.json` — hardened from Day 5's version: explicit allow
  list widened to cover the full verify loop (`test`, `test:cov`, `lint`,
  `build`) plus scoped `Read`; deny list extended to block `.env`/secret/
  credential file reads and destructive git operations
  (`push --force`, `reset --hard`); ask list extended to cover
  `npm install`, `npm publish`, and writes to `package.json`/`.github/**`.
- `.claude/rules/security.md`, `.claude/rules/testing.md` — standing rules
  covering the two things this whole week has been about: don't
  reintroduce an injection/authorization bug, and don't ship a fix without
  a regression test that actually fails without it.

## Why

Defect #6 is the deliberate security capstone case study per the
instructor's defect map — it survives every earlier day so the Day 7
security walkthrough has something real to find and fix. The hardened
settings and rules directory are the "best practices" bookend for the
whole programme: scoped permissions, no secret exposure, and a
documented, enforced testing discipline.
