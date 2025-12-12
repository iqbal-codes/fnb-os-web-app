// COGS (Cost of Goods Sold) Calculation Engine
// This module handles all cost calculations for menu items

import { calculateIngredientCostWithConversion } from "@/lib/utils/units";

export interface IngredientCost {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  pricePerMarketUnit: number;
  marketQty: number;
  marketUnit: string;
  calculatedCost: number;
}

export interface RecipeCOGS {
  menuId: string;
  menuName: string;
  sellingPrice: number;
  ingredients: IngredientCost[];
  totalIngredientCost: number;
  opexPerItem: number;
  totalCOGS: number;
  grossProfit: number;
  grossMarginPercent: number;
  netMarginPercent: number;
}

export interface OPEXAllocation {
  totalMonthlyOPEX: number;
  estimatedMonthlySales: number;
  opexPerItem: number;
}

/**
 * Calculate the cost of a single ingredient in a recipe
 * Uses proper unit conversion (e.g., 15g from 1kg @ Rp150,000 = Rp2,250)
 */
export function calculateIngredientCost(
  quantity: number,
  recipeUnit: string,
  pricePerMarketUnit: number,
  marketQty: number,
  marketUnit: string
): number {
  return calculateIngredientCostWithConversion(
    quantity,
    recipeUnit,
    pricePerMarketUnit,
    marketQty,
    marketUnit
  );
}

/**
 * Calculate total COGS for a recipe
 */
export function calculateRecipeCOGS(
  ingredients: {
    quantity: number;
    unit: string;
    ingredient: {
      id: string;
      name: string;
      price_per_market_unit: number;
      market_qty: number;
      market_unit: string;
    };
  }[]
): { costs: IngredientCost[]; total: number } {
  const costs: IngredientCost[] = ingredients.map((item) => {
    const calculatedCost = calculateIngredientCost(
      item.quantity,
      item.unit,
      item.ingredient.price_per_market_unit,
      item.ingredient.market_qty,
      item.ingredient.market_unit
    );

    return {
      ingredientId: item.ingredient.id,
      ingredientName: item.ingredient.name,
      quantity: item.quantity,
      unit: item.unit,
      pricePerMarketUnit: item.ingredient.price_per_market_unit,
      marketQty: item.ingredient.market_qty,
      marketUnit: item.ingredient.market_unit,
      calculatedCost,
    };
  });

  const total = costs.reduce((sum, cost) => sum + cost.calculatedCost, 0);

  return { costs, total: Math.round(total * 100) / 100 };
}

/**
 * Calculate OPEX allocation per item
 */
export function calculateOPEXPerItem(
  totalMonthlyOPEX: number,
  estimatedMonthlySales: number
): OPEXAllocation {
  const opexPerItem =
    estimatedMonthlySales > 0 ? totalMonthlyOPEX / estimatedMonthlySales : 0;

  return {
    totalMonthlyOPEX,
    estimatedMonthlySales,
    opexPerItem: Math.round(opexPerItem * 100) / 100,
  };
}

/**
 * Calculate complete pricing metrics for a menu item
 */
export function calculateMenuPricing(
  sellingPrice: number,
  ingredientCOGS: number,
  opexPerItem: number = 0
): {
  totalCOGS: number;
  grossProfit: number;
  netProfit: number;
  grossMarginPercent: number;
  netMarginPercent: number;
  isHealthy: boolean;
  recommendation: string;
} {
  const totalCOGS = ingredientCOGS + opexPerItem;
  const grossProfit = sellingPrice - ingredientCOGS;
  const netProfit = sellingPrice - totalCOGS;

  const grossMarginPercent =
    sellingPrice > 0 ? (grossProfit / sellingPrice) * 100 : 0;
  const netMarginPercent =
    sellingPrice > 0 ? (netProfit / sellingPrice) * 100 : 0;

  // F&B typically needs 60-70% gross margin, 20-30% net margin
  const isHealthy = grossMarginPercent >= 60 && netMarginPercent >= 20;

  let recommendation = "";
  if (grossMarginPercent < 50) {
    recommendation =
      "Margin terlalu rendah. Pertimbangkan menaikkan harga atau menurunkan biaya bahan.";
  } else if (grossMarginPercent < 60) {
    recommendation = "Margin cukup tapi bisa ditingkatkan. Review biaya bahan.";
  } else if (grossMarginPercent >= 70) {
    recommendation = "Margin sehat! Item ini sangat profitable.";
  } else {
    recommendation = "Margin baik. Pertahankan kualitas dan konsistensi.";
  }

  return {
    totalCOGS: Math.round(totalCOGS),
    grossProfit: Math.round(grossProfit),
    netProfit: Math.round(netProfit),
    grossMarginPercent: Math.round(grossMarginPercent * 10) / 10,
    netMarginPercent: Math.round(netMarginPercent * 10) / 10,
    isHealthy,
    recommendation,
  };
}

/**
 * Suggest a selling price based on target margin
 */
export function suggestSellingPrice(
  ingredientCOGS: number,
  opexPerItem: number = 0,
  targetMarginPercent: number = 30 // Default 30% net margin
): {
  suggested: number;
  minimum: number;
  premium: number;
} {
  const totalCOGS = ingredientCOGS + opexPerItem;

  // Minimum price (break-even + 10% margin)
  const minimum = Math.ceil(totalCOGS / (1 - 0.1) / 1000) * 1000;

  // Suggested price (target margin)
  const suggested =
    Math.ceil(totalCOGS / (1 - targetMarginPercent / 100) / 1000) * 1000;

  // Premium price (40% margin)
  const premium = Math.ceil(totalCOGS / (1 - 0.4) / 1000) * 1000;

  return { suggested, minimum, premium };
}

/**
 * Score a menu item based on its profitability
 */
export function scoreMenuProfitability(grossMarginPercent: number): {
  score: "A" | "B" | "C" | "D" | "F";
  label: string;
  color: string;
} {
  if (grossMarginPercent >= 70) {
    return { score: "A", label: "Star Performer", color: "green" };
  } else if (grossMarginPercent >= 60) {
    return { score: "B", label: "Profitable", color: "green" };
  } else if (grossMarginPercent >= 50) {
    return { score: "C", label: "Average", color: "yellow" };
  } else if (grossMarginPercent >= 40) {
    return { score: "D", label: "Below Target", color: "orange" };
  } else {
    return { score: "F", label: "Loss Maker", color: "red" };
  }
}

