'use client';

import {
  TrendingUp,
  Calculator,
  Target,
  Calendar,
  ShoppingCart,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ScrollText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  calculateOpexPerUnit,
  calculateBEPQuantity,
  calculateROI,
  generateShoppingPlan,
  calculateGrossMargin,
  Ingredient,
} from '@/lib/businessLogic';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PlanningSummaryProps {
  businessName: string;
  menuData: {
    name: string;
    cogs: number;
    suggestedPrice: number;
    ingredients: Ingredient[];
  };
  opexTotal: number;
  equipmentTotal: number;
  targetDailySales: number;
  onComplete: () => void;
  onBack?: () => void;
}

export function PlanningSummary({
  businessName,
  menuData,
  opexTotal,
  equipmentTotal,
  targetDailySales,
  onComplete,
  onBack,
}: PlanningSummaryProps) {
  // Calculations
  const cogs = menuData.cogs || 0;
  const sellingPrice = menuData.suggestedPrice || cogs * 2.5;
  const margin = calculateGrossMargin(sellingPrice, cogs);

  // OPEX per cup
  const dailySales = targetDailySales || 30;
  const monthlySales = dailySales * 30;
  const opexPerCup = calculateOpexPerUnit(opexTotal, monthlySales);

  // Profit per cup (Gross)
  const grossProfitPerCup = sellingPrice - cogs;

  // Net profit (approximate for ROI) -> selling price - cogs - opex/cup
  const netProfitPerCup = grossProfitPerCup - opexPerCup;

  // Break Even Point (cups/month then /30 for day)
  // BEP (qty) = Fixed Costs / (Price - VariableCosts)
  // Here VariableCosts ~ COGS
  const bepCupsPerMonth = calculateBEPQuantity(opexTotal, sellingPrice, cogs);
  const bepCupsPerDay = Math.ceil(bepCupsPerMonth / 30);

  // ROI (months)
  const monthlyNetProfit = netProfitPerCup * monthlySales;
  const roiMonths = calculateROI(equipmentTotal, monthlyNetProfit);

  // Shopping Plan
  const [shoppingPlanOpen, setShoppingPlanOpen] = useState(false);
  const shoppingPlan = generateShoppingPlan(menuData.ingredients || [], dailySales, 7); // 7 days stock
  const shoppingTotalCost = shoppingPlan.reduce((sum, item) => sum + item.estimatedCost, 0);

  const formatCurrency = (amount: number) => `Rp ${Math.round(amount).toLocaleString('id-ID')}`;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='text-center'>
        <div className='bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
          <CheckCircle className='text-primary h-8 w-8' />
        </div>
        <h2 className='text-xl font-bold'>Selamat, {businessName}! 🎉</h2>
        <p className='text-muted-foreground'>Berikut ringkasan perencanaan bisnis Anda</p>
      </div>

      {/* Key Metrics */}
      <div className='grid grid-cols-2 gap-3'>
        <Card>
          <CardContent className='p-4 text-center'>
            <Calculator className='text-primary mx-auto mb-2 h-6 w-6' />
            <p className='text-muted-foreground text-xs'>COGS per Porsi</p>
            <p className='text-lg font-bold'>{formatCurrency(cogs)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 text-center'>
            <TrendingUp className='mx-auto mb-2 h-6 w-6 text-green-600' />
            <p className='text-muted-foreground text-xs'>Harga Jual</p>
            <p className='text-lg font-bold'>{formatCurrency(sellingPrice)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 text-center'>
            <Target className='mx-auto mb-2 h-6 w-6 text-amber-600' />
            <p className='text-muted-foreground text-xs'>Gross Margin</p>
            <p className='text-lg font-bold'>{margin.toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 text-center'>
            <ShoppingCart className='mx-auto mb-2 h-6 w-6 text-blue-600' />
            <p className='text-muted-foreground text-xs'>OPEX/Cup</p>
            <p className='text-lg font-bold'>{formatCurrency(opexPerCup)}</p>
          </CardContent>
        </Card>
      </div>

      {/* BEP & ROI */}
      <Card className='from-primary/10 to-primary/5 border-primary/20 bg-gradient-to-br'>
        <CardHeader className='pb-2'>
          <CardTitle className='text-base'>Analisis Keuangan</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <div className='mb-1 flex justify-between'>
              <span className='text-sm'>Break Even Point</span>
              <span className='font-bold'>{bepCupsPerDay} cups/hari</span>
            </div>
            <Progress value={Math.min((dailySales / bepCupsPerDay) * 100, 100)} className='h-2' />
            <p className='text-muted-foreground mt-1 text-xs'>Target: {dailySales} cups/hari</p>
          </div>

          <div className='flex items-center justify-between border-t py-3'>
            <div className='flex items-center gap-2'>
              <Calendar className='text-primary h-5 w-5' />
              <span className='font-medium'>Estimasi ROI</span>
            </div>
            <span className='text-primary text-xl font-bold'>{roiMonths} bulan</span>
          </div>

          <div className='grid grid-cols-2 gap-3 text-sm'>
            <div className='bg-background rounded-lg p-3'>
              <p className='text-muted-foreground'>Modal Peralatan</p>
              <p className='font-bold'>{formatCurrency(equipmentTotal)}</p>
            </div>
            <div className='bg-background rounded-lg p-3'>
              <p className='text-muted-foreground'>OPEX Bulanan</p>
              <p className='font-bold'>{formatCurrency(opexTotal)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu Preview */}
      <Card>
        <CardHeader className='pb-2'>
          <CardTitle className='text-base'>Menu Anda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='bg-muted/50 flex items-center justify-between rounded-lg p-3'>
            <div>
              <p className='font-medium'>{menuData.name}</p>
              <p className='text-muted-foreground text-xs'>
                COGS: {formatCurrency(cogs)} | Profit: {formatCurrency(netProfitPerCup)}
              </p>
            </div>
            <span className='text-lg font-bold'>{formatCurrency(sellingPrice)}</span>
          </div>
          <p className='text-muted-foreground mt-2 text-center text-xs'>
            Anda bisa menambah menu lainnya di dashboard
          </p>
        </CardContent>
      </Card>

      {/* Shopping Plan Dialog */}
      <Dialog open={shoppingPlanOpen} onOpenChange={setShoppingPlanOpen}>
        <DialogContent className='max-w-md md:max-w-lg'>
          <DialogHeader>
            <DialogTitle>Shopping Plan (7 Hari)</DialogTitle>
            <DialogDescription>
              Daftar belanja untuk target {dailySales} porsi/hari selama seminggu.
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
                {shoppingPlan.map((item, idx) => (
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
                    {formatCurrency(shoppingTotalCost)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className='mt-4 flex justify-end'>
            <Button onClick={() => setShoppingPlanOpen(false)}>Tutup</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Shopping Plan Trigger Card */}
      <Card
        className='hover:border-primary/50 mb-6 cursor-pointer transition-all'
        onClick={() => setShoppingPlanOpen(true)}
      >
        <CardContent className='flex items-center justify-between p-4'>
          <div className='flex items-center gap-3'>
            <div className='rounded-full bg-blue-100 p-2 text-blue-600'>
              <ScrollText className='h-5 w-5' />
            </div>
            <div>
              <p className='font-medium'>Lihat Shopping Plan</p>
              <p className='text-muted-foreground text-xs'>Otomatis untuk stok 7 hari</p>
            </div>
          </div>
          <Button variant='ghost' size='icon'>
            <ChevronDown className='h-4 w-4' />
          </Button>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className='flex gap-3'>
        {onBack && (
          <Button variant='outline' size='lg' className='flex-1' onClick={onBack}>
            Kembali
          </Button>
        )}
        <Button className='flex-1' size='lg' onClick={onComplete}>
          Mulai Bisnis Saya
          <TrendingUp className='ml-2 h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}
