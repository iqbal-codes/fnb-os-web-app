// Unit Conversion System
// Handles conversions between different units for accurate COGS calculation

// ============ Unit Types ============

export type WeightUnit = "mg" | "g" | "gram" | "kg";
export type VolumeUnit = "ml" | "l" | "liter";
export type CountUnit =
  | "pcs"
  | "pack"
  | "piece"
  | "buah"
  | "biji"
  | "sachet"
  | "butir";
export type Unit = WeightUnit | VolumeUnit | CountUnit | string;

// Base units for each category
export const BASE_UNITS = {
  weight: "mg",
  volume: "ml",
  count: "pcs",
} as const;

// ============ Conversion Factors (to base unit) ============

const WEIGHT_TO_MG: Record<string, number> = {
  mg: 1,
  g: 1000,
  gram: 1000,
  kg: 1000000,
  ons: 100000, // 100g = 100,000mg
};

const VOLUME_TO_ML: Record<string, number> = {
  ml: 1,
  l: 1000,
  liter: 1000,
  tsp: 5, // teaspoon = 5ml
  tbsp: 15, // tablespoon = 15ml
  cup: 240, // 1 cup = 240ml
  shot: 30, // 1 shot = 30ml
};

const COUNT_TO_PCS: Record<string, number> = {
  pcs: 1,
  pack: 1,
  piece: 1,
  buah: 1,
  biji: 1,
  sachet: 1,
  butir: 1,
  lembar: 1,
  slice: 1,
  siung: 1,
  batang: 1,
  ikat: 1,
};

// ============ Helper Functions ============

/**
 * Determine the unit category
 */
export function getUnitCategory(
  unit: string
): "weight" | "volume" | "count" | "unknown" {
  const normalized = unit.toLowerCase();
  if (WEIGHT_TO_MG[normalized]) return "weight";
  if (VOLUME_TO_ML[normalized]) return "volume";
  if (COUNT_TO_PCS[normalized]) return "count";
  return "unknown";
}

/**
 * Get conversion factor to base unit
 */
export function getConversionFactor(unit: string): number {
  const normalized = unit.toLowerCase();
  return (
    WEIGHT_TO_MG[normalized] ||
    VOLUME_TO_ML[normalized] ||
    COUNT_TO_PCS[normalized] ||
    1
  );
}

/**
 * Get the base unit for a given unit
 */
export function getBaseUnit(unit: string): string {
  const category = getUnitCategory(unit);
  switch (category) {
    case "weight":
      return "mg";
    case "volume":
      return "ml";
    case "count":
      return "pcs";
    default:
      return unit;
  }
}

/**
 * Convert value to base unit (mg, ml, or pcs)
 */
export function toBaseUnit(value: number, unit: string): number {
  const factor = getConversionFactor(unit);
  return value * factor;
}

/**
 * Convert from base unit to display unit
 */
export function fromBaseUnit(baseValue: number, targetUnit: string): number {
  const factor = getConversionFactor(targetUnit);
  return baseValue / factor;
}

/**
 * Convert between any two compatible units
 */
export function convertUnit(
  value: number,
  fromUnit: string,
  toUnit: string
): number {
  const fromCategory = getUnitCategory(fromUnit);
  const toCategory = getUnitCategory(toUnit);

  // If same category, convert via base unit
  if (fromCategory === toCategory && fromCategory !== "unknown") {
    const baseValue = toBaseUnit(value, fromUnit);
    return fromBaseUnit(baseValue, toUnit);
  }

  // If units are the same (case insensitive)
  if (fromUnit.toLowerCase() === toUnit.toLowerCase()) {
    return value;
  }

  // Can't convert between different categories
  console.warn(`Cannot convert between ${fromUnit} and ${toUnit}`);
  return value;
}

/**
 * Calculate ingredient cost with proper unit conversion
 *
 * Example:
 * - Ingredient: 1kg coffee @ Rp 150,000
 * - Recipe: 15g
 * - Cost = 15g / 1kg × Rp 150,000 = 15/1000 × 150,000 = Rp 2,250
 */
export function calculateIngredientCostWithConversion(
  recipeQuantity: number,
  recipeUnit: string,
  marketPrice: number,
  marketQuantity: number,
  marketUnit: string
): number {
  // Convert both to same base unit
  const recipeInBase = toBaseUnit(recipeQuantity, recipeUnit);
  const marketInBase = toBaseUnit(marketQuantity, marketUnit);

  // Calculate cost: (recipe amount / market amount) × price
  if (marketInBase === 0) return 0;

  const cost = (recipeInBase / marketInBase) * marketPrice;

  // Round to 2 decimal places
  return Math.round(cost * 100) / 100;
}

/**
 * Get display-friendly unit options for a category
 */
export function getUnitOptions(
  category: "weight" | "volume" | "count" | "all" = "all"
): { value: string; label: string }[] {
  const weightOptions = [
    { value: "mg", label: "Miligram (mg)" },
    { value: "g", label: "Gram (g)" },
    { value: "kg", label: "Kilogram (kg)" },
    { value: "ons", label: "Ons (100g)" },
  ];

  const volumeOptions = [
    { value: "ml", label: "Mililiter (ml)" },
    { value: "l", label: "Liter (l)" },
    { value: "tsp", label: "Sendok Teh (tsp)" },
    { value: "tbsp", label: "Sendok Makan (tbsp)" },
    { value: "cup", label: "Cup" },
    { value: "shot", label: "Shot (30ml)" },
  ];

  const countOptions = [
    { value: "pcs", label: "Pieces (pcs)" },
    { value: "pack", label: "Pack" },
    { value: "sachet", label: "Sachet" },
    { value: "butir", label: "Butir" },
    { value: "lembar", label: "Lembar" },
    { value: "slice", label: "Slice/Iris" },
    { value: "buah", label: "Buah" },
    { value: "biji", label: "Biji" },
    { value: "siung", label: "Siung" },
    { value: "batang", label: "Batang" },
    { value: "ikat", label: "Ikat" },
  ];

  switch (category) {
    case "weight":
      return weightOptions;
    case "volume":
      return volumeOptions;
    case "count":
      return countOptions;
    default:
      return [...weightOptions, ...volumeOptions, ...countOptions];
  }
}

/**
 * Format quantity with appropriate unit
 */
export function formatQuantityWithUnit(quantity: number, unit: string): string {
  const normalized = unit.toLowerCase();

  // Auto-convert to more readable unit if value is very large/small
  if (getUnitCategory(normalized) === "weight") {
    if (normalized === "mg" && quantity >= 1000000) {
      return `${(quantity / 1000000).toFixed(2)} kg`;
    }
    if (normalized === "mg" && quantity >= 1000) {
      return `${(quantity / 1000).toFixed(1)} g`;
    }
    if (normalized === "g" && quantity >= 1000) {
      return `${(quantity / 1000).toFixed(2)} kg`;
    }
  }

  if (getUnitCategory(normalized) === "volume") {
    if (normalized === "ml" && quantity >= 1000) {
      return `${(quantity / 1000).toFixed(2)} l`;
    }
  }

  return `${quantity} ${unit}`;
}

