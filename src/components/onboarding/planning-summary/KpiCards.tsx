'use client';

import { Calculator, TrendingUp, DollarSign, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/financialCalculations';

interface KpiCardsProps {
  cogsPerPortion: number;
  recommendedPrice: number;
  grossProfitPerPortion: number;
  bepUnitsPerDay: number;
  isBepInfinity: boolean;
  pricingModeLabel: string;
}

export function KpiCards({
  cogsPerPortion,
  recommendedPrice,
  grossProfitPerPortion,
  bepUnitsPerDay,
  isBepInfinity,
  pricingModeLabel,
}: KpiCardsProps) {
  return (
    <div className='grid grid-cols-2 gap-3'>
      {/* Modal Bahan per Portion */}
      <Card>
        <CardContent className='p-4 text-center'>
          <Calculator className='text-primary mx-auto mb-2 h-6 w-6' />
          <p className='text-muted-foreground text-xs'>COGS/Porsi</p>
          <p className='text-lg font-bold'>{formatCurrency(cogsPerPortion)}</p>
        </CardContent>
      </Card>

      {/* Recommended Price */}
      <Card className='relative'>
        <CardContent className='p-4 text-center'>
          <TrendingUp className='mx-auto mb-2 h-6 w-6 text-green-600' />
          <p className='text-muted-foreground text-xs'>Harga Jual Rekomendasi</p>
          <p className='text-lg font-bold'>{formatCurrency(recommendedPrice)}</p>
          <Badge variant='secondary' className='mt-1 text-xs'>
            {pricingModeLabel}
          </Badge>
        </CardContent>
      </Card>

      {/* Gross Profit per Portion */}
      <Card>
        <CardContent className='p-4 text-center'>
          <DollarSign className='mx-auto mb-2 h-6 w-6 text-green-600' />
          <p className='text-muted-foreground text-xs'>Untung Kotor/Porsi</p>
          <p className='text-lg font-bold'>{formatCurrency(grossProfitPerPortion)}</p>
          <p className='text-muted-foreground mt-1 text-xs'>sebelum biaya operasional</p>
        </CardContent>
      </Card>

      {/* BEP Minimum */}
      <Card>
        <CardContent className='p-4 text-center'>
          <Target className='mx-auto mb-2 h-6 w-6 text-amber-600' />
          <p className='text-muted-foreground text-xs'>BEP Minimum</p>
          <p className={`text-lg font-bold ${isBepInfinity ? 'text-red-600' : ''}`}>
            {isBepInfinity ? 'Tidak tercapai' : `${bepUnitsPerDay} porsi/hari`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
