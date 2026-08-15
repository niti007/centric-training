import * as userService from '../src/services/userService';
import { buildReport } from '../src/legacy/reportBuilder';

describe('reportBuilder N+1 regression', () => {
  it('looks up each user at most once regardless of how many tasks they own', () => {
    const spy = jest.spyOn(userService, 'getById');
    buildReport({ generatedAt: new Date() });

    // There are 3 seeded users but 25 seeded tasks. A batching
    // implementation calls getById at most once per unique user per
    // report section; a per-task N+1 implementation would call it once per
    // task per section (25+ times). Assert the call count stays bounded by
    // a small multiple of the user count, not the task count.
    expect(spy.mock.calls.length).toBeLessThanOrEqual(3 * 3);

    spy.mockRestore();
  });
});
