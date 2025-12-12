// Break-Even Point (BEP) and ROI Calculator

export interface BEPResult {
  fixedCostsMonthly: number;
  variableCostPerUnit: number;
  averageSellingPrice: number;
  contributionMargin: number;
  contributionMarginRatio: number;
  bepUnits: number;
  bepUnitsDaily: number;
  bepRevenue: number;
  bepRevenueDaily: number;
}

export interface ROIResult {
  totalInvestment: number;
  monthlyRevenue: number;
  monthlyProfit: number;
  paybackMonths: number;
  annualROI: number;
  yearOneProfit: number;
}

export interface SalesProjection {
  month: number;
  revenue: number;
  costs: number;
  profit: number;
  cumulativeProfit: number;
}

/**
 * Calculate Break-Even Point
 */
export function calculateBEP(
  fixedCostsMonthly: number, // Monthly OPEX
  variableCostPerUnit: number, // COGS per item
  averageSellingPrice: number
): BEPResult {
  const contributionMargin = averageSellingPrice - variableCostPerUnit;
  const contributionMarginRatio =
    averageSellingPrice > 0 ? contributionMargin / averageSellingPrice : 0;

  const bepUnits =
    contributionMargin > 0
      ? Math.ceil(fixedCostsMonthly / contributionMargin)
      : 0;

  const bepUnitsDaily = Math.ceil(bepUnits / 30);
  const bepRevenue = bepUnits * averageSellingPrice;
  const bepRevenueDaily = Math.ceil(bepRevenue / 30);

  return {
    fixedCostsMonthly,
    variableCostPerUnit,
    averageSellingPrice,
    contributionMargin: Math.round(contributionMargin),
    contributionMarginRatio: Math.round(contributionMarginRatio * 100) / 100,
    bepUnits,
    bepUnitsDaily,
    bepRevenue: Math.round(bepRevenue),
    bepRevenueDaily: Math.round(bepRevenueDaily),
  };
}

/**
 * Calculate ROI and Payback Period
 */
export function calculateROI(
  totalInvestment: number, // Initial capital
  monthlyRevenue: number,
  monthlyCOGS: number,
  monthlyOPEX: number
): ROIResult {
  const monthlyProfit = monthlyRevenue - monthlyCOGS - monthlyOPEX;

  const paybackMonths =
    monthlyProfit > 0 ? Math.ceil(totalInvestment / monthlyProfit) : 0;

  const yearOneProfit = monthlyProfit * 12;
  const annualROI =
    totalInvestment > 0 ? (yearOneProfit / totalInvestment) * 100 : 0;

  return {
    totalInvestment,
    monthlyRevenue,
    monthlyProfit: Math.round(monthlyProfit),
    paybackMonths,
    annualROI: Math.round(annualROI * 10) / 10,
    yearOneProfit: Math.round(yearOneProfit),
  };
}

/**
 * Generate monthly sales projection
 */
export function generateSalesProjection(
  monthlyRevenue: number,
  monthlyCosts: number, // COGS + OPEX
  months: number = 12,
  growthRatePercent: number = 0 // Monthly growth rate
): SalesProjection[] {
  const projections: SalesProjection[] = [];
  let cumulativeProfit = 0;

  for (let month = 1; month <= months; month++) {
    const growthMultiplier = Math.pow(1 + growthRatePercent / 100, month - 1);
    const revenue = Math.round(monthlyRevenue * growthMultiplier);
    const costs = Math.round(monthlyCosts * growthMultiplier * 0.95); // Assume slight efficiency gains
    const profit = revenue - costs;
    cumulativeProfit += profit;

    projections.push({
      month,
      revenue,
      costs,
      profit,
      cumulativeProfit,
    });
  }

  return projections;
}

/**
 * Calculate how many units need to be sold to achieve target profit
 */
export function calculateTargetSales(
  targetProfit: number,
  fixedCosts: number,
  contributionMargin: number
): number {
  if (contributionMargin <= 0) return 0;
  return Math.ceil((fixedCosts + targetProfit) / contributionMargin);
}

/**
 * Format currency for display
 */
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

