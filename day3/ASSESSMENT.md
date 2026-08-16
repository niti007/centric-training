# Day 3 — Graded Practical

## Task framing

Two of this repo's seeded bugs are your job today: the pagination bug you started chasing in Lab Step 1, and the money-rollup bug you fixed in Lab Step 4. Finish both properly — real fixes, not special-cased patches that happen to satisfy one example — and back each one with a regression test that would fail again if the fix were reverted. Then bring `services/` test coverage up to a level that reflects an actual test suite, not a token one.

There is no separate "submit a diff" step: your working tree at the end of the session, on disk, is what's graded.

## Acceptance criteria

Your submission passes when all of the following are true:

- [ ] `npm run test:cov` (or `npx jest --coverage`) reports **≥ 80% line coverage on everything under `src/services/`**.
- [ ] The pagination bug in `services/taskService.ts` is genuinely fixed: paging through a filtered set of tasks returns every matching record exactly once, with no record dropped from the last page and no record skipped on the first page — at multiple page sizes, not just the one case already in `tests/taskService.list.test.ts`.
- [ ] The float-precision bug in `util/money.ts` is genuinely fixed: `sumCosts()` returns exact results for fractional cost values, not values that have drifted by fractions of a cent.
- [ ] Both fixes are backed by regression tests already committed in `tests/` — and each regression test genuinely exercises the bug: it must be a test that would fail if you reverted just that one fix and left everything else alone. **A test that would pass whether or not the underlying code is correct doesn't count** — think back to Block 7 of today's teaching: no tautological assertions, no accidentally-still-passing-either-way tests.
- [ ] `npm run lint` passes with no new warnings.
- [ ] The project still compiles cleanly (`npx tsc --noEmit`).
- [ ] No test file contains a leftover `.only(` or `.skip(` — every test you wrote or touched today actually runs as part of the full suite.
- [ ] `.claude/settings.json` is still present and valid, with its deny rule intact — you shouldn't have needed to loosen permissions to do this work.

Grading independently re-checks your two bug fixes at boundary values beyond whatever you tested by hand, and independently verifies that each regression test actually fails if its corresponding fix is reverted. Passing because a test happens to be shaped right, without the underlying logic actually being correct, will not pass this check — fix the real behavior, not the test.

## What you submit

1. The state of `src/` and `tests/` on disk at the end of the session (commit or leave as-is — nothing to package separately).
2. A short note (5–10 sentences) in `NOTES.md` under a `## Assessment` heading, covering: what was actually wrong with each bug (in your own words, not a guess), what your regression test for each one specifically proves, and one case you checked by hand to convince yourself the fix was general rather than special-cased to the example already in the repo.

## How this is graded

Run `node scripts/grade.mjs` from the repo root — it checks everything above except presentation, which your trainer scores by hand from your `NOTES.md` note. See `RUBRIC.md` for the full weighting.

The grader is deterministic and disk-only: it inspects files and runs real test commands, it does not read chat transcripts, and it will not give you credit for a plausible-looking `NOTES.md` claim that isn't backed by code that actually behaves the way it says.
