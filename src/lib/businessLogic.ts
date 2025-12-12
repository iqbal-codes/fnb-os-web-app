// UNIT CATEGORY DEFINITIONS
export const UNIT_CATEGORIES = {
  mass: {
    label: 'Berat (Mass)',
    units: ['gram', 'kg', 'mg'],
    base: 'gram',
    conversions: { gram: 1, kg: 1000, mg: 0.001 },
  },
  volume: {
    label: 'Volume',
    units: ['ml', 'liter'],
    base: 'ml',
    conversions: { ml: 1, liter: 1000 },
  },
  unit: {
    label: 'Unit (Pcs)',
    units: ['pcs', 'pack', 'botol', 'kaleng', 'karton', 'butir', 'batang', 'lembar'],
    base: 'pcs',
    conversions: {
      pcs: 1,
      pack: 1,
      botol: 1,
      kaleng: 1,
      karton: 1,
      butir: 1,
      batang: 1,
      lembar: 1,
    },
  },
} as const;

export interface Ingredient {
  id?: string;
  name: string;
  usageQuantity: number;
  usageUnit: string;
  buyingQuantity: number;
  buyingUnit: string;
  buyingPrice: number;
  isAiSuggested?: boolean;
}

export type UnitCategory = keyof typeof UNIT_CATEGORIES;

export const getUnitCategory = (unit: string): UnitCategory | 'unknown' => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((UNIT_CATEGORIES.mass.units as any).includes(unit)) return 'mass';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((UNIT_CATEGORIES.volume.units as any).includes(unit)) return 'volume';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((UNIT_CATEGORIES.unit.units as any).includes(unit)) return 'unit';
  return 'unknown';
};

/**
 * Calculates the COGS for a single recipe ingredient.
 * Handles unit conversion between buying unit and usage unit.
 */
export const calculateIngredientCost = (ingredient: Ingredient): number => {
  const usageCat = getUnitCategory(ingredient.usageUnit);
  const buyCat = getUnitCategory(ingredient.buyingUnit);

  let ratio = 0;

  if (usageCat === buyCat && usageCat !== 'unknown') {
    const catConfig = UNIT_CATEGORIES[usageCat];

    const usageInBase =
      ingredient.usageQuantity * (catConfig.conversions as any)[ingredient.usageUnit];

    const buyInBase =
      ingredient.buyingQuantity * (catConfig.conversions as any)[ingredient.buyingUnit];

    if (buyInBase > 0) {
      ratio = usageInBase / buyInBase;
    }
  } else {
    // Fallback: simple division if units mismatch (should be avoided by UI)
    // Or if it's 'unknown' category (custom units)
    if (ingredient.buyingQuantity > 0) {
      ratio = ingredient.usageQuantity / ingredient.buyingQuantity;
    }
  }

  return ratio * ingredient.buyingPrice;
};

/**
 * Calculates Total Material COGS for a menu item.
 */
export const calculateMenuCOGS = (ingredients: Ingredient[]): number => {
  const total = ingredients.reduce((sum, ing) => sum + calculateIngredientCost(ing), 0);
  return Math.ceil(total);
};

/**
 * Calculates OPEX per unit (cup/porsi).
 * @param monthlyOpexTotal Total monthly operational expenses
 * @param monthlySalesTarget Target number of sales per month
 */
export const calculateOpexPerUnit = (
  monthlyOpexTotal: number,
  monthlySalesTarget: number,
): number => {
  if (monthlySalesTarget <= 0) return 0;
  return Math.ceil(monthlyOpexTotal / monthlySalesTarget);
};

/**
 * Calculates Gross Margin Percentage.
 * Formula: ((Price - COGS) / Price) * 100
 */
export const calculateGrossMargin = (sellingPrice: number, cogs: number): number => {
  if (sellingPrice <= 0) return 0;
  return ((sellingPrice - cogs) / sellingPrice) * 100;
};

/**
 * Calculates Break Even Point (BEP) in quantity (cups/porsi).
 * Formula: Fixed Costs / (Selling Price - Variable Cost per Unit)
 * Variable Cost here is mainly Material COGS.
 */
export const calculateBEPQuantity = (
  monthlyFixedCosts: number, // Total OPEX
  sellingPrice: number,
  variableCostPerUnit: number, // Material COGS
): number => {
  const contributionMargin = sellingPrice - variableCostPerUnit;
  if (contributionMargin <= 0) return Infinity; // Never break even if selling at loss
  return Math.ceil(monthlyFixedCosts / contributionMargin);
};

/**
 * Calculates ROI (Return on Investment) in months.
 * Formula: Total Investment / Monthly Net Profit
 */
export const calculateROI = (
  initialInvestment: number, // Equipment + Setup costs
  monthlyNetProfit: number,
): number => {
  if (monthlyNetProfit <= 0) return Infinity;
  return Math.ceil(initialInvestment / monthlyNetProfit);
};

/**
 * Generates a simple Shopping Plan.
 * Calculates how much of each ingredient to buy for X days of sales.
 */
export const generateShoppingPlan = (
  ingredients: Ingredient[],
  dailySalesTarget: number,
  daysToStock: number = 7,
) => {
  return ingredients.map((ing) => {
    const usagePerCup = ing.usageQuantity;
    const totalUsage = usagePerCup * dailySalesTarget * daysToStock;

    // We need to answer: "How many buying-packs do I need?"
    // 1 buying pack = buyingQuantity [buyingUnit]

    const usageCat = getUnitCategory(ing.usageUnit);
    const buyCat = getUnitCategory(ing.buyingUnit);

    let requiredPacks = 0;

    if (usageCat === buyCat && usageCat !== 'unknown') {
      const catConfig = UNIT_CATEGORIES[usageCat];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const usageBase = totalUsage * (catConfig.conversions as any)[ing.usageUnit];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const packBase = ing.buyingQuantity * (catConfig.conversions as any)[ing.buyingUnit];

      if (packBase > 0) {
        requiredPacks = Math.ceil(usageBase / packBase);
      }
    } else {
      // Simple fallback
      const totalUsageSimple = ing.usageQuantity * dailySalesTarget * daysToStock;
      if (ing.buyingQuantity > 0) {
        requiredPacks = Math.ceil(totalUsageSimple / ing.buyingQuantity);
      }
    }

    return {
      ingredientName: ing.name,
      totalUsage: totalUsage, // validation only
      usageUnit: ing.usageUnit,
      packSize: ing.buyingQuantity,
      packUnit: ing.buyingUnit,
      packsToBuy: requiredPacks,
      estimatedCost: requiredPacks * ing.buyingPrice,
    };
  });
};
