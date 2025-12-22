'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/financialCalculations';

interface MenuPreviewProps {
  menuName?: string;
  recommendedPrice: number;
  cogsPerPortion: number;
  grossProfitPerPortion: number;
}

export function MenuPreview({
  menuName,
  recommendedPrice,
  cogsPerPortion,
  grossProfitPerPortion,
}: MenuPreviewProps) {
  return (
    <Card>
      <CardHeader className='pb-2'>
        <CardTitle className='text-base'>🍽️ Menu Anda</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='bg-muted/50 flex items-center justify-between rounded-lg p-3'>
          <div>
            <p className='font-medium'>{menuName || 'Menu Belum Dinamai'}</p>
            <p className='text-muted-foreground text-xs'>
              Modal: {formatCurrency(cogsPerPortion)} | Untung Kotor:{' '}
              {formatCurrency(grossProfitPerPortion)}
            </p>
          </div>
          <span className='text-lg font-bold'>{formatCurrency(recommendedPrice)}</span>
        </div>
        <p className='text-muted-foreground mt-2 text-center text-xs'>
          💡 Tip: Tambah 2-3 menu lagi untuk variasi & strategi profit.
        </p>
      </CardContent>
    </Card>
  );
}
