/**
 * Financial Calculations for Onboarding Summary
 *
 * All calculations are deterministic (manual formulas).
 * AI suggestions are text-only; the app computes all numbers.
 */

import { Ingredient } from './businessLogic';
import { EquipmentItem } from '@/components/onboarding/types';

// ─────────────────────────────────────────────────────────────────────────────
// Pricing Modes
// ─────────────────────────────────────────────────────────────────────────────

export type PricingMode = 'tipis' | 'sehat' | 'premium';

export const PRICING_MODES = {
  tipis: { gmPercent: 45, label: 'Tipis (45%)' },
  sehat: { gmPercent: 60, label: 'Sehat (60%)' },
  premium: { gmPercent: 70, label: 'Premium (70%)' },
} as const;

export const DEFAULT_PRICING_MODE: PricingMode = 'sehat';
export const SAFE_TARGET_BUFFER = 1.2; // 20% buffer for Target Aman

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface FinancialAssumptions {
  cupsTargetPerDay: number; // Target penjualan per hari
  daysSellPerMonth: number; // Hari operasi per bulan
  platformFeePercent: number; // Fee platform (GoFood, etc.)
  wastePercent: number; // Waste/spoilage percentage
}

export interface FinancialMetrics {
  // Per portion metrics
  cogsPerPortion: number;
  effectiveCogs: number; // COGS including waste
  opexPerPortion: number;
  platformFeePerPortion: number;
  netProfitPerPortion: number;
  grossMarginPercent: number;
  netMarginPercent: number;

  // Aggregate metrics
  monthlySales: number;
  monthlyRevenue: number;
  monthlyNetProfit: number;
  bepCupsPerDay: number;
  bepCupsPerMonth: number;
  paybackMonths: number;

  // Flags for edge cases
  isNegativeProfit: boolean;
  isBepInfinity: boolean;
  isPaybackInfinity: boolean;
}

export interface ShoppingPlanItem {
  ingredientName: string;
  totalUsage: number;
  usageUnit: string;
  packSize: number;
  packUnit: string;
  packsToBuy: number;
  estimatedCost: number;
  percentOfTotal: number;
}

export interface ShoppingPlanSummary {
  items: ShoppingPlanItem[];
  totalCost: number;
  productionBasis: {
    cupsPerDay: number;
    days: number;
    totalCups: number;
  };
  topCostDrivers: Array<{
    name: string;
    percentOfTotal: number;
  }>;
}

export interface PriceSimulationResult {
  price: number;
  netProfitPerPortion: number;
  netMarginPercent: number;
  bepCupsPerDay: number;
  paybackMonths: number;
  deltaProfit: number; // vs current price
  deltaMargin: number; // vs current margin
}

// ─────────────────────────────────────────────────────────────────────────────
// Default Assumptions
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_ASSUMPTIONS: FinancialAssumptions = {
  cupsTargetPerDay: 30,
  daysSellPerMonth: 30,
  platformFeePercent: 0,
  wastePercent: 0,
};

// ─────────────────────────────────────────────────────────────────────────────
// New Helper Functions for Summary Calculations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate monthly CAPEX depreciation from equipment items.
 * Formula: Σ (equipment_price / (life_span_years × 12))
 */
export function calculateCapexDepreciationMonthly(equipmentData: EquipmentItem[]): number {
  if (!equipmentData || equipmentData.length === 0) return 0;

  return equipmentData.reduce((sum, item) => {
    if (!item.isSelected) return sum; // Only count selected items
    const monthlyDepreciation = item.estimated_price / (item.life_span_years * 12);
    return sum + monthlyDepreciation;
  }, 0);
}

/**
 * Calculate total fixed cost per month (OPEX + CAPEX depreciation)
 */
export function calculateFixedCostMonthly(
  opexMonthly: number,
  capexDepreciationMonthly: number,
): number {
  return opexMonthly + capexDepreciationMonthly;
}

/**
 * Calculate operating days per month from openDays array.
 * Uses formula: round(30 × open_days_per_week / 7)
 */
export function calculateOperatingDaysPerMonth(openDaysCount: number): number {
  if (openDaysCount <= 0 || openDaysCount > 7) return 30; // Default fallback
  return Math.round((30 * openDaysCount) / 7);
}

/**
 * Calculate recommended selling price from COGS using pricing mode (GM target).
 * Formula: price = cogs / (1 - gm_target)
 */
export function calculatePriceFromCOGS(
  cogs: number,
  pricingMode: PricingMode = DEFAULT_PRICING_MODE,
): number {
  const gmTarget = PRICING_MODES[pricingMode].gmPercent / 100;
  if (gmTarget >= 1) return cogs; // Edge case protection
  const rawPrice = cogs / (1 - gmTarget);
  // Round to nearest 500 for cleaner pricing
  return Math.round(rawPrice / 500) * 500;
}

