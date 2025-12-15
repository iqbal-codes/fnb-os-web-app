'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/financialCalculations';

interface MenuPreviewProps {
  menuName?: string;
  cogsPerPortion: number;
  netProfitPerPortion: number;
  sellingPrice: number;
}

export function MenuPreview({
  menuName,
  cogsPerPortion,
  netProfitPerPortion,
  sellingPrice,
}: MenuPreviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>🍽️ Menu Anda</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='bg-muted/50 flex items-center justify-between rounded-lg p-3'>
          <div>
            <p className='font-medium'>{menuName || 'Menu Belum Dinamai'}</p>
            <p className='text-muted-foreground text-xs'>
              COGS: {formatCurrency(cogsPerPortion)} | Profit: {formatCurrency(netProfitPerPortion)}
            </p>
          </div>
          <span className='text-lg font-bold'>{formatCurrency(sellingPrice)}</span>
        </div>
        <p className='text-muted-foreground mt-2 text-center text-xs'>
          💡 Tip: Tambah 2-3 menu lagi untuk variasi. Anda bisa melakukannya di dashboard.
        </p>
      </CardContent>
    </Card>
  );
}
