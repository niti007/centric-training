# Day 7 — Block 1 Graded Practical

## Scope

This is the graded practical for **Block 1 only** (the Best Practices Deep Dive). It covers exactly the three-part exercise in `LAB.md`: fix the notification-escaping bug with a regression test, harden `.claude/settings.json`, and add `.claude/rules/security.md` + `.claude/rules/testing.md`.

**The capstone (Blocks 2–3) is graded separately**, against its own rubric in `capstone/CAPSTONE.md`. Nothing here scores your capstone work, and nothing in `capstone/CAPSTONE.md`'s rubric scores this. Don't conflate the two submissions — they're evaluated independently, by different criteria, at different points in the day.

## Task framing

`src/services/notifyService.ts` currently builds HTML notification bodies by interpolating `task.title`, `task.description`, and `user.name` — all user-controlled values — directly into a template string with no escaping. This is a real stored-injection risk: any value containing HTML/script content flows unescaped into the notification's `html` field. Fix it properly, prove the fix with a real regression test, then harden this repo's permission policy and codify the two lessons of the day as standing rules.

Work the way Block 1 described: fix the actual bug (all three values, both functions — not just the one you happen to notice first), verify with a test that fails when the fix is reverted, then extend `.claude/settings.json` and write the rules files.

## Acceptance criteria

Your submission passes when all of the following are true:

- [ ] `src/services/notifyService.ts` no longer interpolates raw user-controlled strings (`task.title`, `task.description`, `user.name`) into HTML in either `buildTaskAssignedNotification` or `buildTaskCompletedNotification` — every one of them is escaped before interpolation.
- [ ] Plain, non-malicious values still render correctly (a task titled `"Ship the Q3 report"` still reads that way in the output — escaping didn't mangle ordinary text).
- [ ] A regression test exists under `tests/` that constructs a task/user with an HTML-injection-shaped value (e.g. a `<script>` tag in the title) and asserts the resulting notification HTML does not contain the raw tag.
- [ ] That regression test **fails** when the fix is reverted — a test that passes with or without the fix does not count. (You should have verified this yourself in Step 1; the grader verifies it independently too.)
- [ ] `npm test` is fully green, including the new test — no regressions introduced anywhere else.
- [ ] `.claude/settings.json` is valid JSON, its `deny` list has grown beyond the one-entry starting point and covers secret/credential file reads, and its `ask` list has grown beyond the one-entry starting point and covers at least install/publish operations or risky-path writes.
- [ ] The pre-existing `hooks` block in `.claude/settings.json` is unchanged — hardening the permissions didn't remove the hook wiring that was already there.
- [ ] `.claude/rules/security.md` exists with substantive content (not a one-line stub) covering injection prevention, ownership/authorization checks, and secret handling.
- [ ] `.claude/rules/testing.md` exists with substantive content covering sibling tests for new source files and the "a bug fix ships with a regression test that fails when reverted" rule.

If your first attempt at the escaping fix only covers one of the three values, that's the exact partial-fix pattern the Block 1 walkthrough warned about — go back and cover all three, don't leave two unescaped because the grader might not happen to test them (it does).

## What you submit

1. The fixed `src/services/notifyService.ts`.
2. The new regression test file under `tests/`.
3. The hardened `.claude/settings.json`.
4. `.claude/rules/security.md` and `.claude/rules/testing.md`.

## How this is graded

Run `node scripts/grade.mjs` from the repo root — it checks everything above except Presentation, which your trainer scores by hand. See `RUBRIC.md` for the full weighting.

The grader is deliberately adversarial about the regression test: it independently writes its own crafted-input check, confirms it passes against your current `notifyService.ts`, then temporarily swaps in a known-vulnerable version of the file, re-runs the same check, and confirms it now fails — before restoring your file exactly as it was. It does the same revert check against your own committed test, not just its own. This is the same anti-cheat pattern the programme has used since Day 3: a check that can't tell fixed from unfixed code isn't a check.
