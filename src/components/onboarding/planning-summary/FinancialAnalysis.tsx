'use client';

import { Calendar, Info, Shield, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { formatCurrency } from '@/lib/financialCalculations';

interface FinancialAnalysisProps {
  // BEP
  bepUnitsPerDay: number;
  bepUnitsPerMonth: number;
  isBepInfinity: boolean;
  // Fixed Costs
  fixedCostMonthly: number;
  opexMonthly: number;
  capexDepreciationMonthly: number;
  contributionMargin: number;
  // Target Aman
  targetSafePerDay: number;
  // ROI/Payback
  paybackMonths: number;
  isPaybackInfinity: boolean;
  estimatedProfitMonth: number;
  capexTotal: number;
  // Data yang digunakan
  openDaysCount: number;
  operatingDaysPerMonth: number;
  pricingModeLabel: string;
  channelFeePercent: number;
  wastePercent: number;
}

export function FinancialAnalysis({
  bepUnitsPerDay,
  bepUnitsPerMonth,
  isBepInfinity,
  fixedCostMonthly,
  opexMonthly,
  capexDepreciationMonthly,
  contributionMargin,
  targetSafePerDay,
  paybackMonths,
  isPaybackInfinity,
  estimatedProfitMonth,
  capexTotal,
  openDaysCount,
  operatingDaysPerMonth,
  pricingModeLabel,
  channelFeePercent,
  wastePercent,
}: FinancialAnalysisProps) {
  return (
    <Card className='border-primary/20'>
      <CardHeader className='pb-2'>
        <CardTitle className='text-base'>📊 Analisis Keuangan</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Section 1: BEP Operasional */}
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <TrendingUp className='text-primary h-5 w-5' />
            <span className='font-medium'>BEP Operasional</span>
          </div>

          <div className='bg-muted/50 space-y-2 rounded-lg p-3'>
            <div className='flex justify-between text-sm'>
              <span>BEP/hari</span>
              <span className={`font-bold ${isBepInfinity ? 'text-red-600' : ''}`}>
                {isBepInfinity ? 'Tidak tercapai' : `${bepUnitsPerDay} porsi`}
              </span>
            </div>
            <div className='flex justify-between text-sm'>
              <span>BEP/bulan</span>
              <span className='font-medium'>
                {isBepInfinity ? '-' : `${bepUnitsPerMonth} porsi`}
              </span>
            </div>
          </div>

          {/* Fixed Cost Breakdown */}
          <div className='space-y-2 text-sm'>
            <p className='text-muted-foreground'>Biaya Tetap Bulanan:</p>
            <div className='grid grid-cols-2 gap-2'>
              <div className='bg-background rounded-lg p-2'>
                <p className='text-muted-foreground text-xs'>OPEX/bulan</p>
                <p className='font-medium'>{formatCurrency(opexMonthly)}</p>
              </div>
              <div className='bg-background rounded-lg p-2'>
                <p className='text-muted-foreground text-xs'>Depresiasi/bulan</p>
                <p className='font-medium'>{formatCurrency(capexDepreciationMonthly)}</p>
              </div>
            </div>
            <div className='bg-primary/10 flex justify-between rounded-lg p-2'>
              <span className='font-medium'>Total Biaya Tetap</span>
              <span className='font-bold'>{formatCurrency(fixedCostMonthly)}</span>
            </div>
          </div>

          {/* Untung Kotor dan Target Aman */}
          <div className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span className='flex items-center gap-1'>Untung Kotor/Porsi</span>
              <span className={`font-bold ${contributionMargin <= 0 ? 'text-red-600' : ''}`}>
                {formatCurrency(contributionMargin)}
              </span>
            </div>
            <div className='flex items-center justify-between rounded-lg bg-green-50 p-2 text-sm dark:bg-green-950/30'>
              <span className='flex items-center gap-1'>
                <Shield className='h-4 w-4 text-green-600' />
                Target Aman
              </span>
              <Badge variant='default' className='bg-green-600'>
                {targetSafePerDay} porsi/hari
              </Badge>
            </div>
          </div>
        </div>

        {/* Section 2: Balik Modal (ROI/Payback) */}
        <div className='space-y-3 border-t pt-4'>
          <div className='flex items-center gap-2'>
            <Calendar className='text-primary h-5 w-5' />
            <span className='font-medium'>Balik Modal (ROI)</span>
          </div>

          <div className='bg-muted/50 space-y-2 rounded-lg p-3'>
            <div className='flex justify-between text-sm'>
              <span>Waktu Balik Modal</span>
              <span
                className={`text-lg font-bold ${isPaybackInfinity ? 'text-red-600' : 'text-primary'}`}
              >
                {isPaybackInfinity ? 'Belum balik modal' : `${paybackMonths} bulan`}
              </span>
            </div>
            <div className='flex justify-between text-sm'>
              <span>Estimasi Profit/bulan</span>
              <span
                className={`font-medium ${estimatedProfitMonth <= 0 ? 'text-red-600' : 'text-green-600'}`}
              >
                {formatCurrency(estimatedProfitMonth)}
              </span>
            </div>
            <div className='flex justify-between text-sm'>
              <span>CAPEX Total</span>
              <span className='font-medium'>{formatCurrency(capexTotal)}</span>
            </div>
          </div>

          <p className='text-muted-foreground text-center text-xs'>
            Berdasarkan Target Aman (BEP + 20%)
          </p>
        </div>

        {/* Data yang digunakan (Collapsible) */}
        <Accordion type='single' collapsible className='bg-background rounded-lg'>
          <AccordionItem value='data-used' className='border-0'>
            <AccordionTrigger className='px-3 py-2 text-sm hover:no-underline'>
              <span className='flex items-center gap-2'>
                <Info className='h-4 w-4' />
                Data yang digunakan
              </span>
            </AccordionTrigger>
            <AccordionContent className='px-3 pb-3'>
              <ul className='text-muted-foreground space-y-1 text-xs'>
                <li>
                  • Hari buka: {openDaysCount} hari/minggu → {operatingDaysPerMonth} hari/bulan
                </li>
                <li>• Biaya operasional/bulan: {formatCurrency(opexMonthly)}</li>
                <li>• Depresiasi alat/bulan: {formatCurrency(capexDepreciationMonthly)}</li>
                <li>• Mode harga: {pricingModeLabel}</li>
                <li>• Biaya platform: {channelFeePercent}% (belum diatur)</li>
                <li>• Bahan terbuang: {wastePercent}% (belum diatur)</li>
              </ul>
              <p className='text-muted-foreground mt-2 text-xs italic'>
                Anda bisa melengkapi pengaturan ini nanti di dashboard.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
