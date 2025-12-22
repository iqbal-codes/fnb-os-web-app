import { z } from 'zod';
import { businessTypeValues } from './constants';

// ─────────────────────────────────────────────────────────────────────────────
// Ingredient Schema
// ─────────────────────────────────────────────────────────────────────────────

export const ingredientSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nama bahan wajib diisi'),
  usageQuantity: z.number().min(0),
  usageUnit: z.string(),
  buyingQuantity: z.number().optional(),
  buyingUnit: z.string().optional(),
  buyingPrice: z.number().optional(),
  isDifferentUnit: z.boolean(),
  isAiSuggested: z.boolean(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Menu Schema
// ─────────────────────────────────────────────────────────────────────────────

export const menuSchema = z.object({
  name: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  ingredients: z.array(ingredientSchema).default([]),
  estimatedCogs: z.number().optional(),
  suggestedPrice: z.number().optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// OPEX Schema
// ─────────────────────────────────────────────────────────────────────────────

export const opexItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nama OPEX wajib diisi'),
  amount: z.number().min(0),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
});

// ─────────────────────────────────────────────────────────────────────────────
// Equipment Schema
// ─────────────────────────────────────────────────────────────────────────────

export const equipmentItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Nama peralatan wajib diisi'),
  life_span_years: z.number().min(1, 'Minimal 1 tahun'),
  estimated_price: z.number().min(0),
  priority: z.enum(['essential', 'recommended', 'optional']),
  isAiSuggested: z.boolean(),
  isSelected: z.boolean(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Business Idea Schema
// ─────────────────────────────────────────────────────────────────────────────

export const businessIdeaSchema = z.object({
  businessName: z
    .string()
    .max(60, 'Maksimal 60 karakter')
    .transform((val) => val.trim())
    .optional(),
  businessType: z.enum(businessTypeValues as unknown as [string, ...string[]]),
  city: z.string().optional(),
  operatingModel: z.string().optional(),
  operatingModelSecondary: z.string().optional(),
  openDays: z.array(z.number().min(1).max(7)).default([1, 2, 3, 4, 5, 6, 7]),
});

// ─────────────────────────────────────────────────────────────────────────────
// Bulk Menu Schema (Path B)
// ─────────────────────────────────────────────────────────────────────────────

export const bulkMenuItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  sellingPrice: z.number(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Main Onboarding Form Schema
// ─────────────────────────────────────────────────────────────────────────────

export const onboardingSchema = businessIdeaSchema.extend({
  opexData: z.array(opexItemSchema).default([]),
  equipmentData: z.array(equipmentItemSchema).default([]),
  menuData: menuSchema.default({ ingredients: [] }),
  bulkMenus: z.array(bulkMenuItemSchema).default([]),
});

export type OnboardingSchemaType = z.infer<typeof onboardingSchema>;