/**
 * Calculate contribution margin per unit.
 * CM = price - cogs - channel_variable_per_unit
 */
export function calculateContributionMargin(
  price: number,
  cogs: number,
  channelFeePerUnit: number = 0,
): number {
  return price - cogs - channelFeePerUnit;
}

/**
 * Calculate BEP (Break-Even Point) units per month and per day.
 * BEP = fixed_monthly / contribution_margin
 */
export function calculateBEP(
  fixedCostMonthly: number,
  contributionMargin: number,
  operatingDaysPerMonth: number,
): { bepUnitsMonth: number; bepUnitsDay: number; isBepInfinity: boolean } {
  if (contributionMargin <= 0) {
    return { bepUnitsMonth: Infinity, bepUnitsDay: Infinity, isBepInfinity: true };
  }

  const bepUnitsMonth = Math.ceil(fixedCostMonthly / contributionMargin);
  const bepUnitsDay = Math.ceil(bepUnitsMonth / operatingDaysPerMonth);

  return { bepUnitsMonth, bepUnitsDay, isBepInfinity: false };
}

/**
 * Calculate Target Aman (Safe Target) = BEP × buffer
 */
export function calculateTargetSafe(
  bepUnitsDay: number,
  buffer: number = SAFE_TARGET_BUFFER,
): number {
  if (!isFinite(bepUnitsDay)) return 0;
  return Math.ceil(bepUnitsDay * buffer);
}

/**
 * Calculate estimated ROI/Payback based on Target Aman.
 */
export function calculatePaybackFromTargetSafe(
  targetSafeDay: number,
  operatingDaysPerMonth: number,
  contributionMargin: number,
  fixedCostMonthly: number,
  capexTotal: number,
): { paybackMonths: number; estimatedProfitMonth: number; isPaybackInfinity: boolean } {
  const unitsMonth = targetSafeDay * operatingDaysPerMonth;
  const netProfitMonthEst = unitsMonth * contributionMargin - fixedCostMonthly;

  if (netProfitMonthEst <= 0) {
    return {
      paybackMonths: Infinity,
      estimatedProfitMonth: netProfitMonthEst,
      isPaybackInfinity: true,
    };
  }

  const paybackMonths = Math.ceil(capexTotal / netProfitMonthEst);
  return { paybackMonths, estimatedProfitMonth: netProfitMonthEst, isPaybackInfinity: false };
}

// ─────────────────────────────────────────────────────────────────────────────
// Core Calculation Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate all financial metrics based on inputs
 */
export function calculateFinancialMetrics(
  priceSell: number,
  cogsPerPortion: number,
  opexMonthly: number,
  equipmentCost: number,
  assumptions: FinancialAssumptions,
): FinancialMetrics {
  const { cupsTargetPerDay, daysSellPerMonth, platformFeePercent, wastePercent } = assumptions;

  // 1. Monthly sales volume
  const monthlySales = cupsTargetPerDay * daysSellPerMonth;

  // 2. OPEX per portion
  const opexPerPortion = monthlySales > 0 ? opexMonthly / monthlySales : 0;

  // 3. Platform fee per portion
  const platformFeePerPortion = priceSell * (platformFeePercent / 100);

  // 4. Effective COGS (including waste)
  const effectiveCogs = cogsPerPortion * (1 + wastePercent / 100);

  // 5. Net profit per portion
  const netProfitPerPortion = priceSell - effectiveCogs - opexPerPortion - platformFeePerPortion;

  // 6. Gross margin (before OPEX and fees)
  const grossMarginPercent = priceSell > 0 ? ((priceSell - cogsPerPortion) / priceSell) * 100 : 0;

  // 7. Net margin (after all costs)
  const netMarginPercent = priceSell > 0 ? (netProfitPerPortion / priceSell) * 100 : 0;

  // 8. Monthly financials
  const monthlyRevenue = priceSell * monthlySales;
  const monthlyNetProfit = netProfitPerPortion * monthlySales;

  // 9. BEP (cups/day) - operational break-even
  // Contribution Margin = Price - Variable Cost (COGS + fees)
  const contributionMargin = priceSell - effectiveCogs - platformFeePerPortion;
  let bepCupsPerMonth: number;
  let bepCupsPerDay: number;
  let isBepInfinity = false;

  if (contributionMargin <= 0) {
    bepCupsPerMonth = Infinity;
    bepCupsPerDay = Infinity;
    isBepInfinity = true;
  } else {
    bepCupsPerMonth = opexMonthly / contributionMargin;
    bepCupsPerDay = Math.ceil(bepCupsPerMonth / daysSellPerMonth);
  }

  // 10. Payback/ROI (months)
  let paybackMonths: number;
  let isPaybackInfinity = false;

  if (monthlyNetProfit <= 0) {
    paybackMonths = Infinity;
    isPaybackInfinity = true;
  } else {
    paybackMonths = Math.ceil(equipmentCost / monthlyNetProfit);
  }

  return {
    cogsPerPortion,
    effectiveCogs,
    opexPerPortion,
    platformFeePerPortion,
    netProfitPerPortion,
    grossMarginPercent,
    netMarginPercent,
    monthlySales,
    monthlyRevenue,
    monthlyNetProfit,
    bepCupsPerDay,
    bepCupsPerMonth,
    paybackMonths,
    isNegativeProfit: netProfitPerPortion < 0,
    isBepInfinity,
    isPaybackInfinity,
  };
}

