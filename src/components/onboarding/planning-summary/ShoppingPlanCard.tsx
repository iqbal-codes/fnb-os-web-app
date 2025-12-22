'use client';

import { useState } from 'react';
import { ScrollText, ChevronDown, ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { formatCurrency, ShoppingPlanSummary } from '@/lib/financialCalculations';

interface ShoppingPlanCardProps {
  shoppingPlan: ShoppingPlanSummary;
  targetSafePerDay: number;
}

export function ShoppingPlanCard({ shoppingPlan, targetSafePerDay }: ShoppingPlanCardProps) {
  const [shoppingPlanOpen, setShoppingPlanOpen] = useState(false);

  const totalUnits = targetSafePerDay * 7;

  return (
    <>
      <Card
        className='hover:border-primary/50 cursor-pointer transition-all'
        onClick={() => setShoppingPlanOpen(true)}
      >
        <CardContent className='p-4'>
          <div className='mb-3 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='rounded-full bg-blue-100 p-2 text-blue-600 dark:bg-blue-950'>
                <ScrollText className='h-5 w-5' />
              </div>
              <div>
                <p className='font-medium'>🛒 Rencana Belanja 7 Hari</p>
                <p className='text-muted-foreground text-xs'>
                  {targetSafePerDay} porsi/hari × 7 hari = {totalUnits} porsi
                </p>
              </div>
            </div>
            <ChevronDown className='text-muted-foreground h-5 w-5' />
          </div>

          <div className='bg-muted/50 rounded-lg p-3'>
            <div className='mb-2 flex items-center justify-between'>
              <span className='text-sm'>Total Estimasi Belanja</span>
              <span className='text-primary font-bold'>
                {formatCurrency(shoppingPlan.totalCost)}
              </span>
            </div>

            {shoppingPlan.topCostDrivers.length > 0 && (
              <div>
                <p className='text-muted-foreground mb-1 text-xs'>Top 3 Biaya:</p>
                <div className='flex flex-wrap gap-1'>
                  {shoppingPlan.topCostDrivers.map((driver, idx) => (
                    <Badge key={idx} variant='outline' className='text-xs'>
                      {driver.name} ({driver.percentOfTotal.toFixed(0)}%)
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <p className='text-muted-foreground mt-2 text-center text-xs'>Berdasarkan Target Aman</p>
        </CardContent>
      </Card>

      {/* Shopping Plan Drawer - Mobile Friendly */}
      <Drawer open={shoppingPlanOpen} onOpenChange={setShoppingPlanOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className='flex items-center justify-center gap-2'>
              <ShoppingCart className='h-5 w-5' />
              Rencana Belanja 7 Hari
            </DrawerTitle>
            <DrawerDescription>
              Target {targetSafePerDay} porsi/hari × 7 hari = {totalUnits} porsi
            </DrawerDescription>
          </DrawerHeader>

          {/* Card List - Mobile Friendly */}
          <div className='max-h-[40vh] space-y-2 overflow-y-auto px-4'>
            {shoppingPlan.items.map((item, idx) => (
              <div
                key={idx}
                className='bg-muted/50 flex items-center justify-between rounded-lg p-3'
              >
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-medium'>{item.ingredientName}</p>
                  <p className='text-muted-foreground text-xs'>
                    {item.packsToBuy} × {item.packSize} {item.packUnit}
                  </p>
                </div>
                <div className='ml-3 shrink-0 text-right'>
                  <p className='text-primary text-sm font-bold'>
                    {formatCurrency(item.estimatedCost)}
                  </p>
                  {item.percentOfTotal > 10 && (
                    <Badge variant='secondary' className='text-xs'>
                      {item.percentOfTotal.toFixed(0)}%
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Total Section */}
          <div className='mx-4 mt-4 border-t pt-3'>
            <div className='flex items-center justify-between'>
              <span className='font-medium'>Total Belanja</span>
              <span className='text-primary text-xl font-bold'>
                {formatCurrency(shoppingPlan.totalCost)}
              </span>
            </div>
            <p className='text-muted-foreground mt-1 text-center text-xs'>
              Berdasarkan Target Aman (BEP + 20%)
            </p>
          </div>

          <DrawerFooter>
            <Button className='w-full' onClick={() => setShoppingPlanOpen(false)}>
              Tutup
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
