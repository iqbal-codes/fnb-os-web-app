'use client';

import { Calendar, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  FinancialAssumptions,
  formatCurrency,
  formatBepDisplay,
  formatPaybackDisplay,
} from '@/lib/financialCalculations';
import { AssumptionEditor } from '../AssumptionEditor';

interface FinancialAnalysisProps {
  metrics: {
    bepCupsPerDay: number;
    isBepInfinity: boolean;
    paybackMonths: number;
    isPaybackInfinity: boolean;
  };
  assumptions: FinancialAssumptions;
  onAssumptionsChange: (assumptions: FinancialAssumptions) => void;
  sellingPrice: number;
  cogsPerPortion: number;
  opexMonthly: number;
  equipmentTotal: number;
}

export function FinancialAnalysis({
  metrics,
  assumptions,
  onAssumptionsChange,
  sellingPrice,
  cogsPerPortion,
  opexMonthly,
  equipmentTotal,
}: FinancialAnalysisProps) {
  const bepDisplay = formatBepDisplay(metrics.bepCupsPerDay, metrics.isBepInfinity);
  const roiDisplay = formatPaybackDisplay(metrics.paybackMonths, metrics.isPaybackInfinity);

  // Progress for BEP bar
  const bepProgress = metrics.isBepInfinity
    ? 0
    : Math.min((assumptions.cupsTargetPerDay / metrics.bepCupsPerDay) * 100, 100);

  return (
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
            onAssumptionsChange={onAssumptionsChange}
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
  );
}
