'use client';

import { Lightbulb, TrendingDown, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/financialCalculations';

interface TopCostDriver {
  name: string;
  percentOfTotal: number;
}

interface SystemSuggestionsProps {
  topCostDriver: TopCostDriver | null;
  bepUnitsPerDay: number;
  isBepInfinity: boolean;
  contributionMargin: number;
  fixedCostMonthly: number;
}

export function SystemSuggestions({
  topCostDriver,
  bepUnitsPerDay,
  isBepInfinity,
  contributionMargin,
  fixedCostMonthly,
}: SystemSuggestionsProps) {
  // Generate rule-based suggestions
  const suggestions: Array<{
    icon: React.ReactNode;
    title: string;
    description: string;
    variant: 'info' | 'warning';
  }> = [];

  // Suggestion 1: Top cost driver - always show if available
  if (topCostDriver && topCostDriver.percentOfTotal >= 25) {
    suggestions.push({
      icon: <TrendingDown className='h-5 w-5 text-blue-600' />,
      title: `Biaya terbesar: ${topCostDriver.name} (${topCostDriver.percentOfTotal.toFixed(0)}%)`,
      description:
        'Cari opsi lebih hemat atau negosiasi harga dengan supplier untuk menekan biaya.',
      variant: 'info',
    });
  }

  // Suggestion 2: BEP or margin issues
  if (isBepInfinity || contributionMargin <= 0) {
    suggestions.push({
      icon: <AlertCircle className='h-5 w-5 text-amber-600' />,
      title: 'Margin belum menguntungkan',
      description:
        'Naikkan harga jual, kurangi biaya bahan, atau evaluasi OPEX untuk mencapai titik impas.',
      variant: 'warning',
    });
  } else if (bepUnitsPerDay > 50) {
    suggestions.push({
      icon: <AlertCircle className='h-5 w-5 text-amber-600' />,
      title: `BEP terasa tinggi (${bepUnitsPerDay} porsi/hari)`,
      description: 'Kurangi fixed cost atau tambah menu dengan profit lebih tinggi.',
      variant: 'warning',
    });
  }

  // Suggestion 3: Fixed cost optimization
  if (fixedCostMonthly > 5000000) {
    suggestions.push({
      icon: <Lightbulb className='h-5 w-5 text-blue-600' />,
      title: `Fixed cost cukup tinggi (${formatCurrency(fixedCostMonthly)}/bulan)`,
      description:
        'Pertimbangkan untuk mulai dengan skala lebih kecil atau cari lokasi dengan biaya lebih rendah.',
      variant: 'info',
    });
  }

  // Only show max 2 suggestions
  const displaySuggestions = suggestions.slice(0, 2);

  if (displaySuggestions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='flex items-center gap-2 text-base'>
          <Lightbulb className='h-5 w-5 text-amber-500' />
          Saran
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        {displaySuggestions.map((suggestion, idx) => (
          <div
            key={idx}
            className={`rounded-lg p-3 ${
              suggestion.variant === 'warning'
                ? 'bg-amber-50 dark:bg-amber-950/30'
                : 'bg-blue-50 dark:bg-blue-950/30'
            }`}
          >
            <div className='flex items-start gap-3'>
              <div className='mt-0.5 shrink-0'>{suggestion.icon}</div>
              <div>
                <p className='text-sm font-medium'>{suggestion.title}</p>
                <p className='text-muted-foreground mt-1 text-xs'>{suggestion.description}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
