'use client';

import { AlertTriangle, TrendingUp, TrendingDown, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { usePriceAlerts, formatPriceChange, type PriceAlert } from '@/hooks/usePriceHistory';

export function PriceAlerts() {
  const { data: alerts, isLoading } = usePriceAlerts();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className='h-5 w-32' />
        </CardHeader>
        <CardContent className='space-y-3'>
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className='h-16 w-full' />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <Card>
        <CardContent className='py-8 text-center'>
          <Package className='text-muted-foreground mx-auto mb-2 h-10 w-10 opacity-50' />
          <p className='text-muted-foreground text-sm'>Tidak ada perubahan harga signifikan</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='flex items-center gap-2 text-base'>
          <AlertTriangle className='h-4 w-4 text-amber-500' />
          Peringatan Harga ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-3'>
        {alerts.map((alert) => (
          <PriceAlertItem key={alert.ingredient_id} alert={alert} />
        ))}
      </CardContent>
    </Card>
  );
}

function PriceAlertItem({ alert }: { alert: PriceAlert }) {
  const isIncrease = alert.change_percent > 0;
  const severityColors = {
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };

  return (
    <div className='bg-muted/50 flex items-start gap-3 rounded-lg p-3'>
      <div
        className={`rounded-full p-2 ${
          isIncrease ? 'bg-red-100 dark:bg-red-900' : 'bg-green-100 dark:bg-green-900'
        }`}
      >
        {isIncrease ? (
          <TrendingUp className='h-4 w-4 text-red-600 dark:text-red-400' />
        ) : (
          <TrendingDown className='h-4 w-4 text-green-600 dark:text-green-400' />
        )}
      </div>
      <div className='min-w-0 flex-1'>
        <div className='mb-1 flex items-center gap-2'>
          <p className='truncate text-sm font-medium'>{alert.ingredient_name}</p>
          <Badge className={severityColors[alert.severity]} variant='outline'>
            {formatPriceChange(alert.change_percent)}
          </Badge>
        </div>
        <p className='text-muted-foreground text-xs'>{alert.message}</p>
        <p className='text-muted-foreground mt-1 text-xs'>
          Rp {alert.old_price.toLocaleString('id-ID')} → Rp{' '}
          {alert.current_price.toLocaleString('id-ID')}
        </p>
      </div>
    </div>
  );
}
