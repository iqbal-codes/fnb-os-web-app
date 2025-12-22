'use client';

import { useState } from 'react';
import { CheckCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFormContext, useWatch } from 'react-hook-form';
import type { OnboardingFormValues } from '@/components/onboarding/types';

import {
  calculateCapexDepreciationMonthly,
  calculateFixedCostMonthly,
  calculateOperatingDaysPerMonth,
  calculatePriceFromCOGS,
  calculateContributionMargin,
  calculateBEP,
  calculateTargetSafe,
  calculatePaybackFromTargetSafe,
  generateEnhancedShoppingPlan,
  validateIngredientData,
  PRICING_MODES,
  DEFAULT_PRICING_MODE,
  PricingMode,
} from '@/lib/financialCalculations';
import { calculateMenuCOGS } from '@/lib/businessLogic';
import { calculateMonthlyOpex } from '@/lib/onboarding/calculations';

import { ValidationWarnings } from './ValidationWarnings';
import { KpiCards } from './KpiCards';
import { FinancialAnalysis } from './FinancialAnalysis';
import { MenuPreview } from './MenuPreview';
import { ShoppingPlanCard } from './ShoppingPlanCard';
import { PricingModeSelector } from './PricingModeSelector';

interface PlanningSummaryProps {
  onComplete: () => void;
  onBack?: () => void;
}

