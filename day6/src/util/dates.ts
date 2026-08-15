export function parseDueDate(dueDate: string): Date {
  return new Date(dueDate);
}

export function isOverdue(dueDateIso: string, now: Date = new Date()): boolean {
  const due = new Date(dueDateIso);
  return due.getTime() < now.getTime();
}

export function daysUntil(dueDateIso: string, now: Date = new Date()): number {
  const due = new Date(dueDateIso);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((due.getTime() - now.getTime()) / msPerDay);
}

export function formatDueIn(dueDateIso: string, now: Date = new Date()): string {
  const days = daysUntil(dueDateIso, now);
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'due today';
  return `${days}d`;
}
