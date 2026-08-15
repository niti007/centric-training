import { isOverdue } from '../src/util/dates';

describe('isOverdue timezone handling', () => {
  it('treats a UTC due-date-time as overdue only after that exact UTC instant, regardless of local timezone', () => {
    // Due date is 2026-01-10T23:00:00Z (11pm UTC on Jan 10th).
    const dueDateIso = '2026-01-10T23:00:00.000Z';
    // "Now" is 2026-01-10T22:00:00Z — one hour BEFORE the due instant.
    const now = new Date('2026-01-10T22:00:00.000Z');

    // At this instant the task should not yet be overdue, regardless of the
    // machine's local timezone.
    expect(isOverdue(dueDateIso, now)).toBe(false);
  });
});
