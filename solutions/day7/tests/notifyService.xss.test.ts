import { buildTaskAssignedNotification } from '../src/services/notifyService';
import { Task, User } from '../src/repo/taskRepo';

describe('notifyService HTML escaping (defect #6 regression)', () => {
  it('escapes a malicious task title before interpolating into HTML', () => {
    const task: Task = {
      id: 't1',
      userId: 'u1',
      title: '<script>alert(1)</script>',
      description: 'desc',
      status: 'open',
      dueDate: new Date().toISOString(),
      cost: 0,
      createdAt: new Date().toISOString(),
    };
    const user: User = { id: 'u1', name: 'Ada', email: 'ada@taskflow.dev' };

    const notification = buildTaskAssignedNotification(task, user);
    expect(notification.html).not.toContain('<script>');
    expect(notification.html).toContain('&lt;script&gt;');
  });
});
