'use client';

import { useState } from 'react';
import {
  TrendingUp,
  Calculator,
  Target,
  Calendar,
  CheckCircle,
  ChevronDown,
  ScrollText,
  AlertTriangle,
  Info,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useFormContext, useWatch } from 'react-hook-form';
import type { OnboardingFormValues } from '@/components/onboarding/types';

// New imports
import {
  FinancialAssumptions,
  DEFAULT_ASSUMPTIONS,
  calculateFinancialMetrics,
  generateEnhancedShoppingPlan,
  validateIngredientData,
  generateRoundedPriceOptions,
  simulatePrice,
  formatCurrency,
  formatPercent,
  formatBepDisplay,
  formatPaybackDisplay,
} from '@/lib/financialCalculations';
import { calculateMenuCOGS } from '@/lib/businessLogic';
import { AssumptionEditor } from './AssumptionEditor';
import { AISuggestionCards } from './AISuggestionCards';

interface PlanningSummaryProps {
  onComplete: () => void;
  onBack?: () => void;
}

export function PlanningSummary({ onComplete, onBack }: PlanningSummaryProps) {
  // Form context
  const { control, setValue } = useFormContext<OnboardingFormValues>();

  const businessName = useWatch({ control, name: 'businessName' });
  const menuData = useWatch({ control, name: 'menuData' });
  const opexData = useWatch({ control, name: 'opexData' });
  const equipmentData = useWatch({ control, name: 'equipmentData' });
  // State
  const [assumptions, setAssumptions] = useState<FinancialAssumptions>({
    ...DEFAULT_ASSUMPTIONS,
    cupsTargetPerDay: 30, // Default since input removed
  });
  const [shoppingPlanOpen, setShoppingPlanOpen] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────────
  // Calculations
  // ─────────────────────────────────────────────────────────────────────────────

  // OPEX total (normalized to monthly)
  const opexMonthly = opexData.reduce((sum, cat) => {
    const monthly =
      cat.frequency === 'daily'
        ? cat.amount * 30
        : cat.frequency === 'weekly'
          ? cat.amount * 4
          : cat.frequency === 'yearly'
            ? cat.amount / 12
            : cat.amount;
    return sum + monthly;
  }, 0);

  // Equipment total
  const equipmentTotal = equipmentData.reduce((sum, eq) => sum + eq.estimated_price, 0);

  // COGS
  const cogsPerPortion = menuData.estimatedCogs || calculateMenuCOGS(menuData.ingredients || []);
  const sellingPrice = menuData.suggestedPrice || cogsPerPortion * 2.5;

  // Calculate all metrics
  const metrics = calculateFinancialMetrics(
    sellingPrice,
    cogsPerPortion,
    opexMonthly,
    equipmentTotal,
    assumptions,
  );

  // Validate data completeness
  const validation = validateIngredientData(menuData.ingredients || []);

  // Shopping plan
  const shoppingPlan = generateEnhancedShoppingPlan(
    menuData.ingredients || [],
    assumptions.cupsTargetPerDay,
    7,
  );

  // Rounded price options
  const roundedPrices = generateRoundedPriceOptions(sellingPrice);
  const hasNonRoundedPrice = sellingPrice % 1000 !== 0;

  // ─────────────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────────────

  const handleApplyPrice = (newPrice: number) => {
    setValue('menuData.suggestedPrice', newPrice);
  };

  const handleSimulatePrice = (price: number) => {
    return simulatePrice(
      price,
      sellingPrice,
      cogsPerPortion,
      opexMonthly,
      equipmentTotal,
      assumptions,
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // BEP and ROI display
  // ─────────────────────────────────────────────────────────────────────────────

  const bepDisplay = formatBepDisplay(metrics.bepCupsPerDay, metrics.isBepInfinity);
  const roiDisplay = formatPaybackDisplay(metrics.paybackMonths, metrics.isPaybackInfinity);

  // Progress for BEP bar
  const bepProgress = metrics.isBepInfinity
    ? 0
    : Math.min((assumptions.cupsTargetPerDay / metrics.bepCupsPerDay) * 100, 100);

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='text-center'>
        <div className='bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full'>
          <CheckCircle className='text-primary h-8 w-8' />
        </div>
        <h2 className='text-xl font-bold'>Selamat, {businessName || 'Pengusaha'}! 🎉</h2>
        <p className='text-muted-foreground'>Berikut ringkasan perencanaan bisnis Anda</p>
      </div>

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
      {metrics.isNegativeProfit && (
        <Card className='border-red-200 bg-red-50'>
          <CardContent className='flex items-start gap-3 p-4'>
            <AlertTriangle className='mt-0.5 h-5 w-5 shrink-0 text-red-600' />
            <div>
              <p className='text-sm font-medium text-red-800'>⚠️ Peringatan: Profit Negatif</p>
              <p className='text-xs text-red-700'>
                Dengan harga dan biaya saat ini, Anda{' '}
                <strong>rugi {formatCurrency(Math.abs(metrics.netProfitPerPortion))}</strong> per
                porsi.
              </p>
              <ul className='mt-2 list-disc pl-4 text-xs text-red-600'>
                <li>
                  Naikkan harga jual minimal ke{' '}
                  {formatCurrency(cogsPerPortion + metrics.opexPerPortion + 1000)}
                </li>
                <li>Atau kurangi biaya bahan</li>
                <li>Atau kurangi OPEX bulanan</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards (2x2 Grid) */}
      <div className='grid grid-cols-2 gap-3'>
        {/* COGS per Portion */}
        <Card>
          <CardContent className='p-4 text-center'>
            <Calculator className='text-primary mx-auto mb-2 h-6 w-6' />
            <p className='text-muted-foreground text-xs'>COGS/HPP per Porsi</p>
            <p className='text-lg font-bold'>{formatCurrency(cogsPerPortion)}</p>
          </CardContent>
        </Card>

        {/* Selling Price */}
        <Card className='relative'>
          <CardContent className='p-4 text-center'>
            <TrendingUp className='mx-auto mb-2 h-6 w-6 text-green-600' />
            <p className='text-muted-foreground text-xs'>Harga Jual</p>
            <p className='text-lg font-bold'>{formatCurrency(sellingPrice)}</p>
            {hasNonRoundedPrice && (
              <div className='mt-2'>
                <Badge variant='secondary' className='text-xs'>
                  <Sparkles className='mr-1 h-3 w-3' />
                  Rp {(roundedPrices[1] / 1000).toFixed(0)}k?
                </Badge>
                <Button
                  variant='ghost'
                  size='sm'
                  className='text-primary ml-1 h-6 px-2 text-xs'
                  onClick={() => handleApplyPrice(roundedPrices[1])}
                >
                  Terapkan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Net Profit per Portion */}
        <Card>
          <CardContent className='p-4 text-center'>
            <DollarSign
              className={`mx-auto mb-2 h-6 w-6 ${metrics.isNegativeProfit ? 'text-red-600' : 'text-green-600'}`}
            />
            <p className='text-muted-foreground text-xs'>Profit Bersih/Porsi</p>
            <p className={`text-lg font-bold ${metrics.isNegativeProfit ? 'text-red-600' : ''}`}>
              {formatCurrency(metrics.netProfitPerPortion)}
            </p>
            {metrics.isNegativeProfit && (
              <Badge variant='destructive' className='mt-1 text-xs'>
                RUGI!
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Net Margin */}
        <Card>
          <CardContent className='p-4 text-center'>
            <Target className='mx-auto mb-2 h-6 w-6 text-amber-600' />
            <p className='text-muted-foreground text-xs'>Net Margin</p>
            <p
              className={`text-lg font-bold ${metrics.netMarginPercent < 0 ? 'text-red-600' : ''}`}
            >
              {formatPercent(metrics.netMarginPercent)}
            </p>
            <p className='text-muted-foreground text-xs'>
              (GM: {formatPercent(metrics.grossMarginPercent)})
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Analysis Card */}
      <Card className='from-primary/10 to-primary/5 border-primary/20'>
        <CardHeader className='pb-2'>
          <CardTitle className='text-base'>📊 Analisis Keuangan</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* BEP */}
          <div>
            <div className='mb-1 flex items-center justify-between'>
              <span className='flex items-center gap-1 text-sm'>
                BEP Operasional
                <button
                  type='button'
                  className='text-muted-foreground hover:text-foreground'
                  title='BEP = OPEX Bulanan ÷ (Harga Jual - COGS - Fee)'
                >
                  <Info className='h-3.5 w-3.5' />
                </button>
              </span>
              <span className={`font-bold ${bepDisplay.isError ? 'text-red-600' : ''}`}>
                {bepDisplay.text}
              </span>
            </div>
            <Progress value={bepProgress} className='h-2' />
            <p className='text-muted-foreground mt-1 text-xs'>
              Target: {assumptions.cupsTargetPerDay} cups/hari
              {!metrics.isBepInfinity && bepProgress >= 100 && (
                <span className='ml-1 text-green-600'>✓ Di atas BEP</span>
              )}
            </p>
          </div>

          {/* ROI */}
          <div className='flex items-center justify-between border-t py-3'>
            <div className='flex items-center gap-2'>
              <Calendar className='text-primary h-5 w-5' />
              <span className='flex items-center gap-1 font-medium'>
                Balik Modal (ROI)
                <button
                  type='button'
                  className='text-muted-foreground hover:text-foreground'
                  title='ROI = Modal Peralatan ÷ (Profit Bersih/Porsi × Penjualan Bulanan)'
                >
                  <Info className='h-3.5 w-3.5' />
                </button>
              </span>
            </div>
            <span
              className={`text-xl font-bold ${roiDisplay.isError ? 'text-red-600' : 'text-primary'}`}
            >
              {roiDisplay.text}
            </span>
          </div>

          {/* Cost Summary */}
          <div className='grid grid-cols-2 gap-3 text-sm'>
            <div className='bg-background rounded-lg p-3'>
              <p className='text-muted-foreground'>Modal Peralatan</p>
              <p className='font-bold'>{formatCurrency(equipmentTotal)}</p>
            </div>
            <div className='bg-background rounded-lg p-3'>
              <p className='text-muted-foreground'>OPEX Bulanan</p>
              <p className='font-bold'>{formatCurrency(opexMonthly)}</p>
            </div>
          </div>

          {/* Assumption Editor */}
          <div className='flex justify-center'>
            <AssumptionEditor
              assumptions={assumptions}
              onAssumptionsChange={setAssumptions}
              priceSell={sellingPrice}
              cogsPerPortion={cogsPerPortion}
              opexMonthly={opexMonthly}
              equipmentCost={equipmentTotal}
            />
          </div>

          {/* Assumptions Collapsible */}
          <Accordion type='single' collapsible className='bg-background rounded-lg'>
            <AccordionItem value='assumptions' className='border-0'>
              <AccordionTrigger className='px-3 py-2 text-sm hover:no-underline'>
                <span className='flex items-center gap-2'>
                  <Info className='h-4 w-4' />
                  Asumsi yang dipakai
                </span>
              </AccordionTrigger>
              <AccordionContent className='px-3 pb-3'>
                <ul className='text-muted-foreground space-y-1 text-xs'>
                  <li>• Target penjualan: {assumptions.cupsTargetPerDay} porsi/hari</li>
                  <li>• Hari operasi: {assumptions.daysSellPerMonth} hari/bulan</li>
                  <li>• Platform fee: {assumptions.platformFeePercent}%</li>
                  <li>• Waste/spoilage: {assumptions.wastePercent}%</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Menu Preview */}
      <Card>
        <CardHeader>
          <CardTitle className='text-base'>🍽️ Menu Anda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='bg-muted/50 flex items-center justify-between rounded-lg p-3'>
            <div>
              <p className='font-medium'>{menuData.name || 'Menu Belum Dinamai'}</p>
              <p className='text-muted-foreground text-xs'>
                COGS: {formatCurrency(cogsPerPortion)} | Profit:{' '}
                {formatCurrency(metrics.netProfitPerPortion)}
              </p>
            </div>
            <span className='text-lg font-bold'>{formatCurrency(sellingPrice)}</span>
          </div>
          <p className='text-muted-foreground mt-2 text-center text-xs'>
            💡 Tip: Tambah 2-3 menu lagi untuk variasi. Anda bisa melakukannya di dashboard.
          </p>
        </CardContent>
      </Card>

      {/* Shopping Plan Preview */}
      <Card
        className='hover:border-primary/50 cursor-pointer transition-all'
        onClick={() => setShoppingPlanOpen(true)}
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
                  {assumptions.cupsTargetPerDay} porsi/hari × 7 hari ={' '}
                  {shoppingPlan.productionBasis.totalCups} porsi
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
      <Dialog open={shoppingPlanOpen} onOpenChange={setShoppingPlanOpen}>
        <DialogContent className='max-w-md md:max-w-lg'>
          <DialogHeader>
            <DialogTitle>Shopping Plan (7 Hari)</DialogTitle>
            <DialogDescription>
              Daftar belanja untuk target {assumptions.cupsTargetPerDay} porsi/hari selama seminggu.
            </DialogDescription>
          </DialogHeader>
          <div className='max-h-[60vh] overflow-y-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bahan</TableHead>
                  <TableHead className='text-right'>Jml. Beli</TableHead>
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
            <Button onClick={() => setShoppingPlanOpen(false)}>Tutup</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Suggestions */}
      {/* <AISuggestionCards
        currentPrice={sellingPrice}
        topCostDriver={shoppingPlan.topCostDrivers[0] || null}
        simulatePrice={handleSimulatePrice}
        onApplyPrice={handleApplyPrice}
      /> */}

      {/* CTA Footer */}
      <div className='space-y-3'>
        <Button className='w-full' size='lg' onClick={onComplete}>
          Lanjut ke Dashboard
          <TrendingUp className='ml-2 h-4 w-4' />
        </Button>
        <div className='flex gap-3'>
          {onBack && (
            <Button variant='outline' className='flex-1' onClick={onBack}>
              ← Kembali
            </Button>
          )}
          <Button
            variant='ghost'
            className='flex-1'
            onClick={() => {
              // Open assumption editor programmatically - for now just scroll to it
              document
                .querySelector('[data-radix-collection-item]')
                ?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Ubah Asumsi & Simulasi
          </Button>
        </div>
      </div>
    </div>
  );
}
