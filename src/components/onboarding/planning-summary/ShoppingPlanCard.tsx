'use client';

import { useState } from 'react';
import { ChevronDown, ScrollText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, type ShoppingPlanSummary } from '@/lib/financialCalculations';

interface ShoppingPlanCardProps {
  shoppingPlan: ShoppingPlanSummary;
  cupsTargetPerDay: number;
}

export function ShoppingPlanCard({ shoppingPlan, cupsTargetPerDay }: ShoppingPlanCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card
        className='hover:border-primary/50 cursor-pointer transition-all'
        onClick={() => setDialogOpen(true)}
      >
        <CardContent className='p-4'>
          <div className='mb-3 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='rounded-full bg-blue-100 p-2 text-blue-600'>
                <ScrollText className='h-5 w-5' />
              </div>
              <div>
                <p className='font-medium'>🛒 Shopping Plan 7 Hari</p>
                <p className='text-muted-foreground text-xs'>
                  {cupsTargetPerDay} porsi/hari × 7 hari = {shoppingPlan.productionBasis.totalCups}{' '}
                  porsi
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
        </CardContent>
      </Card>

      {/* Shopping Plan Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className='max-w-md md:max-w-lg'>
          <DialogHeader>
            <DialogTitle>Shopping Plan (7 Hari)</DialogTitle>
            <DialogDescription>
              Daftar belanja untuk target {cupsTargetPerDay} porsi/hari selama seminggu.
            </DialogDescription>
          </DialogHeader>
          <div className='max-h-[60vh] overflow-y-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bahan</TableHead>
                  <TableHead className='text-right'>Jml Beli</TableHead>
                  <TableHead className='text-right'>Est. Biaya</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shoppingPlan.items.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className='font-medium'>{item.ingredientName}</TableCell>
                    <TableCell className='text-right'>
                      {item.packsToBuy} {item.packUnit}
                    </TableCell>
                    <TableCell className='text-right'>
                      {formatCurrency(item.estimatedCost)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={2} className='text-right font-bold'>
                    Total
                  </TableCell>
                  <TableCell className='text-right font-bold'>
                    {formatCurrency(shoppingPlan.totalCost)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className='mt-4 flex justify-end'>
            <Button onClick={() => setDialogOpen(false)}>Tutup</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
