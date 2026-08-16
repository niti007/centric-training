import * as taskService from '../src/services/taskService';

describe('taskService.list pagination', () => {
  it('page 1 includes the first record', () => {
    // Regression test for the pagination off-by-one. Reverting
    // taskService.list to `slice(page * size, page * size + size)` makes
    // this fail: page 1 would return [t4, t5, t6] instead of [t1, t2, t3].
    const result = taskService.list({ page: 1, size: 3, userId: 'u1' });
    expect(result.items.map((t) => t.id)).toEqual(['t1', 't2', 't3']);
  });

  it('the last page does not drop the final item', () => {
    const all = taskService.list({ page: 1, size: 100, userId: 'u1' });
    const total = all.total; // 8 seeded u1 tasks
    const size = 3;
    const lastPage = Math.ceil(total / size);
    const result = taskService.list({ page: lastPage, size, userId: 'u1' });
    const lastItemFromFull = all.items[total - 1];
    expect(result.items.map((t) => t.id)).toContain(lastItemFromFull.id);
  });
});
