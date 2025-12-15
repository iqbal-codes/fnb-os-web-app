'use client';

import { Calculator, TrendingUp, Target, DollarSign, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatPercent } from '@/lib/financialCalculations';

interface KpiCardsProps {
  cogsPerPortion: number;
  sellingPrice: number;
  netProfitPerPortion: number;
  netMarginPercent: number;
  grossMarginPercent: number;
  isNegativeProfit: boolean;
  roundedPrices: number[];
  hasNonRoundedPrice: boolean;
  onApplyPrice: (price: number) => void;
}

export function KpiCards({
  cogsPerPortion,
  sellingPrice,
  netProfitPerPortion,
  netMarginPercent,
  grossMarginPercent,
  isNegativeProfit,
  roundedPrices,
  hasNonRoundedPrice,
  onApplyPrice,
}: KpiCardsProps) {
  return (
    <div className='grid grid-cols-2 gap-3'>
      {/* COGS per Portion */}
      <Card>
        <CardContent className='p-4 text-center'>
          <Calculator className='text-primary mx-auto mb-2 h-6 w-6' />
          <p className='text-muted-foreground text-xs'>COGS/HPP per Porsi</p>
          <p className='text-lg font-bold'>{formatCurrency(cogsPerPortion)}</p>
        </CardContent>
      </Card>

      {/* Selling Price */}
      <Card className='relative'>
        <CardContent className='p-4 text-center'>
          <TrendingUp className='mx-auto mb-2 h-6 w-6 text-green-600' />
          <p className='text-muted-foreground text-xs'>Harga Jual</p>
          <p className='text-lg font-bold'>{formatCurrency(sellingPrice)}</p>
          {hasNonRoundedPrice && (
            <div className='mt-2'>
              <Badge variant='secondary' className='text-xs'>
                <Sparkles className='mr-1 h-3 w-3' />
                Rp {(roundedPrices[1] / 1000).toFixed(0)}k?
              </Badge>
              <Button
                variant='ghost'
                size='sm'
                className='text-primary ml-1 h-6 px-2 text-xs'
                onClick={() => onApplyPrice(roundedPrices[1])}
              >
                Terapkan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Net Profit per Portion */}
      <Card>
        <CardContent className='p-4 text-center'>
          <DollarSign
            className={`mx-auto mb-2 h-6 w-6 ${isNegativeProfit ? 'text-red-600' : 'text-green-600'}`}
          />
          <p className='text-muted-foreground text-xs'>Profit Bersih/Porsi</p>
          <p className={`text-lg font-bold ${isNegativeProfit ? 'text-red-600' : ''}`}>
            {formatCurrency(netProfitPerPortion)}
          </p>
          {isNegativeProfit && (
            <Badge variant='destructive' className='mt-1 text-xs'>
              RUGI!
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Net Margin */}
      <Card>
        <CardContent className='p-4 text-center'>
          <Target className='mx-auto mb-2 h-6 w-6 text-amber-600' />
          <p className='text-muted-foreground text-xs'>Net Margin</p>
          <p className={`text-lg font-bold ${netMarginPercent < 0 ? 'text-red-600' : ''}`}>
            {formatPercent(netMarginPercent)}
          </p>
          <p className='text-muted-foreground text-xs'>(GM: {formatPercent(grossMarginPercent)})</p>
        </CardContent>
      </Card>
    </div>
  );
}
