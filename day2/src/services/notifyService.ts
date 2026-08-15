import { Task, User } from '../repo/taskRepo';

export interface Notification {
  to: string;
  subject: string;
  html: string;
}

export function buildTaskAssignedNotification(task: Task, user: User): Notification {
  const subject = `New task assigned: ${task.title}`;
  const html = `
    <div>
      <p>Hi ${user.name},</p>
      <p>You have been assigned a new task: <strong>${task.title}</strong></p>
      <p>${task.description}</p>
      <p>Due: ${task.dueDate}</p>
    </div>
  `.trim();

  return { to: user.email, subject, html };
}

export function buildTaskCompletedNotification(task: Task, user: User): Notification {
  const subject = `Task completed: ${task.title}`;
  const html = `
    <div>
      <p>Hi ${user.name},</p>
      <p>Your task "${task.title}" has been marked complete.</p>
    </div>
  `.trim();

  return { to: user.email, subject, html };
}
