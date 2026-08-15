import { buildReport } from '../src/legacy/reportBuilder';
import { fixtureAnchor } from '../src/repo/taskRepo';

describe('reportBuilder characterization', () => {
  // Uses the same fixed anchor instant the seeded fixtures are generated
  // from, so the report — and its snapshots — are fully deterministic.
  const fixedNow = fixtureAnchor();

  it('matches the known-good snapshot for the default report', () => {
    const report = buildReport({ generatedAt: fixedNow });
    expect(report).toMatchSnapshot();
  });

  it('matches the known-good snapshot filtered to open tasks only', () => {
    const report = buildReport({ generatedAt: fixedNow, statusFilter: 'open' });
    expect(report).toMatchSnapshot();
  });

  it('matches the known-good snapshot excluding zero-cost tasks', () => {
    const report = buildReport({ generatedAt: fixedNow, includeZeroCost: false });
    expect(report).toMatchSnapshot();
  });
});
