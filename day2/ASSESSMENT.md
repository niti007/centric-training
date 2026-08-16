# Day 2 — Graded Practical

## Task framing

Refactor `src/legacy/reportBuilder.ts` into **at least three** smaller, independently tested units, with behavior fully preserved.

`reportBuilder.ts` is currently one long function (`buildReport`) doing filtering, counting, per-user aggregation, formatting, and string assembly all in one place, with no unit tests of its own — only the characterization tests in `tests/reportBuilder.characterization.test.ts`, which snapshot its current output for three input scenarios. Those snapshots are your ground truth for "behavior preserved." Do not update them to make a refactor "pass" — if a snapshot would need to change, your refactor changed behavior, and that's a bug, not a done task.

Work the way Block 5 and the live demo described: characterization tests green first, then small verified extractions, one at a time, tests staying green after each — not one large unreviewable diff.

## Acceptance criteria

Your submission passes when all of the following are true:

- [ ] `src/legacy/reportBuilder.ts` still exports `buildReport` with the same signature and behavior.
- [ ] At least three other named functions have been extracted out of `buildReport`'s body into their own testable units, each reasonably small (roughly under 60 lines) — not three trivial one-line wrappers that leave the real logic still inline.
- [ ] `tests/reportBuilder.characterization.test.ts` still passes, unmodified, with **no snapshot changes** (`npx jest reportBuilder.characterization` — check the diff on `tests/__snapshots__/reportBuilder.characterization.test.ts.snap` is empty).
- [ ] At least one of the newly extracted units has its own dedicated unit test under `tests/` (a new file, or a clearly separated new `describe` block), and it passes.
- [ ] No new dependencies were added to `package.json` — this refactor is achievable with what's already installed.
- [ ] `npm run lint` passes.
- [ ] The known N+1-shaped user lookups inside the per-user and per-task sections are left alone. If you notice them, that's a correct observation — flag it in `NOTES.md`, don't fix it here. It's out of scope for this task and belongs to a later exercise.

If your first attempt at an extraction breaks a characterization snapshot, that's a signal you changed behavior, not that the snapshot is stale. Revert the extraction and try a narrower one — don't edit the snapshot to make it pass.

## What you submit

1. The refactored `src/legacy/reportBuilder.ts`.
2. Any new or extended test file(s) under `tests/` covering your extracted units.
3. A short note (5–10 sentences) in `NOTES.md` under an `## Assessment` heading, covering: which units you extracted and why you drew the boundaries where you did, how you verified behavior didn't change at each step (specifically — which command, what you looked at), and anything you noticed in `reportBuilder.ts` that you deliberately did *not* fix because it was out of scope.

## How this is graded

Run `node scripts/grade.mjs` from the repo root — it checks everything above except Presentation, which your trainer scores by hand from your `NOTES.md` note. See `RUBRIC.md` for the full weighting.
