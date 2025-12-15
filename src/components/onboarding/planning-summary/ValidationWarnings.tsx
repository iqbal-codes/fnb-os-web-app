'use client';

import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/financialCalculations';

interface ValidationWarningsProps {
  validation: {
    isComplete: boolean;
    warnings: string[];
    missingPriceIngredients: string[];
  };
  isNegativeProfit: boolean;
  netProfitPerPortion: number;
  cogsPerPortion: number;
  opexPerPortion: number;
  onBack?: () => void;
}

export function ValidationWarnings({
  validation,
  isNegativeProfit,
  netProfitPerPortion,
  cogsPerPortion,
  opexPerPortion,
  onBack,
}: ValidationWarningsProps) {
  return (
    <>
      {/* Data Completeness Warning */}
      {!validation.isComplete && (
        <Card className='border-amber-200 bg-amber-50'>
          <CardContent className='flex items-start gap-3 p-4'>
            <AlertTriangle className='mt-0.5 h-5 w-5 shrink-0 text-amber-600' />
            <div>
              <p className='text-sm font-medium text-amber-800'>Data Belum Lengkap</p>
              <p className='text-xs text-amber-700'>
                {validation.warnings.join('. ')}. Perhitungan mungkin tidak akurat.
              </p>
              {validation.missingPriceIngredients.length > 0 && (
                <p className='mt-1 text-xs text-amber-600'>
                  Bahan tanpa harga: {validation.missingPriceIngredients.slice(0, 3).join(', ')}
                  {validation.missingPriceIngredients.length > 3 &&
                    ` (+${validation.missingPriceIngredients.length - 3} lainnya)`}
                </p>
              )}
              <Button
                variant='link'
                size='sm'
                className='mt-2 h-auto p-0 text-amber-700'
                onClick={onBack}
              >
                ← Lengkapi Data Bahan
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Negative Profit Warning */}
      {isNegativeProfit && (
        <Card className='border-red-200 bg-red-50'>
          <CardContent className='flex items-start gap-3 p-4'>
            <AlertTriangle className='mt-0.5 h-5 w-5 shrink-0 text-red-600' />
            <div>
              <p className='text-sm font-medium text-red-800'>⚠️ Peringatan: Profit Negatif</p>
              <p className='text-xs text-red-700'>
                Dengan harga dan biaya saat ini, Anda{' '}
                <strong>rugi {formatCurrency(Math.abs(netProfitPerPortion))}</strong> per porsi.
              </p>
              <ul className='mt-2 list-disc pl-4 text-xs text-red-600'>
                <li>
                  Naikkan harga jual minimal ke{' '}
                  {formatCurrency(cogsPerPortion + opexPerPortion + 1000)}
                </li>
                <li>Atau kurangi biaya bahan</li>
                <li>Atau kurangi OPEX bulanan</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
