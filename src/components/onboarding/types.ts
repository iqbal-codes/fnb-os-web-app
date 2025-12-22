import { businessTypeValues } from './constants';

// ─────────────────────────────────────────────────────────────────────────────
// Business Types
// ─────────────────────────────────────────────────────────────────────────────

export type BusinessType = (typeof businessTypeValues)[number];

export type OnboardingMode = 'selection' | 'new' | 'existing';

export type OpexFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type EquipmentPriority = 'essential' | 'recommended' | 'optional';

// ─────────────────────────────────────────────────────────────────────────────
// Data Structures
// ─────────────────────────────────────────────────────────────────────────────

export interface OpexItem {
  id: string;
  name: string;
  amount: number;
  frequency: OpexFrequency;
}

export interface EquipmentItem {
  id: string;
  name: string;
  life_span_years: number;
  estimated_price: number;
  priority: EquipmentPriority;
  isAiSuggested: boolean;
  isSelected: boolean;
}

export interface Ingredient {
  id: string;
  name: string;
  usageQuantity: number;
  usageUnit: string;
  buyingQuantity?: number;
  buyingUnit?: string;
  buyingPrice?: number;
  category: 'ingredient' | 'packaging';
  isDifferentUnit: boolean;
  isAiSuggested: boolean;
}

export interface MenuData {
  name?: string;
  category?: string;
  description?: string;
  ingredients: Ingredient[];
  estimatedCogs?: number;
  suggestedPrice?: number;
}

export interface BulkMenuItem {
  id: string;
  name: string;
  sellingPrice: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Form Values
// ─────────────────────────────────────────────────────────────────────────────

export interface OnboardingFormValues {
  // Business Idea
  businessName?: string;
  businessType?: BusinessType;
  city?: string;
  operatingModel?: string; // Primary
  operatingModelSecondary?: string; // Secondary (Optional)
  openDays?: number[]; // [1..7]
  // Step Data
  opexData: OpexItem[];
  equipmentData: EquipmentItem[];
  menuData: MenuData;
  // Path B
  bulkMenus: BulkMenuItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Component Props
// ─────────────────────────────────────────────────────────────────────────────

export interface StepNavigationProps {
  onBack?: () => void;
  onNext: () => void;
}

export interface CompletionStepProps {
  onBack?: () => void;
  onComplete: () => void;
}
