'use client';

import { AlertTriangle, ShoppingCart } from 'lucide-react';

import { useLowStockItems, calculateRestockAmount } from '@/hooks/useInventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function LowStockAlert() {
  const { lowStockItems, criticalItems, hasLowStock, isLoading } = useLowStockItems();

  if (isLoading || !hasLowStock) {
    return null;
  }

  return (
    <Card className='border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/20'>
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center gap-2 text-base text-yellow-700 dark:text-yellow-400'>
          <AlertTriangle className='h-5 w-5' />
          Low Stock Alert
          <Badge
            variant='outline'
            className='ml-auto border-yellow-300 text-yellow-700 dark:border-yellow-700 dark:text-yellow-400'
          >
            {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        {/* Critical items first */}
        {criticalItems.length > 0 && (
          <div className='rounded-lg border border-red-200 bg-red-100/50 p-3 dark:border-red-900 dark:bg-red-950/30'>
            <p className='mb-2 text-sm font-medium text-red-700 dark:text-red-400'>
              ⚠️ Critical ({criticalItems.length})
            </p>
            <div className='space-y-1'>
              {criticalItems.slice(0, 3).map((item) => {
                const restock = calculateRestockAmount(item.current_stock, item.min_stock);
                return (
                  <div key={item.id} className='flex items-center justify-between text-sm'>
                    <span className='truncate'>{item.ingredient?.name}</span>
                    <span className='ml-2 shrink-0 font-medium text-red-600 dark:text-red-400'>
                      +{restock} {item.unit}
                    </span>
                  </div>
                );
              })}
              {criticalItems.length > 3 && (
                <p className='text-muted-foreground text-xs'>+{criticalItems.length - 3} more</p>
              )}
            </div>
          </div>
        )}

        {/* Low stock items (non-critical) */}
        {lowStockItems.filter((i) => !criticalItems.includes(i)).length > 0 && (
          <div className='space-y-1'>
            <p className='text-sm font-medium text-yellow-700 dark:text-yellow-400'>Running Low</p>
            {lowStockItems
              .filter((i) => !criticalItems.includes(i))
              .slice(0, 3)
              .map((item) => {
                const restock = calculateRestockAmount(item.current_stock, item.min_stock);
                return (
                  <div key={item.id} className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground truncate'>{item.ingredient?.name}</span>
                    <span className='ml-2 shrink-0 font-medium text-yellow-600 dark:text-yellow-400'>
                      +{restock} {item.unit}
                    </span>
                  </div>
                );
              })}
          </div>
        )}

        {/* Restock Recommendation */}
        <div className='border-t pt-2'>
          <Button variant='outline' size='sm' className='w-full'>
            <ShoppingCart className='mr-2 h-4 w-4' />
            Generate Shopping List
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
