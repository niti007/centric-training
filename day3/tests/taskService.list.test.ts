import * as taskService from '../src/services/taskService';

describe('taskService.list pagination', () => {
  it('page 1 includes the first record', () => {
    // u1 has 8 seeded tasks (t1..t8). Page 1 with size 3 should return the
    // first three, starting with t1.
    const result = taskService.list({ page: 1, size: 3, userId: 'u1' });
    expect(result.items.map((t) => t.id)).toEqual(['t1', 't2', 't3']);
  });
});
