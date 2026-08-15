# Day 1 — Graded Practical

## Task framing

Make Claude follow OUR conventions without being told in chat.

You will author `CLAUDE.md` and `.claude/settings.json` so that, with no further prompting or clarification from you, running this single headless command:

```bash
claude -p "add a DELETE /tasks/:id route"
```

produces code that already matches this repository's real conventions — because your configuration told it to, not because you typed the requirements into the prompt yourself. The prompt above is deliberately bare. If your CLAUDE.md is doing its job, that's enough.

`src/routes/tasks.ts` has no DELETE handler in the baseline — this is a genuinely new route. Read the existing handlers first so you know what "our conventions" actually are before you try to write them down.

## Acceptance criteria

Your submission passes when all of the following are true:

- [ ] `CLAUDE.md` exists at the repo root and contains all four required sections from the lab: `## Commands`, `## Architecture`, `## Conventions`, `## Do Not Touch`.
- [ ] `.claude/settings.json` exists, is valid JSON, and contains at least one deny rule and at least one ask rule.
- [ ] `node scripts/verify-setup.mjs` exits 0.
- [ ] `src/routes/tasks.ts` contains a `DELETE /tasks/:id` route.
- [ ] That route's handler validates its input using `src/util/validate.ts` (imports from it and calls at least one of its exported helpers).
- [ ] That route's handler does not import anything from `src/repo/` directly — it goes through `src/services/taskService.ts` (or another service), not the repo layer.
- [ ] Errors returned by the route use the envelope shape `{ error: { code, message, details? } }` (i.e. use `errorEnvelope` from `util/validate.ts`, not an ad-hoc shape).
- [ ] A sibling test exists under `tests/` that references `DELETE /tasks/` (e.g. a supertest call to that method and path).
- [ ] `npm run lint` passes on the new code.

If the first headless run produces code that misses a criterion, do not fix it by hand and do not correct Claude in a follow-up chat turn. Revert, change your `CLAUDE.md`, and run the same bare command again. Getting there through configuration rather than conversation is the entire point of the exercise.

## What you submit

1. `CLAUDE.md`
2. `.claude/settings.json`
3. The state of `src/routes/tasks.ts` and `tests/` after running the `claude -p` command above (i.e. just push/commit what's on disk — don't hand-edit the output afterwards).
4. A short note (5–10 sentences) in `NOTES.md` under a `## Assessment` heading, covering: what you put in CLAUDE.md that you think mattered most, anything Claude got wrong on the first attempt and how your configuration change (not a chat correction) fixed it, and one thing you'd add to CLAUDE.md with more time.

## How this is graded

Run `node scripts/grade.mjs` from the repo root — it checks everything above except presentation, which your trainer scores by hand from your `NOTES.md` note. See `RUBRIC.md` for the full weighting.
