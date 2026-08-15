# Day 2 Solution

## What changed

- `src/legacy/reportBuilder.ts` — decomposed the ~275-line single function
  into named units, each under 60 LOC: `filterTasks`, `statusBreakdown`,
  `overdueTitles`, `costLabel`, `statusLabel`, `buildPerUserSection`,
  `buildTaskDetailSection`, `buildCostBucketsSection`, with `buildReport`
  orchestrating them. Behavior-preserving: the characterization/snapshot
  tests from the baseline (`tests/reportBuilder.characterization.test.ts`)
  still pass unmodified against this version — verified by running the
  suite after the refactor with no snapshot changes.
  **The N+1 defect (#5) was deliberately NOT fixed here** — both
  `buildPerUserSection` and `buildTaskDetailSection` still call
  `userService.getById()` per iteration, per the instructor defect map
  (defect #5 surfaces on Day 6, via the performance sub-agent exercise).
  Comments mark exactly where and why.
- `src/routes/tasks.ts` — added `POST /tasks/bulk` (validates every item
  before creating any; rejects the whole batch with per-index failures if
  any item is invalid), plus JSDoc comments on every route handler.
- `tests/tasks.bulk.test.ts` — happy path, partial-failure rejection, empty
  array rejection.
- `README.md` — added an API table (method / path / auth / description).

## Why

The refactor demonstrates decomposing a god function without changing
behavior, using pre-existing characterization tests as the safety net. The
N+1 loop is intentionally left alone so it remains available as a Day 6
performance-review target — refactoring it now would remove the exercise.
`POST /tasks/bulk` and the JSDoc/README additions round out Day 2's
"working in an existing codebase" theme.
