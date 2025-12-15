'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { IngredientCostBreakdown } from './index';

interface CogsResultProps {
  ingredientBreakdown: IngredientCostBreakdown[];
  estimatedCogs: number;
  suggestedPrice: number;
  selectedMargin: number;
  marginOptions: number[];
  onMarginChange: (margin: number) => void;
  onEditIngredients: () => void;
}

export function CogsResult({
  ingredientBreakdown,
  estimatedCogs,
  suggestedPrice,
  selectedMargin,
  marginOptions,
  onMarginChange,
  onEditIngredients,
}: CogsResultProps) {
  return (
    <div className='animate-in fade-in slide-in-from-bottom-4 space-y-4 duration-500'>
      {/* COGS Card with Breakdown */}
      <Card className='bg-primary/5 border-primary/20'>
        <CardContent className='space-y-2 p-4'>
          <div className='text-sm font-medium'>Rincian Biaya Bahan</div>

          {/* Ingredient breakdown */}
          <div className='space-y-1'>
            {ingredientBreakdown.map((item, idx) => (
              <div
                key={idx}
                className='text-muted-foreground flex items-center justify-between text-sm'
              >
                <span className='truncate pr-2'>{item.name}</span>
                <span>Rp {item.cost.toLocaleString('id-ID')}</span>
              </div>
            ))}
          </div>

          {/* Total COGS */}
          <div className='border-primary/20 flex items-center justify-between border-t pt-2'>
            <span className='text-primary font-bold'>Total COGS</span>
            <span className='text-primary text-xl font-bold'>
              Rp {estimatedCogs.toLocaleString('id-ID')}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Margin Selector & Price Card */}
      <Card>
        <CardContent className='space-y-4 p-4'>
          {/* Margin Chip Selector */}
          <div className='space-y-2'>
            <Label className='text-sm font-medium'>Pilih Target Margin</Label>
            <div className='flex flex-wrap gap-2'>
              {marginOptions.map((margin) => (
                <Button
                  key={margin}
                  variant={selectedMargin === margin ? 'default' : 'outline'}
                  size='sm'
                  className='min-w-[60px]'
                  onClick={() => onMarginChange(margin)}
                >
                  {margin}%
                </Button>
              ))}
            </div>
          </div>

          {/* Suggested Price */}
          <div className='border-t pt-4 text-center'>
            <p className='text-muted-foreground mb-1 text-sm'>
              Rekomendasi Harga Jual (Margin {selectedMargin}%)
            </p>
            <p className='text-3xl font-bold text-green-600'>
              Rp {suggestedPrice.toLocaleString('id-ID')}
            </p>
          </div>

          <div className='flex justify-center'>
            <Button variant='outline' size='sm' onClick={onEditIngredients}>
              Edit Bahan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