/**
 * Simulate financial metrics with a different price
 */
export function simulatePrice(
  newPrice: number,
  currentPrice: number,
  cogsPerPortion: number,
  opexMonthly: number,
  equipmentCost: number,
  assumptions: FinancialAssumptions,
): PriceSimulationResult {
  const currentMetrics = calculateFinancialMetrics(
    currentPrice,
    cogsPerPortion,
    opexMonthly,
    equipmentCost,
    assumptions,
  );

  const newMetrics = calculateFinancialMetrics(
    newPrice,
    cogsPerPortion,
    opexMonthly,
    equipmentCost,
    assumptions,
  );

  return {
    price: newPrice,
    netProfitPerPortion: newMetrics.netProfitPerPortion,
    netMarginPercent: newMetrics.netMarginPercent,
    bepCupsPerDay: newMetrics.bepCupsPerDay,
    paybackMonths: newMetrics.paybackMonths,
    deltaProfit: newMetrics.netProfitPerPortion - currentMetrics.netProfitPerPortion,
    deltaMargin: newMetrics.netMarginPercent - currentMetrics.netMarginPercent,
  };
}

/**
 * Generate rounded price suggestions based on current price
 */
export function generateRoundedPriceOptions(currentPrice: number): number[] {
  const options: number[] = [];

  // Round down to nearest 1000
  const roundedDown = Math.floor(currentPrice / 1000) * 1000;
  if (roundedDown > 0 && roundedDown !== currentPrice) {
    options.push(roundedDown);
  }

  // Round up to nearest 1000
  const roundedUp = Math.ceil(currentPrice / 1000) * 1000;
  if (roundedUp !== currentPrice && roundedUp !== roundedDown) {
    options.push(roundedUp);
  }

  // Next thousand up
  const nextThousand = roundedUp + 1000;
  if (!options.includes(nextThousand)) {
    options.push(nextThousand);
  }

  // Premium option (+2000 from rounded up)
  const premium = roundedUp + 2000;
  if (!options.includes(premium)) {
    options.push(premium);
  }

  return options.slice(0, 3).sort((a, b) => a - b);
}

// ─────────────────────────────────────────────────────────────────────────────
// Shopping Plan Functions
// ─────────────────────────────────────────────────────────────────────────────

import { UNIT_CATEGORIES, getUnitCategory } from './businessLogic';

/**
 * Generate enhanced shopping plan with cost breakdown
 */
