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
  quantity: z.number().min(1, 'Minimal 1'),
  estimated_price: z.number().min(0),
  priority: z.enum(['essential', 'recommended', 'optional']),
  isAiSuggested: z.boolean(),
  isSelected: z.boolean(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Business Idea Schema
// ─────────────────────────────────────────────────────────────────────────────

export const businessIdeaSchema = z.object({
  businessName: z.string().optional(),
  businessType: z.enum(businessTypeValues).optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  operatingModel: z.string().optional(),
  teamSize: z.string().optional(),
  targetDailySales: z.number().min(1).max(500).optional(),
  targetMargin: z.number().min(10).max(80).optional(),
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