export function PlanningSummary({ onComplete, onBack }: PlanningSummaryProps) {
  // Form context
  const { control } = useFormContext<OnboardingFormValues>();

  const businessName = useWatch({ control, name: 'businessName' });
  const menuData = useWatch({ control, name: 'menuData' });
  const opexData = useWatch({ control, name: 'opexData' });
  const equipmentData = useWatch({ control, name: 'equipmentData' });
  const openDays = useWatch({ control, name: 'openDays' }) || [1, 2, 3, 4, 5, 6, 7];

  // Pricing mode state (user-selectable)
  const [pricingMode, setPricingMode] = useState<PricingMode>(DEFAULT_PRICING_MODE);

  // ─────────────────────────────────────────────────────────────────────────────
  // System-Driven Calculations (Read-only)
  // ─────────────────────────────────────────────────────────────────────────────

  // 1. COGS from menu ingredients
  const cogsPerPortion = menuData?.estimatedCogs || calculateMenuCOGS(menuData?.ingredients || []);

  // 2. Recommended price derived from COGS and selected pricing mode
  const recommendedPrice = calculatePriceFromCOGS(cogsPerPortion, pricingMode);

  // 3. Gross profit per portion (before operational costs)
  const grossProfitPerPortion = recommendedPrice - cogsPerPortion;

  // 4. OPEX monthly total
  const opexMonthly = calculateMonthlyOpex(opexData || []);

  // 5. CAPEX depreciation monthly
  const capexDepreciationMonthly = calculateCapexDepreciationMonthly(equipmentData || []);

  // 6. Fixed cost monthly (OPEX + depreciation)
  const fixedCostMonthly = calculateFixedCostMonthly(opexMonthly, capexDepreciationMonthly);

  // 7. Operating days per month
  const openDaysCount = openDays.length;
  const operatingDaysPerMonth = calculateOperatingDaysPerMonth(openDaysCount);

  // 8. Contribution margin (no channel fee by default)
  const channelFeePercent = 0; // Default in onboarding
  const channelFeePerUnit = recommendedPrice * (channelFeePercent / 100);
  const contributionMargin = calculateContributionMargin(
    recommendedPrice,
    cogsPerPortion,
    channelFeePerUnit,
  );

  // 9. BEP calculation
  const bepResult = calculateBEP(fixedCostMonthly, contributionMargin, operatingDaysPerMonth);

  // 10. Target Aman (BEP + 20% buffer)
  const targetSafePerDay = calculateTargetSafe(bepResult.bepUnitsDay);
  // const targetSafePerMonth = targetSafePerDay * operatingDaysPerMonth;

  // 11. CAPEX total
  const capexTotal = (equipmentData || [])
    .filter((eq) => eq.isSelected)
    .reduce((sum, eq) => sum + eq.estimated_price, 0);

  // 12. Payback/ROI based on Target Aman
  const paybackResult = calculatePaybackFromTargetSafe(
    targetSafePerDay,
    operatingDaysPerMonth,
    contributionMargin,
    fixedCostMonthly,
    capexTotal,
  );

  // 13. Validate data completeness
  const validation = validateIngredientData(menuData?.ingredients || []);

  // 14. Shopping plan based on Target Aman
  const shoppingPlan = generateEnhancedShoppingPlan(
    menuData?.ingredients || [],
    targetSafePerDay,
    7,
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Computed Display Values
  // ─────────────────────────────────────────────────────────────────────────────

  const pricingModeLabel = PRICING_MODES[pricingMode].label;
  const wastePercent = 0; // Default in onboarding

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='text-center'>
        <div className='bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
          <CheckCircle className='text-primary h-8 w-8' />
        </div>
        <h2 className='text-xl font-bold'>Selamat, {businessName || 'Pengusaha'}! 🎉</h2>
        <p className='text-muted-foreground'>Berikut ringkasan perencanaan bisnis Anda.</p>
      </div>

      {/* Validation Warnings */}
      <ValidationWarnings
        validation={validation}
        isNegativeProfit={contributionMargin <= 0}
        cogsPerPortion={cogsPerPortion}
        onBack={onBack}
      />

      {/* KPI Cards (4 cards) */}
      <KpiCards
        cogsPerPortion={cogsPerPortion}
        recommendedPrice={recommendedPrice}
        grossProfitPerPortion={grossProfitPerPortion}
        bepUnitsPerDay={bepResult.bepUnitsDay}
        isBepInfinity={bepResult.isBepInfinity}
        pricingModeLabel={pricingModeLabel}
      />

      {/* Pricing Mode Selector */}
      <PricingModeSelector
        selectedMode={pricingMode}
        onModeChange={setPricingMode}
        cogsPerPortion={cogsPerPortion}
        fixedCostMonthly={fixedCostMonthly}
        targetSafePerDay={targetSafePerDay}
        operatingDaysPerMonth={operatingDaysPerMonth}
      />

      {/* Financial Analysis */}
      <FinancialAnalysis
        bepUnitsPerDay={bepResult.bepUnitsDay}
        bepUnitsPerMonth={bepResult.bepUnitsMonth}
        isBepInfinity={bepResult.isBepInfinity}
        fixedCostMonthly={fixedCostMonthly}
        opexMonthly={opexMonthly}
        capexDepreciationMonthly={capexDepreciationMonthly}
        contributionMargin={contributionMargin}
        targetSafePerDay={targetSafePerDay}
        paybackMonths={paybackResult.paybackMonths}
        isPaybackInfinity={paybackResult.isPaybackInfinity}
        estimatedProfitMonth={paybackResult.estimatedProfitMonth}
        capexTotal={capexTotal}
        openDaysCount={openDaysCount}
        operatingDaysPerMonth={operatingDaysPerMonth}
        pricingModeLabel={pricingModeLabel}
        channelFeePercent={channelFeePercent}
        wastePercent={wastePercent}
      />

      {/* Menu Preview */}
      <MenuPreview
        menuName={menuData?.name}
        recommendedPrice={recommendedPrice}
        cogsPerPortion={cogsPerPortion}
        grossProfitPerPortion={grossProfitPerPortion}
      />

      {/* Shopping Plan */}
      <ShoppingPlanCard shoppingPlan={shoppingPlan} targetSafePerDay={targetSafePerDay} />

      {/* System Suggestions (Rule-based, not AI) */}
      {/* <SystemSuggestions
        topCostDriver={shoppingPlan.topCostDrivers[0] || null}
        bepUnitsPerDay={bepResult.bepUnitsDay}
        isBepInfinity={bepResult.isBepInfinity}
        contributionMargin={contributionMargin}
        fixedCostMonthly={fixedCostMonthly}
      /> */}

      {/* CTA Footer */}
      <div className='space-y-3'>
        <Button className='w-full' size='lg' onClick={onComplete}>
          Lanjut ke Dashboard
          <TrendingUp className='ml-2 h-4 w-4' />
        </Button>
        {onBack && (
          <Button variant='outline' className='w-full' onClick={onBack}>
            ← Kembali
          </Button>
        )}
      </div>
    </div>
  );
}
