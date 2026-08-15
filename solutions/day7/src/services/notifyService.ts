import { Task, User } from '../repo/taskRepo';

export interface Notification {
  to: string;
  subject: string;
  html: string;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildTaskAssignedNotification(task: Task, user: User): Notification {
  const safeTitle = escapeHtml(task.title);
  const safeDescription = escapeHtml(task.description);
  const safeName = escapeHtml(user.name);

  const subject = `New task assigned: ${task.title}`;
  const html = `
    <div>
      <p>Hi ${safeName},</p>
      <p>You have been assigned a new task: <strong>${safeTitle}</strong></p>
      <p>${safeDescription}</p>
      <p>Due: ${task.dueDate}</p>
    </div>
  `.trim();

  return { to: user.email, subject, html };
}

export function buildTaskCompletedNotification(task: Task, user: User): Notification {
  const safeTitle = escapeHtml(task.title);
  const safeName = escapeHtml(user.name);

  const subject = `Task completed: ${task.title}`;
  const html = `
    <div>
      <p>Hi ${safeName},</p>
      <p>Your task "${safeTitle}" has been marked complete.</p>
    </div>
  `.trim();

  return { to: user.email, subject, html };
}