export function generateEnhancedShoppingPlan(
  ingredients: Ingredient[],
  cupsPerDay: number,
  days: number = 7,
): ShoppingPlanSummary {
  const totalCups = cupsPerDay * days;

  const items: ShoppingPlanItem[] = ingredients.map((ing) => {
    const totalUsage = ing.usageQuantity * totalCups;

    // If buying info is missing
    if (!ing.buyingUnit || !ing.buyingQuantity || !ing.buyingPrice) {
      return {
        ingredientName: ing.name,
        totalUsage,
        usageUnit: ing.usageUnit,
        packSize: 0,
        packUnit: 'unknown',
        packsToBuy: 0,
        estimatedCost: 0,
        percentOfTotal: 0,
      };
    }

    const usageCat = getUnitCategory(ing.usageUnit);
    const buyCat = getUnitCategory(ing.buyingUnit);

    let requiredPacks = 0;

    if (usageCat === buyCat && usageCat !== 'unknown') {
      const catConfig = UNIT_CATEGORIES[usageCat];
      // Normalize unit keys to match config (case-insensitive lookup)
      const usageUnitKey = ing.usageUnit.toLowerCase();
      const buyingUnitKey = ing.buyingUnit.toLowerCase();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const usageConversion = (catConfig.conversions as any)[usageUnitKey] || 1;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const buyConversion = (catConfig.conversions as any)[buyingUnitKey] || 1;

      const usageBase = totalUsage * usageConversion;
      const packBase = ing.buyingQuantity * buyConversion;

      if (packBase > 0 && usageBase > 0) {
        // Use at least 1 pack if there's any usage
        requiredPacks = Math.max(1, Math.ceil(usageBase / packBase));
      }
    } else {
      // Fallback: simple division when units don't match
      if (ing.buyingQuantity > 0 && totalUsage > 0) {
        requiredPacks = Math.max(1, Math.ceil(totalUsage / ing.buyingQuantity));
      }
    }

    return {
      ingredientName: ing.name,
      totalUsage,
      usageUnit: ing.usageUnit,
      packSize: ing.buyingQuantity,
      packUnit: ing.buyingUnit,
      packsToBuy: requiredPacks,
      estimatedCost: requiredPacks * ing.buyingPrice,
      percentOfTotal: 0, // Will calculate after
    };
  });

  // Calculate total and percentages
  const totalCost = items.reduce((sum, item) => sum + item.estimatedCost, 0);

  items.forEach((item) => {
    item.percentOfTotal = totalCost > 0 ? (item.estimatedCost / totalCost) * 100 : 0;
  });

  // Get top 3 cost drivers
  const topCostDrivers = [...items]
    .sort((a, b) => b.estimatedCost - a.estimatedCost)
    .slice(0, 3)
    .map((item) => ({
      name: item.ingredientName,
      percentOfTotal: item.percentOfTotal,
    }));

  return {
    items,
    totalCost,
    productionBasis: {
      cupsPerDay,
      days,
      totalCups,
    },
    topCostDrivers,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation & Edge Case Helpers
// ─────────────────────────────────────────────────────────────────────────────

export interface DataValidationResult {
  isComplete: boolean;
  missingPriceIngredients: string[];
  hasZeroCogs: boolean;
  hasNoIngredients: boolean;
  warnings: string[];
}

/**
 * Validate ingredient data completeness
 */
export function validateIngredientData(ingredients: Ingredient[]): DataValidationResult {
  const missingPriceIngredients = ingredients
    .filter((ing) => !ing.buyingPrice || ing.buyingPrice <= 0)
    .map((ing) => ing.name);

  const hasNoIngredients = ingredients.length === 0;
  const hasZeroCogs =
    ingredients.length > 0 && ingredients.every((ing) => !ing.buyingPrice || ing.buyingPrice <= 0);

  const warnings: string[] = [];

  if (hasNoIngredients) {
    warnings.push('Belum ada bahan yang ditambahkan');
  } else if (missingPriceIngredients.length > 0) {
    warnings.push(`${missingPriceIngredients.length} bahan belum ada harga beli`);
  }

  return {
    isComplete: missingPriceIngredients.length === 0 && !hasNoIngredients,
    missingPriceIngredients,
    hasZeroCogs,
    hasNoIngredients,
    warnings,
  };
}

/**
 * Calculate minimum viable price to break even
 */
export function calculateMinimumViablePrice(
  cogsPerPortion: number,
  opexMonthly: number,
  assumptions: FinancialAssumptions,
): number {
  const { cupsTargetPerDay, daysSellPerMonth, platformFeePercent, wastePercent } = assumptions;

  const monthlySales = cupsTargetPerDay * daysSellPerMonth;
  const opexPerPortion = monthlySales > 0 ? opexMonthly / monthlySales : 0;
  const effectiveCogs = cogsPerPortion * (1 + wastePercent / 100);

  // Price = (EffectiveCOGS + OPEX/portion) / (1 - platformFeePercent/100)
  // To have netProfit >= 0
  const feeMultiplier = 1 - platformFeePercent / 100;
  if (feeMultiplier <= 0) {
    return Infinity; // Platform fee is 100% or more, impossible to profit
  }

  const minPrice = (effectiveCogs + opexPerPortion) / feeMultiplier;
  return Math.ceil(minPrice);
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatting Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function formatCurrency(amount: number): string {
  if (!isFinite(amount)) return '-';
  return `Rp ${Math.round(amount).toLocaleString('id-ID')}`;
}

export function formatPercent(value: number, decimals: number = 1): string {
  if (!isFinite(value)) return '-';
  return `${value.toFixed(decimals)}%`;
}

export function formatBepDisplay(
  bepCupsPerDay: number,
  isInfinity: boolean,
): { text: string; isError: boolean } {
  if (isInfinity) {
    return { text: 'Tidak tercapai', isError: true };
  }
  return { text: `${bepCupsPerDay} cups/hari`, isError: false };
}

export function formatPaybackDisplay(
  paybackMonths: number,
  isInfinity: boolean,
): { text: string; isError: boolean } {
  if (isInfinity) {
    return { text: 'Tidak balik modal', isError: true };
  }
  return { text: `${paybackMonths} bulan`, isError: false };
}
