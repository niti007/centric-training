# Day 1 Solution

## What changed

- `src/routes/tasks.ts` — added `GET /tasks/:id/summary`, returning
  `{ id, title, dueIn }`. Reuses `taskService.getById` and the existing
  ownership check pattern (404 if missing, 403 if not the caller's task),
  and formats `dueIn` via the existing `util/dates.ts` `formatDueIn()`
  helper (no new util code needed).
- `tests/tasks.summary.test.ts` — new sibling test covering the happy path,
  cross-user 403, and 404.
- `CLAUDE.md` — project guidance for Claude Code: commands, architecture,
  conventions (validation-through-util, error envelope, services never
  import Express, ownership checks), and a Do-Not-Touch section calling out
  the reportBuilder snapshot and the "don't silently fix defects" rule.
- `.claude/settings.json` — permissions allowing `npm test` and
  `npm run lint` without prompting, denying `rm`, and asking before
  `git push`.

## Why

`GET /tasks/:id/summary` is a small, low-risk first task that exercises the
existing conventions (validation, envelope, ownership check, service reuse)
without touching any of the six seeded defects. `CLAUDE.md` and
`.claude/settings.json` establish the guardrails the rest of the week's
sessions rely on.
