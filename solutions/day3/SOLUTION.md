# Day 3 Solution

## What changed

- `src/services/taskService.ts` — fixed defect #1: pagination now uses
  `(page - 1) * size` instead of `page * size`, so 1-indexed page 1 starts
  at the first record and the last page no longer drops an item.
- `src/util/dates.ts` — fixed defect #2: `isOverdue` now compares the due
  date directly against `now` using epoch millis (both already normalized
  to UTC internally by `Date`), instead of first collapsing the due date to
  a *local* midnight via `new Date(year, month, day)` (which silently mixed
  UTC-sourced field values into a local-time constructor).
- `src/util/money.ts` — fixed defect #3: `sumCosts` now accumulates in
  integer minor units (cents) via `Math.round(amount * 100)` and divides
  back down at the end, instead of accumulating raw floats.
- `tests/taskService.list.test.ts`,
  `tests/dates.test.ts`,
  `tests/money.test.ts` — regression tests for each fix. Each
  fails if its corresponding fix is reverted (verified locally by
  temporarily reverting each fix and re-running `npx jest <file>`).
- `tests/reportBuilder.characterization.test.ts` snapshots are
  regenerated as part of materializing day4 (see root-level note below) —
  the `isOverdue` fix changes which tasks the legacy report classifies as
  overdue, so the pre-existing snapshots must be intentionally updated,
  not treated as drift.
- `services/` test coverage: `taskService.ts`, `userService.ts`,
  `dates.ts`, `money.ts`, `validate.ts` are covered by both the sparse
  baseline tests and the new regression tests above, and by
  `tests/util.validate.test.ts`/`tests/notifyService.test.ts` from Day 1.
  Coverage for `services/` and `util/` is ≥80% (verified via
  `npm run test:cov` against the materialized day4 project — see the
  final build report for actual numbers).

## Why — the "3 failing tests / day4 fully green" reconciliation

The instructor spec plants exactly 3 intentional failing tests on the
baseline (day1), encoding defects #1, #2, #3 — and separately says
"day4 onward must be fully green." But the original defect map assigns
defect #2's *fix* to a live Day 3 demo and doesn't formally attach it to
any day's solution deliverable before Day 6.

Since there are only 3 failing baseline tests (for defects 1, 2, 3), and
no other defect has a pre-existing failing test, the only way to reach
"day4 fully green" is for day3's solution to resolve all three defects
whose regression tests exist at baseline. This solution therefore fixes
defect #2 here as well as #1 and #3, rather than leaving it dangling
until Day 6. This is a deliberate reconciliation of the spec, not an
oversight — defects #4, #5, #6 remain unfixed here and are addressed in
the Day 6 and Day 7 solutions per the original defect map.

## Snapshot note

Fixing `isOverdue()` changes the overdue count in the report, so
`tests/__snapshots__/reportBuilder.characterization.test.ts.snap` legitimately
goes stale. Run `npx jest -u` after the fix and commit the updated snapshot.
Learners should be made to justify the change rather than blind-update it —
"the snapshot changed" is exactly the signal a characterization test exists to
give. day4's committed snapshot is the correct post-fix state.
