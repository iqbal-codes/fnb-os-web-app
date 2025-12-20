'use client';

import { useState } from 'react';
import { CheckCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFormContext, useWatch } from 'react-hook-form';
import type { OnboardingFormValues } from '@/components/onboarding/types';

import {
  FinancialAssumptions,
  DEFAULT_ASSUMPTIONS,
  calculateFinancialMetrics,
  generateEnhancedShoppingPlan,
  validateIngredientData,
  generateRoundedPriceOptions,
  simulatePrice,
} from '@/lib/financialCalculations';
import { calculateMenuCOGS } from '@/lib/businessLogic';
import { calculateMonthlyOpex } from '@/lib/onboarding/calculations';

import { ValidationWarnings } from './ValidationWarnings';
import { KpiCards } from './KpiCards';
import { FinancialAnalysis } from './FinancialAnalysis';
import { MenuPreview } from './MenuPreview';
import { ShoppingPlanCard } from './ShoppingPlanCard';
import { AISuggestionCards } from '../AISuggestionCards';

interface PlanningSummaryProps {
  onComplete: () => void;
  onBack?: () => void;
}

export function PlanningSummary({ onComplete, onBack }: PlanningSummaryProps) {
  // Form context
  const { control, setValue } = useFormContext<OnboardingFormValues>();

  const businessName = useWatch({ control, name: 'businessName' });
  const menuData = useWatch({ control, name: 'menuData' });
  const opexData = useWatch({ control, name: 'opexData' });
  const equipmentData = useWatch({ control, name: 'equipmentData' });
  // State
  const [assumptions, setAssumptions] = useState<FinancialAssumptions>({
    ...DEFAULT_ASSUMPTIONS,
    cupsTargetPerDay: 30, // Default since input removed
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Calculations
  // ─────────────────────────────────────────────────────────────────────────────

  // OPEX total (normalized to monthly)
  const opexMonthly = calculateMonthlyOpex(opexData || []);

  // Equipment total
  const equipmentTotal = (equipmentData || []).reduce(
    (sum, eq) => sum + eq.quantity * eq.estimated_price,
    0,
  );

  // COGS
  const cogsPerPortion = menuData?.estimatedCogs || calculateMenuCOGS(menuData?.ingredients || []);
  const sellingPrice = menuData?.suggestedPrice || cogsPerPortion * 2.5;

  // Calculate all metrics
  const metrics = calculateFinancialMetrics(
    sellingPrice,
    cogsPerPortion,
    opexMonthly,
    equipmentTotal,
    assumptions,
  );

  // Validate data completeness
  const validation = validateIngredientData(menuData?.ingredients || []);

  // Shopping plan
  const shoppingPlan = generateEnhancedShoppingPlan(
    menuData?.ingredients || [],
    assumptions.cupsTargetPerDay,
    7,
  );

  // Rounded price options
  const roundedPrices = generateRoundedPriceOptions(sellingPrice);
  const hasNonRoundedPrice = sellingPrice % 1000 !== 0;

  // ─────────────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────────────

  const handleApplyPrice = (newPrice: number) => {
    setValue('menuData.suggestedPrice', newPrice);
  };

  const handleSimulatePrice = (price: number) => {
    return simulatePrice(
      price,
      sellingPrice,
      cogsPerPortion,
      opexMonthly,
      equipmentTotal,
      assumptions,
    );
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='text-center'>
        <div className='bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
          <CheckCircle className='text-primary h-8 w-8' />
        </div>
        <h2 className='text-xl font-bold'>Selamat, {businessName || 'Pengusaha'}! 🎉</h2>
        <p className='text-muted-foreground'>Berikut ringkasan perencanaan bisnis Anda</p>
      </div>

      {/* Warnings */}
      <ValidationWarnings
        validation={validation}
        isNegativeProfit={metrics.isNegativeProfit}
        netProfitPerPortion={metrics.netProfitPerPortion}
        cogsPerPortion={cogsPerPortion}
        opexPerPortion={metrics.opexPerPortion}
        onBack={onBack}
      />

      {/* KPI Cards */}
      <KpiCards
        cogsPerPortion={cogsPerPortion}
        sellingPrice={sellingPrice}
        netProfitPerPortion={metrics.netProfitPerPortion}
        netMarginPercent={metrics.netMarginPercent}
        grossMarginPercent={metrics.grossMarginPercent}
        isNegativeProfit={metrics.isNegativeProfit}
        roundedPrices={roundedPrices}
        hasNonRoundedPrice={hasNonRoundedPrice}
        onApplyPrice={handleApplyPrice}
      />

      {/* Financial Analysis */}
      <FinancialAnalysis
        metrics={metrics}
        assumptions={assumptions}
        onAssumptionsChange={setAssumptions}
        sellingPrice={sellingPrice}
        cogsPerPortion={cogsPerPortion}
        opexMonthly={opexMonthly}
        equipmentTotal={equipmentTotal}
      />

      {/* Menu Preview */}
      <MenuPreview
        menuName={menuData?.name}
        cogsPerPortion={cogsPerPortion}
        netProfitPerPortion={metrics.netProfitPerPortion}
        sellingPrice={sellingPrice}
      />

      {/* Shopping Plan */}
      <ShoppingPlanCard
        shoppingPlan={shoppingPlan}
        cupsTargetPerDay={assumptions.cupsTargetPerDay}
      />

      {/* AI Suggestions */}
      <AISuggestionCards
        currentPrice={sellingPrice}
        topCostDriver={shoppingPlan.topCostDrivers[0] || null}
        simulatePrice={handleSimulatePrice}
        onApplyPrice={handleApplyPrice}
      />

      {/* CTA Footer */}
      <div className='space-y-3'>
        <Button className='w-full' size='lg' onClick={onComplete}>
          Lanjut ke Dashboard
          <TrendingUp className='ml-2 h-4 w-4' />
        </Button>
        <div className='flex gap-3'>
          {onBack && (
            <Button variant='outline' className='flex-1' onClick={onBack}>
              ← Kembali
            </Button>
          )}
          <Button
            variant='ghost'
            className='flex-1'
            onClick={() => {
              document
                .querySelector('[data-radix-collection-item]')
                ?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Ubah Asumsi & Simulasi
          </Button>
        </div>
      </div>
    </div>
  );
}
