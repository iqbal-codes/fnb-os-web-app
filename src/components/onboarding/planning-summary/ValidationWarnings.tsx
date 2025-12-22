'use client';

import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataValidationResult } from '@/lib/financialCalculations';

interface ValidationWarningsProps {
  validation: DataValidationResult;
  isNegativeProfit: boolean;
  cogsPerPortion: number;
  onBack?: () => void;
}

export function ValidationWarnings({
  validation,
  isNegativeProfit,
  cogsPerPortion,
  onBack,
}: ValidationWarningsProps) {
  return (
    <>
      {/* Data Completeness Warning */}
      {!validation.isComplete && (
        <Card className='border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30'>
          <CardContent className='flex items-start gap-3 p-4'>
            <AlertTriangle className='mt-0.5 h-5 w-5 shrink-0 text-amber-600' />
            <div>
              <p className='text-sm font-medium text-amber-800 dark:text-amber-200'>
                Data Belum Lengkap
              </p>
              <p className='text-xs text-amber-700 dark:text-amber-300'>
                {validation.warnings.join('. ')}. Perhitungan mungkin tidak akurat.
              </p>
              {validation.missingPriceIngredients.length > 0 && (
                <p className='mt-1 text-xs text-amber-600 dark:text-amber-400'>
                  Bahan tanpa harga: {validation.missingPriceIngredients.slice(0, 3).join(', ')}
                  {validation.missingPriceIngredients.length > 3 &&
                    ` (+${validation.missingPriceIngredients.length - 3} lainnya)`}
                </p>
              )}
              {onBack && (
                <Button
                  variant='link'
                  size='sm'
                  className='mt-2 h-auto p-0 text-amber-700 dark:text-amber-300'
                  onClick={onBack}
                >
                  ← Lengkapi Data Bahan
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Negative Margin Warning */}
      {isNegativeProfit && (
        <Card className='border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30'>
          <CardContent className='flex items-start gap-3 p-4'>
            <AlertTriangle className='mt-0.5 h-5 w-5 shrink-0 text-red-600' />
            <div>
              <p className='text-sm font-medium text-red-800 dark:text-red-200'>
                ⚠️ Peringatan: Margin Tidak Menguntungkan
              </p>
              <p className='text-xs text-red-700 dark:text-red-300'>
                Contribution margin negatif atau nol. Bisnis tidak bisa mencapai titik impas dengan
                kondisi saat ini.
              </p>
              <ul className='mt-2 list-disc pl-4 text-xs text-red-600 dark:text-red-400'>
                <li>Naikkan harga jual</li>
                <li>
                  Kurangi biaya bahan (Modal saat ini: Rp {cogsPerPortion.toLocaleString('id-ID')})
                </li>
                <li>Kurangi OPEX bulanan</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
