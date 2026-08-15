export function sumCosts(costs: number[]): number {
  let total = 0;
  for (const cost of costs) {
    total += cost;
  }
  return total;
}

export function averageCost(costs: number[]): number {
  if (costs.length === 0) return 0;
  return Math.round((sumCosts(costs) / costs.length) * 100) / 100;
}

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
