'use client';

import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  calculateMenuPricing,
  suggestSellingPrice,
  scoreMenuProfitability,
  type IngredientCost,
} from '@/lib/calculations/cogs';

interface COGSBreakdownProps {
  menuName: string;
  sellingPrice: number;
  ingredientCosts: IngredientCost[];
  opexPerItem?: number;
  targetMargin?: number;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function COGSBreakdown({
  menuName,
  sellingPrice,
  ingredientCosts,
  opexPerItem = 0,
  targetMargin = 30,
}: COGSBreakdownProps) {
  const totalIngredientCost = ingredientCosts.reduce((sum, cost) => sum + cost.calculatedCost, 0);

  const pricing = calculateMenuPricing(sellingPrice, totalIngredientCost, opexPerItem);

  const suggestions = suggestSellingPrice(totalIngredientCost, opexPerItem, targetMargin);

  const score = scoreMenuProfitability(pricing.grossMarginPercent);

  const scoreColors = {
    A: 'bg-green-500',
    B: 'bg-green-400',
    C: 'bg-yellow-500',
    D: 'bg-orange-500',
    F: 'bg-red-500',
  };

  return (
    <div className='space-y-4'>
      {/* Summary Card */}
      <Card>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-base'>{menuName}</CardTitle>
            <Badge className={scoreColors[score.score]}>
              {score.score} - {score.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Price and Margin */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='text-muted-foreground text-sm'>Harga Jual</p>
              <p className='text-2xl font-bold'>{formatCurrency(sellingPrice)}</p>
            </div>
            <div>
              <p className='text-muted-foreground text-sm'>Gross Margin</p>
              <div className='flex items-center gap-2'>
                <p
                  className={`text-2xl font-bold ${
                    pricing.isHealthy ? 'text-green-600' : 'text-orange-500'
                  }`}
                >
                  {pricing.grossMarginPercent}%
                </p>
                {pricing.isHealthy ? (
                  <CheckCircle className='h-5 w-5 text-green-600' />
                ) : (
                  <AlertTriangle className='h-5 w-5 text-orange-500' />
                )}
              </div>
            </div>
          </div>

          {/* Margin Progress */}
          <div>
            <div className='mb-1 flex justify-between text-sm'>
              <span>Margin</span>
              <span>{pricing.grossMarginPercent}% dari target 60%</span>
            </div>
            <Progress value={Math.min(pricing.grossMarginPercent, 100)} className='h-2' />
          </div>

          {/* Cost Breakdown */}
          <div className='space-y-2 border-t pt-2'>
            <div className='flex justify-between text-sm'>
              <span className='text-muted-foreground'>Biaya Bahan</span>
              <span>{formatCurrency(totalIngredientCost)}</span>
            </div>
            {opexPerItem > 0 && (
              <div className='flex justify-between text-sm'>
                <span className='text-muted-foreground'>OPEX/item</span>
                <span>{formatCurrency(opexPerItem)}</span>
              </div>
            )}
            <div className='flex justify-between text-sm font-medium'>
              <span>Total COGS</span>
              <span>{formatCurrency(pricing.totalCOGS)}</span>
            </div>
            <div className='flex justify-between text-sm font-medium text-green-600'>
              <span>Gross Profit</span>
              <span>{formatCurrency(pricing.grossProfit)}</span>
            </div>
          </div>

          {/* Recommendation */}
          <div className='border-t pt-2'>
            <p className='text-muted-foreground text-sm'>💡 {pricing.recommendation}</p>
          </div>
        </CardContent>
      </Card>

      {/* Ingredient Details */}
      {ingredientCosts.length > 0 && (
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm'>Detail Biaya Bahan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              {ingredientCosts.map((cost, index) => {
                const percentage =
                  totalIngredientCost > 0
                    ? ((cost.calculatedCost / totalIngredientCost) * 100).toFixed(1)
                    : 0;

                return (
                  <div key={index} className='flex items-center justify-between text-sm'>
                    <div className='min-w-0 flex-1'>
                      <p className='truncate'>{cost.ingredientName}</p>
                      <p className='text-muted-foreground text-xs'>
                        {cost.quantity} {cost.unit}
                      </p>
                    </div>
                    <div className='shrink-0 text-right'>
                      <p>{formatCurrency(cost.calculatedCost)}</p>
                      <p className='text-muted-foreground text-xs'>{percentage}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price Suggestions */}
      <Card>
        <CardHeader className='pb-3'>
          <CardTitle className='text-sm'>Rekomendasi Harga</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-3 gap-2 text-center'>
            <div className='bg-muted/50 rounded-lg p-2'>
              <p className='text-muted-foreground text-xs'>Minimum</p>
              <p className='font-medium'>{formatCurrency(suggestions.minimum)}</p>
              <p className='text-muted-foreground text-xs'>10% margin</p>
            </div>
            <div className='bg-primary/10 border-primary/20 rounded-lg border p-2'>
              <p className='text-primary text-xs font-medium'>Recommended</p>
              <p className='text-primary font-bold'>{formatCurrency(suggestions.suggested)}</p>
              <p className='text-muted-foreground text-xs'>{targetMargin}% margin</p>
            </div>
            <div className='bg-muted/50 rounded-lg p-2'>
              <p className='text-muted-foreground text-xs'>Premium</p>
              <p className='font-medium'>{formatCurrency(suggestions.premium)}</p>
              <p className='text-muted-foreground text-xs'>40% margin</p>
            </div>
          </div>

          {sellingPrice < suggestions.minimum && (
            <div className='bg-destructive/10 text-destructive mt-3 flex items-center gap-2 rounded-lg p-2 text-sm'>
              <TrendingDown className='h-4 w-4 shrink-0' />
              <span>Harga saat ini di bawah harga minimum!</span>
            </div>
          )}
          {sellingPrice >= suggestions.suggested && (
            <div className='mt-3 flex items-center gap-2 rounded-lg bg-green-500/10 p-2 text-sm text-green-600'>
              <TrendingUp className='h-4 w-4 shrink-0' />
              <span>Harga sudah sesuai atau di atas rekomendasi</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
