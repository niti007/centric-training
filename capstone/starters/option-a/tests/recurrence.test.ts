// Test skeleton for the recurring-tasks feature (CAPSTONE.md).
//
// Every case below is named from CAPSTONE.md's requirements table and the
// "Chaining" / edge-case rows. None are implemented — that's the team's
// job. Replace `it.todo(...)` with a real `it(...)` as you implement each
// one. Drop this file in at `tests/recurrence.test.ts`, next to the
// existing `tests/dates.test.ts`.
//
// Uncomment the import once `src/util/recurrence.ts` exists in your clone
// and exports these names (adjust if you named things differently).
//
// import { advanceDueDate, nextOccurrence } from '../src/util/recurrence';

describe('advanceDueDate', () => {
  it.todo('advances a daily recurrence by exactly one day');

  it.todo('advances a weekly recurrence by exactly seven days');

  it.todo('advances a monthly recurrence to the same day-of-month next month');

  it.todo('month-end rollover: a monthly task due Jan 31 does not produce Feb 31 (define and assert your clamping rule)');

  it.todo('month-end rollover: a monthly task due on the last day of a 30-day month behaves consistently going into a 31-day month');

  it.todo('leap-day edge case: a monthly task due Jan 29/30/31 rolling into February in a non-leap year');
});

describe('nextOccurrence', () => {
  it.todo('inherits title from the completed task');

  it.todo('inherits owner (userId) from the completed task');

  it.todo('inherits cost from the completed task');

  it.todo('inherits recurrence from the completed task, so the chain continues');

  it.todo('does NOT inherit completion state — the new occurrence starts in the default open state regardless of how the prior one was marked done');

  it.todo('advances dueDate using advanceDueDate for the task\'s recurrence interval');

  it.todo('assigns the new occurrence a distinct id from the completed task');
});

describe('recurrence validation', () => {
  it.todo('rejects an unknown recurrence value with the repo\'s standard error envelope ({ error: { code, message, details? } })');

  it.todo('accepts null as "does not recur" without triggering next-occurrence creation on complete');
});

describe('PATCH /tasks/:id/complete integration (recurring vs non-recurring)', () => {
  // These belong in an integration test file exercising the real HTTP
  // route (see tasks.routes.test.ts for the supertest pattern already
  // used in this repo) — listed here as a reminder, not scaffolded.
  // Confirm the actual route/method against CAPSTONE.md and
  // src/routes/tasks.ts before writing these; the repo currently exposes
  // POST /tasks/:id/complete.

  it.todo('completing a non-recurring task does not create a new occurrence');

  it.todo('completing a recurring task creates exactly one new occurrence with the fields above');
});
