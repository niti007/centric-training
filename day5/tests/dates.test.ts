import { isOverdue } from '../src/util/dates';

describe('isOverdue timezone handling', () => {
  it('treats a UTC due-date-time as overdue only after that exact UTC instant, regardless of local timezone', () => {
    // Regression test for the timezone comparison bug. The buggy version normalizes the due
    // date to a *local* midnight before comparing to `now`, which flips
    // this to `true` depending on the machine's timezone offset.
    const dueDateIso = '2026-01-10T23:00:00.000Z';
    const now = new Date('2026-01-10T22:00:00.000Z');
    expect(isOverdue(dueDateIso, now)).toBe(false);
  });

  it('is overdue immediately after the UTC due instant passes', () => {
    const dueDateIso = '2026-01-10T23:00:00.000Z';
    const now = new Date('2026-01-10T23:00:01.000Z');
    expect(isOverdue(dueDateIso, now)).toBe(true);
  });

  it('agrees on overdue status regardless of which local timezone the process runs in', () => {
    const dueDateIso = '2026-03-01T00:00:00.000Z';
    const before = new Date('2026-02-28T23:00:00.000Z');
    const after = new Date('2026-03-01T01:00:00.000Z');
    expect(isOverdue(dueDateIso, before)).toBe(false);
    expect(isOverdue(dueDateIso, after)).toBe(true);
  });
});
