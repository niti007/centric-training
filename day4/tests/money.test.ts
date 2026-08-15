import { sumCosts } from '../src/util/money';

describe('sumCosts', () => {
  it('sums fractional costs to exact cent precision', () => {
    // Regression test for defect #3. Naive float accumulation of
    // 0.1 + 0.2 + 0.3 + 0.1 + 0.2 drifts to 0.9000000000000001.
    const total = sumCosts([0.1, 0.2, 0.3, 0.1, 0.2]);
    expect(total).toBe(0.9);
  });

  it('sums a larger set of fractional costs exactly', () => {
    const total = sumCosts([0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1]);
    expect(total).toBe(1);
  });
});
