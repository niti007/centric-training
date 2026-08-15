import { buildTaskAssignedNotification } from '../src/services/notifyService';
import { Task, User } from '../src/repo/taskRepo';

describe('notifyService', () => {
  it('builds an assigned-task notification with subject and recipient', () => {
    const task: Task = {
      id: 't1',
      userId: 'u1',
      title: 'Sample task',
      description: 'A simple description',
      status: 'open',
      dueDate: new Date().toISOString(),
      cost: 0,
      createdAt: new Date().toISOString(),
    };
    const user: User = { id: 'u1', name: 'Ada', email: 'ada@taskflow.dev' };

    const notification = buildTaskAssignedNotification(task, user);
    expect(notification.to).toBe('ada@taskflow.dev');
    expect(notification.subject).toContain('Sample task');
    expect(notification.html).toContain('Ada');
  });
});
