// Recurrence date-math for the recurring-tasks feature (CAPSTONE.md).
//
// This file is scaffolding only — the signatures and JSDoc describe the
// contract; every body is a TODO for you to implement. Drop this file in
// at `src/util/recurrence.ts`, alongside the existing `src/util/dates.ts`.
//
// You will also need to extend the `Task` type in `src/repo/taskRepo.ts`
// (not duplicated here — edit the real one) with a `recurrence` field:
//
//   export type Recurrence = 'daily' | 'weekly' | 'monthly' | null;
//
//   export interface Task {
//     id: string;
//     userId: string;
//     title: string;
//     description: string;
//     status: 'open' | 'in_progress' | 'done';
//     dueDate: string;
//     cost: number;
//     createdAt: string;
//     recurrence: Recurrence;   // <-- new field, add to the real interface
//   }
//
// Import `Task` (and whatever recurrence type you land on) from
// '../repo/taskRepo' once that edit is made — don't invent a parallel type
// here.

import { Task } from '../repo/taskRepo';

/**
 * The set of valid recurrence values. `null` means "does not recur".
 *
 * TODO: decide whether this lives here or in taskRepo.ts as the source of
 * truth, and make sure validation (util/validate.ts's `requireOneOf`-style
 * helper) rejects anything outside this set with the repo's standard error
 * envelope, per CAPSTONE.md's "Validation" row.
 */
export type Recurrence = 'daily' | 'weekly' | 'monthly' | null;

/**
 * Advance an ISO due-date string by one recurrence interval.
 *
 * Must handle the month-end rollover edge case explicitly: a `monthly`
 * task due on the 31st (or the 30th, or Feb 29 in a leap year) must not
 * silently roll into an invalid or unintended date in the next month
 * (e.g. Jan 31 -> Feb 31, which doesn't exist, must not silently become
 * Mar 3 via native Date rollover, or any other un-reasoned result). Decide
 * on and document your rule (e.g. clamp to the target month's last day)
 * and back it with the test cases in `tests/recurrence.test.ts`.
 *
 * @param dueDateIso - the current occurrence's due date, ISO 8601.
 * @param recurrence - 'daily' | 'weekly' | 'monthly'. Do not call this
 *   with `null` — callers should only invoke it for recurring tasks.
 * @returns the next occurrence's due date, ISO 8601.
 */
export function advanceDueDate(dueDateIso: string, recurrence: Exclude<Recurrence, null>): string {
  throw new Error('TODO: implement advanceDueDate, including month-end rollover');
}

/**
 * Build the next occurrence of a completed recurring task.
 *
 * Per CAPSTONE.md: the new occurrence inherits title, owner, cost, and
 * recurrence; it does NOT inherit completion state (status resets to the
 * repo's default open state, not whatever `completedTask.status` was).
 * The due date is advanced via `advanceDueDate`.
 *
 * This function should not touch the repo directly (no `insertTask` calls
 * here) — keep it a pure transform, matching the existing service-layer
 * convention (`src/services/taskService.ts` never imports Express types
 * and stays pure over the repo); wire the actual `insertTask` call into
 * the service function that handles task completion.
 *
 * @param completedTask - the task as it was just marked complete. Must
 *   have a non-null `recurrence`.
 * @param newId - id to assign to the new occurrence (id generation
 *   strategy is up to you — match whatever `taskService.create` already
 *   does).
 * @returns a new `Task` representing the next occurrence, not yet
 *   inserted into the repo.
 */
export function nextOccurrence(completedTask: Task, newId: string): Task {
  throw new Error('TODO: implement nextOccurrence — inherit title/owner/cost/recurrence, reset status, advance dueDate');
}
