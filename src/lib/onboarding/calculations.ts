import { OpexItem, OpexFrequency } from '@/components/onboarding/types';

/**
 * Calculates the monthly equivalent of an OPEX amount based on its frequency.
 */
export function normalizeToMonthly(amount: number, frequency: OpexFrequency): number {
  switch (frequency) {
    case 'daily':
      return amount * 30;
    case 'weekly':
      return amount * 4;
    case 'yearly':
      return amount / 12;
    case 'monthly':
    default:
      return amount;
  }
}

/**
 * Calculates the total monthly OPEX from a list of items with varying frequencies.
 */
export function calculateMonthlyOpex(items: OpexItem[]): number {
  return items.reduce((sum, item) => {
    return sum + normalizeToMonthly(item.amount, item.frequency);
  }, 0);
}

/**
 * Calculates the OPEX cost per unit based on monthly total and expected sales.
 */
export function calculateOpexPerUnit(monthlyOpex: number, monthlySales: number): number {
  if (monthlySales <= 0) return 0;
  return monthlyOpex / monthlySales;
}
