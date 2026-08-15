function toMinorUnits(amount: number): number {
  return Math.round(amount * 100);
}

export function sumCosts(costs: number[]): number {
  let totalMinorUnits = 0;
  for (const cost of costs) {
    totalMinorUnits += toMinorUnits(cost);
  }
  return totalMinorUnits / 100;
}

export function averageCost(costs: number[]): number {
  if (costs.length === 0) return 0;
  return Math.round((sumCosts(costs) / costs.length) * 100) / 100;
}

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
