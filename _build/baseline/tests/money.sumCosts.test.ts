import { sumCosts } from '../src/util/money';

describe('sumCosts', () => {
  it('sums fractional costs to exact cent precision', () => {
    // 0.1 + 0.2 famously drifts to 0.30000000000000004 in naive float
    // accumulation. A correct implementation must return exactly 0.3.
    const total = sumCosts([0.1, 0.2, 0.3, 0.1, 0.2]);
    expect(total).toBe(0.9);
  });
});
