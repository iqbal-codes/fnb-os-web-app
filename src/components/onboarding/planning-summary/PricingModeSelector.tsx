'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PRICING_MODES, PricingMode, formatCurrency } from '@/lib/financialCalculations';

interface PricingModeSelectorProps {
  selectedMode: PricingMode;
  onModeChange: (mode: PricingMode) => void;
  cogsPerPortion: number;
  fixedCostMonthly: number;
  targetSafePerDay: number;
  operatingDaysPerMonth: number;
}

const PRICING_MODE_OPTIONS: Array<{
  value: PricingMode;
  label: string;
  description: string;
  badgeVariant: 'secondary' | 'default' | 'outline';
}> = [
  {
    value: 'tipis',
    label: 'Tipis',
    description: 'Harga kompetitif, margin rendah',
    badgeVariant: 'secondary',
  },
  {
    value: 'sehat',
    label: 'Normal',
    description: 'Keseimbangan harga & profit',
    badgeVariant: 'default',
  },
  {
    value: 'premium',
    label: 'Premium',
    description: 'Margin tinggi, harga premium',
    badgeVariant: 'outline',
  },
];

export function PricingModeSelector({
  selectedMode,
  onModeChange,
  cogsPerPortion,
  fixedCostMonthly,
  targetSafePerDay,
  operatingDaysPerMonth,
}: PricingModeSelectorProps) {
  // Calculate fixed cost per portion based on Target Aman volume
  const monthlySales = targetSafePerDay * operatingDaysPerMonth;
  const fixedCostPerPortion = monthlySales > 0 ? fixedCostMonthly / monthlySales : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>💰 Pilih Mode Harga</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col gap-2'>
          {PRICING_MODE_OPTIONS.map((option) => {
            const gmPercent = PRICING_MODES[option.value].gmPercent;
            const estimatedPrice = Math.round(cogsPerPortion / (1 - gmPercent / 100) / 500) * 500;
            const grossProfit = estimatedPrice - cogsPerPortion;
            // Net profit = Gross profit - Fixed cost allocation per portion
            const netProfit = grossProfit - fixedCostPerPortion;
            const isSelected = selectedMode === option.value;
            console.log({ netProfit });
            return (
              <button
                key={option.value}
                type='button'
                onClick={() => onModeChange(option.value)}
                className={`rounded-lg border p-3 text-left transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/10 ring-primary/50 ring-2'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>{option.label}</span>
                  <Badge variant={isSelected ? 'default' : 'secondary'} className='text-xs'>
                    Margin {gmPercent}%
                  </Badge>
                </div>
                <p className='text-muted-foreground mt-1 text-xs'>{option.description}</p>
                <div className='mt-2 flex items-center justify-between'>
                  <div>
                    <p className='text-muted-foreground text-xs'>Harga Jual</p>
                    <p className='text-primary text-sm font-bold'>
                      {formatCurrency(estimatedPrice)}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <p className='text-muted-foreground mt-3 text-center text-xs'>
          Untung bersih = Harga - COGS - (Biaya tetap ÷ Target Aman)
        </p>
      </CardContent>
    </Card>
  );
}
