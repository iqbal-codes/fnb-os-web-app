'use client';

import { useState, useEffect } from 'react';
import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  FinancialAssumptions,
  DEFAULT_ASSUMPTIONS,
  calculateFinancialMetrics,
  formatCurrency,
  formatPercent,
} from '@/lib/financialCalculations';

interface AssumptionEditorProps {
  assumptions: FinancialAssumptions;
  onAssumptionsChange: (assumptions: FinancialAssumptions) => void;
  // Current values for preview calculation
  priceSell: number;
  cogsPerPortion: number;
  opexMonthly: number;
  equipmentCost: number;
}

const PLATFORM_FEE_OPTIONS = [
  { value: 0, label: '0%', description: 'Penjualan langsung' },
  { value: 15, label: '15%', description: 'GoFood/GrabFood standar' },
  { value: 20, label: '20%', description: 'Rate umum platform' },
];

export function AssumptionEditor({
  assumptions,
  onAssumptionsChange,
  priceSell,
  cogsPerPortion,
  opexMonthly,
  equipmentCost,
}: AssumptionEditorProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FinancialAssumptions>(assumptions);

  // Reset draft when sheet opens
  useEffect(() => {
    if (open) {
      setDraft(assumptions);
    }
  }, [open, assumptions]);

  // Calculate current and preview metrics for comparison
  const currentMetrics = calculateFinancialMetrics(
    priceSell,
    cogsPerPortion,
    opexMonthly,
    equipmentCost,
    assumptions,
  );

  const previewMetrics = calculateFinancialMetrics(
    priceSell,
    cogsPerPortion,
    opexMonthly,
    equipmentCost,
    draft,
  );

  const handleApply = () => {
    onAssumptionsChange(draft);
    setOpen(false);
  };

  const handleReset = () => {
    setDraft(DEFAULT_ASSUMPTIONS);
  };

  const formatDelta = (current: number, preview: number, isPercent = false): string => {
    const delta = preview - current;
    if (!isFinite(delta) || Math.abs(delta) < 0.1) return '';
    const sign = delta > 0 ? '+' : '';
    if (isPercent) {
      return `(${sign}${delta.toFixed(1)}%)`;
    }
    return `(${sign}${Math.round(delta)})`;
  };

  const getDeltaColor = (current: number, preview: number, higherIsBetter = true): string => {
    const delta = preview - current;
    if (!isFinite(delta) || Math.abs(delta) < 0.1) return 'text-muted-foreground';
    if (higherIsBetter) {
      return delta > 0 ? 'text-green-600' : 'text-red-600';
    }
    return delta < 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant='outline' size='sm' className='gap-2'>
          <Settings2 className='h-4 w-4' />
          Ubah Asumsi
        </Button>
      </SheetTrigger>
      <SheetContent side='bottom' className='h-[85vh] overflow-y-auto'>
        <SheetHeader>
          <SheetTitle>Ubah Asumsi Perhitungan</SheetTitle>
          <SheetDescription>
            Sesuaikan parameter untuk melihat dampak pada profitabilitas
          </SheetDescription>
        </SheetHeader>

        <div className='space-y-6 py-6'>
          {/* Target Penjualan */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <Label>Target Penjualan</Label>
              <span className='text-primary font-semibold'>
                {draft.cupsTargetPerDay} porsi/hari
              </span>
            </div>
            <Slider
              value={[draft.cupsTargetPerDay]}
              onValueChange={([value]) => setDraft({ ...draft, cupsTargetPerDay: value })}
              min={10}
              max={200}
              step={5}
            />
            <p className='text-muted-foreground text-xs'>10 - 200 porsi/hari</p>
          </div>

          {/* Hari Operasi */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <Label>Hari Operasi per Bulan</Label>
              <span className='text-primary font-semibold'>{draft.daysSellPerMonth} hari</span>
            </div>
            <Slider
              value={[draft.daysSellPerMonth]}
              onValueChange={([value]) => setDraft({ ...draft, daysSellPerMonth: value })}
              min={20}
              max={31}
              step={1}
            />
            <p className='text-muted-foreground text-xs'>20 - 31 hari/bulan</p>
          </div>

          {/* Platform Fee */}
          <div className='space-y-3'>
            <Label>Fee Platform (GoFood, GrabFood, dll.)</Label>
            <div className='grid grid-cols-3 gap-2'>
              {PLATFORM_FEE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type='button'
                  onClick={() => setDraft({ ...draft, platformFeePercent: option.value })}
                  className={`rounded-lg border p-3 text-center transition-all ${
                    draft.platformFeePercent === option.value
                      ? 'border-primary bg-primary/10'
                      : 'border-muted hover:border-muted-foreground/50'
                  }`}
                >
                  <p className='font-semibold'>{option.label}</p>
                  <p className='text-muted-foreground text-xs'>{option.description}</p>
                </button>
              ))}
            </div>
            <p className='text-muted-foreground text-xs'>
              💡 GoFood/GrabFood biasanya 15-20% dari harga jual
            </p>
          </div>

          {/* Waste / Spoilage */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <Label>Waste / Spoilage</Label>
              <span className='text-primary font-semibold'>{draft.wastePercent}%</span>
            </div>
            <Slider
              value={[draft.wastePercent]}
              onValueChange={([value]) => setDraft({ ...draft, wastePercent: value })}
              min={0}
              max={15}
              step={1}
            />
            <p className='text-muted-foreground text-xs'>
              0% - 15% (untuk bahan mudah busuk seperti susu segar)
            </p>
          </div>

          {/* Preview Changes */}
          <div className='bg-muted/50 rounded-lg border p-4'>
            <p className='mb-3 text-sm font-medium'>Pratinjau Perubahan:</p>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span>BEP Operasional</span>
                <span>
                  {currentMetrics.isBepInfinity ? '∞' : currentMetrics.bepCupsPerDay} →{' '}
                  <span
                    className={getDeltaColor(
                      currentMetrics.bepCupsPerDay,
                      previewMetrics.bepCupsPerDay,
                      false,
                    )}
                  >
                    {previewMetrics.isBepInfinity ? '∞' : previewMetrics.bepCupsPerDay} cups/hari
                  </span>
                </span>
              </div>
              <div className='flex justify-between'>
                <span>Balik Modal (ROI)</span>
                <span>
                  {currentMetrics.isPaybackInfinity ? '∞' : currentMetrics.paybackMonths} →{' '}
                  <span
                    className={getDeltaColor(
                      currentMetrics.paybackMonths,
                      previewMetrics.paybackMonths,
                      false,
                    )}
                  >
                    {previewMetrics.isPaybackInfinity ? '∞' : previewMetrics.paybackMonths} bulan
                  </span>
                </span>
              </div>
              <div className='flex justify-between'>
                <span>Net Margin</span>
                <span>
                  {formatPercent(currentMetrics.netMarginPercent)} →{' '}
                  <span
                    className={getDeltaColor(
                      currentMetrics.netMarginPercent,
                      previewMetrics.netMarginPercent,
                    )}
                  >
                    {formatPercent(previewMetrics.netMarginPercent)}{' '}
                    <span className='text-xs'>
                      {formatDelta(
                        currentMetrics.netMarginPercent,
                        previewMetrics.netMarginPercent,
                        true,
                      )}
                    </span>
                  </span>
                </span>
              </div>
              <div className='flex justify-between'>
                <span>Profit Bersih/Porsi</span>
                <span>
                  {formatCurrency(currentMetrics.netProfitPerPortion)} →{' '}
                  <span
                    className={getDeltaColor(
                      currentMetrics.netProfitPerPortion,
                      previewMetrics.netProfitPerPortion,
                    )}
                  >
                    {formatCurrency(previewMetrics.netProfitPerPortion)}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className='flex-row gap-2'>
          <Button variant='ghost' onClick={handleReset} className='flex-1'>
            Reset Default
          </Button>
          <Button variant='outline' onClick={() => setOpen(false)} className='flex-1'>
            Batal
          </Button>
          <Button onClick={handleApply} className='flex-1'>
            Terapkan
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
