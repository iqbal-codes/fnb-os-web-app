'use client';

import { useState } from 'react';
import { DollarSign, TrendingDown, ListChecks, ChevronRight, Sparkles, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { formatCurrency, formatPercent, PriceSimulationResult } from '@/lib/financialCalculations';

// ─────────────────────────────────────────────────────────────────────────────
// Types for AI Suggestions
// ─────────────────────────────────────────────────────────────────────────────

export interface PriceOption {
  price: number;
  rationale: string;
  positioning: 'budget' | 'standard' | 'premium';
}

export interface PriceOptimizationSuggestion {
  roundedOptions: PriceOption[];
  recommendation: number;
  reasoning: string;
}

export interface CostSavingIdea {
  idea: string;
  estimatedImpact: 'low' | 'medium' | 'high';
  tradeOff: string;
}

export interface CostDriverSuggestion {
  topCostItem: string;
  percentOfTotal: number;
  savingIdeas: CostSavingIdea[];
}

export interface NextStepItem {
  step: string;
  priority: 'high' | 'medium' | 'low';
  isCompleted: boolean;
  whyImportant: string;
}

export interface NextStepsSuggestion {
  checklist: NextStepItem[];
  encouragement: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Static AI Suggestions (to be replaced with real AI later)
// ─────────────────────────────────────────────────────────────────────────────

export function generateMockPriceSuggestion(currentPrice: number): PriceOptimizationSuggestion {
  const roundedDown = Math.floor(currentPrice / 1000) * 1000;
  const roundedUp = Math.ceil(currentPrice / 1000) * 1000;
  const premium = roundedUp + 2000;

  return {
    roundedOptions: [
      {
        price: roundedDown > 0 ? roundedDown : roundedUp,
        rationale: 'Harga psikologis di bawah threshold - menarik untuk pelanggan sensitif harga.',
        positioning: 'budget',
      },
      {
        price: roundedUp,
        rationale: 'Harga bulat yang mudah diingat dan memberikan kembalian praktis.',
        positioning: 'standard',
      },
      {
        price: premium,
        rationale: 'Premium positioning dengan margin lebih tinggi - cocok untuk area perkantoran.',
        positioning: 'premium',
      },
    ],
    recommendation: roundedUp,
    reasoning: 'Harga bulat memberikan keseimbangan antara margin dan daya tarik pelanggan.',
  };
}

export function generateMockCostDriverSuggestion(
  topCostItem: string,
  percentOfTotal: number,
): CostDriverSuggestion {
  return {
    topCostItem,
    percentOfTotal,
    savingIdeas: [
      {
        idea: `Cari supplier alternatif untuk ${topCostItem} di pasar tradisional`,
        estimatedImpact: 'medium',
        tradeOff: 'Konsistensi stok mungkin bervariasi',
      },
      {
        idea: 'Beli dalam kemasan besar untuk harga lebih murah per unit',
        estimatedImpact: 'medium',
        tradeOff: 'Butuh modal dan tempat penyimpanan lebih besar',
      },
      {
        idea: 'Negosiasi harga langsung dengan distributor',
        estimatedImpact: 'high',
        tradeOff: 'Perlu minimum order quantity (MOQ)',
      },
    ],
  };
}

export function generateMockNextSteps(): NextStepsSuggestion {
  return {
    checklist: [
      {
        step: 'Finalisasi menu dan harga jual',
        priority: 'high',
        isCompleted: true,
        whyImportant: 'Dasar untuk semua perhitungan',
      },
      {
        step: 'Beli peralatan starter kit',
        priority: 'high',
        isCompleted: false,
        whyImportant: 'Modal awal yang harus dikeluarkan',
      },
      {
        step: 'Survei harga bahan di 3 supplier',
        priority: 'medium',
        isCompleted: false,
        whyImportant: 'Bisa hemat 10-20% dengan supplier tepat',
      },
      {
        step: 'Tentukan lokasi atau platform jualan',
        priority: 'medium',
        isCompleted: false,
        whyImportant: 'Mempengaruhi fee dan target market',
      },
    ],
    encouragement:
      'Anda sudah 60% siap! Fokus pada pembelian peralatan sebagai langkah berikutnya.',
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Component Props
// ─────────────────────────────────────────────────────────────────────────────

interface AISuggestionCardsProps {
  currentPrice: number;
  topCostDriver: { name: string; percentOfTotal: number } | null;
  // Simulation function to calculate metrics with different price
  simulatePrice: (price: number) => PriceSimulationResult;
  onApplyPrice: (price: number) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export function AISuggestionCards({
  currentPrice,
  topCostDriver,
  simulatePrice,
  onApplyPrice,
}: AISuggestionCardsProps) {
  const [activeSheet, setActiveSheet] = useState<'price' | 'cost' | 'steps' | null>(null);

  // Generate mock suggestions (will be replaced with real AI)
  const priceSuggestion = generateMockPriceSuggestion(currentPrice);
  const costSuggestion = topCostDriver
    ? generateMockCostDriverSuggestion(topCostDriver.name, topCostDriver.percentOfTotal)
    : null;
  const nextSteps = generateMockNextSteps();

  const positioningLabels = {
    budget: 'Hemat',
    standard: 'Standar',
    premium: 'Premium',
  };

  const impactColors = {
    low: 'bg-blue-100 text-blue-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-green-100 text-green-700',
  };

  const priorityColors = {
    high: 'text-red-600',
    medium: 'text-yellow-600',
    low: 'text-blue-600',
  };

  return (
    <>
      <div className='space-y-3'>
        <div className='flex items-center gap-2'>
          <Sparkles className='text-primary h-4 w-4' />
          <h3 className='text-sm font-semibold'>Saran AI</h3>
        </div>

        {/* Horizontal scroll container */}
        <div className='-mx-4 flex gap-3 overflow-x-auto px-4 pb-2'>
          {/* Card 1: Price Optimization */}
          <Card
            className='max-w-[200px] min-w-[200px] shrink-0 cursor-pointer transition-shadow hover:shadow-md'
            onClick={() => setActiveSheet('price')}
          >
            <CardContent className='p-4'>
              <div className='mb-3 flex items-center gap-2'>
                <div className='rounded-full bg-green-100 p-2'>
                  <DollarSign className='h-4 w-4 text-green-600' />
                </div>
                <span className='text-sm font-medium'>Optimasi Harga</span>
              </div>
              <p className='text-muted-foreground mb-3 line-clamp-2 text-xs'>
                {priceSuggestion.roundedOptions.map((o) => formatCurrency(o.price)).join(', ')}?
              </p>
              <div className='flex items-center justify-between'>
                <Badge variant='outline' className='text-xs'>
                  3 opsi
                </Badge>
                <ChevronRight className='text-muted-foreground h-4 w-4' />
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Cost Drivers */}
          {costSuggestion && (
            <Card
              className='max-w-[200px] min-w-[200px] shrink-0 cursor-pointer transition-shadow hover:shadow-md'
              onClick={() => setActiveSheet('cost')}
            >
              <CardContent className='p-4'>
                <div className='mb-3 flex items-center gap-2'>
                  <div className='rounded-full bg-amber-100 p-2'>
                    <TrendingDown className='h-4 w-4 text-amber-600' />
                  </div>
                  <span className='text-sm font-medium'>Biaya Terbesar</span>
                </div>
                <p className='text-muted-foreground mb-3 line-clamp-2 text-xs'>
                  {costSuggestion.topCostItem} ({costSuggestion.percentOfTotal.toFixed(0)}%)
                </p>
                <div className='flex items-center justify-between'>
                  <Badge variant='outline' className='text-xs'>
                    {costSuggestion.savingIdeas.length} ide hemat
                  </Badge>
                  <ChevronRight className='text-muted-foreground h-4 w-4' />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Card 3: Next Steps */}
          <Card
            className='max-w-[200px] min-w-[200px] shrink-0 cursor-pointer transition-shadow hover:shadow-md'
            onClick={() => setActiveSheet('steps')}
          >
            <CardContent className='p-4'>
              <div className='mb-3 flex items-center gap-2'>
                <div className='rounded-full bg-blue-100 p-2'>
                  <ListChecks className='h-4 w-4 text-blue-600' />
                </div>
                <span className='text-sm font-medium'>Langkah Selanjutnya</span>
              </div>
              <p className='text-muted-foreground mb-3 line-clamp-2 text-xs'>
                {nextSteps.checklist.filter((s) => s.isCompleted).length}/
                {nextSteps.checklist.length} selesai
              </p>
              <div className='flex items-center justify-between'>
                <Badge variant='outline' className='text-xs'>
                  Checklist
                </Badge>
                <ChevronRight className='text-muted-foreground h-4 w-4' />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Price Simulation Sheet */}
      <Sheet open={activeSheet === 'price'} onOpenChange={() => setActiveSheet(null)}>
        <SheetContent side='bottom' className='h-[80vh] overflow-y-auto'>
          <SheetHeader>
            <SheetTitle className='flex items-center gap-2'>
              <DollarSign className='h-5 w-5 text-green-600' />
              Simulasi Harga Jual
            </SheetTitle>
            <SheetDescription>
              Pilih harga yang sesuai dengan positioning bisnis Anda
            </SheetDescription>
          </SheetHeader>

          <div className='space-y-4 py-6'>
            <p className='text-muted-foreground text-sm'>{priceSuggestion.reasoning}</p>

            {priceSuggestion.roundedOptions.map((option) => {
              const sim = simulatePrice(option.price);
              const isRecommended = option.price === priceSuggestion.recommendation;

              return (
                <Card
                  key={option.price}
                  className={`transition-all ${isRecommended ? 'border-primary bg-primary/5' : ''}`}
                >
                  <CardContent className='p-4'>
                    <div className='mb-3 flex items-start justify-between'>
                      <div>
                        <div className='flex items-center gap-2'>
                          <span className='text-lg font-bold'>{formatCurrency(option.price)}</span>
                          {isRecommended && (
                            <Badge className='bg-primary text-xs'>Rekomendasi</Badge>
                          )}
                        </div>
                        <Badge variant='outline' className='mt-1 capitalize'>
                          {positioningLabels[option.positioning]}
                        </Badge>
                      </div>
                      <Button size='sm' onClick={() => onApplyPrice(option.price)}>
                        Pilih
                      </Button>
                    </div>

                    <p className='text-muted-foreground mb-3 text-sm'>{option.rationale}</p>

                    <div className='bg-muted/50 grid grid-cols-2 gap-2 rounded-lg p-3 text-sm'>
                      <div>
                        <p className='text-muted-foreground text-xs'>Profit/Porsi</p>
                        <p className='font-medium'>
                          {formatCurrency(sim.netProfitPerPortion)}
                          {sim.deltaProfit !== 0 && (
                            <span
                              className={`ml-1 text-xs ${sim.deltaProfit > 0 ? 'text-green-600' : 'text-red-600'}`}
                            >
                              ({sim.deltaProfit > 0 ? '+' : ''}
                              {formatCurrency(sim.deltaProfit)})
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className='text-muted-foreground text-xs'>Net Margin</p>
                        <p className='font-medium'>
                          {formatPercent(sim.netMarginPercent)}
                          {Math.abs(sim.deltaMargin) > 0.1 && (
                            <span
                              className={`ml-1 text-xs ${sim.deltaMargin > 0 ? 'text-green-600' : 'text-red-600'}`}
                            >
                              ({sim.deltaMargin > 0 ? '+' : ''}
                              {sim.deltaMargin.toFixed(1)}%)
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className='text-muted-foreground text-xs'>BEP</p>
                        <p className='font-medium'>
                          {sim.bepCupsPerDay === Infinity ? '∞' : `${sim.bepCupsPerDay} cups/hari`}
                        </p>
                      </div>
                      <div>
                        <p className='text-muted-foreground text-xs'>Balik Modal</p>
                        <p className='font-medium'>
                          {sim.paybackMonths === Infinity ? '∞' : `${sim.paybackMonths} bulan`}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Button variant='ghost' className='w-full' onClick={() => setActiveSheet(null)}>
            <X className='mr-2 h-4 w-4' />
            Tutup
          </Button>
        </SheetContent>
      </Sheet>

      {/* Cost Driver Sheet */}
      <Sheet open={activeSheet === 'cost'} onOpenChange={() => setActiveSheet(null)}>
        <SheetContent side='bottom' className='h-[70vh] overflow-y-auto'>
          <SheetHeader>
            <SheetTitle className='flex items-center gap-2'>
              <TrendingDown className='h-5 w-5 text-amber-600' />
              Analisis Biaya Terbesar
            </SheetTitle>
            <SheetDescription>Ide untuk mengurangi biaya bahan</SheetDescription>
          </SheetHeader>

          {costSuggestion && (
            <div className='space-y-4 py-6'>
              <div className='rounded-lg bg-amber-50 p-4'>
                <p className='text-sm'>
                  <span className='font-semibold'>{costSuggestion.topCostItem}</span> adalah{' '}
                  <span className='font-bold text-amber-700'>
                    {costSuggestion.percentOfTotal.toFixed(0)}%
                  </span>{' '}
                  dari total biaya bahan Anda.
                </p>
              </div>

              <div className='space-y-3'>
                <p className='text-sm font-medium'>Ide Penghematan:</p>
                {costSuggestion.savingIdeas.map((idea, idx) => (
                  <Card key={idx}>
                    <CardContent className='p-4'>
                      <div className='mb-2 flex items-start justify-between'>
                        <p className='flex-1 text-sm'>{idea.idea}</p>
                        <Badge className={`ml-2 shrink-0 ${impactColors[idea.estimatedImpact]}`}>
                          {idea.estimatedImpact === 'high'
                            ? 'Dampak Besar'
                            : idea.estimatedImpact === 'medium'
                              ? 'Dampak Sedang'
                              : 'Dampak Kecil'}
                        </Badge>
                      </div>
                      <p className='text-muted-foreground text-xs'>⚠️ {idea.tradeOff}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <Button variant='ghost' className='w-full' onClick={() => setActiveSheet(null)}>
            <X className='mr-2 h-4 w-4' />
            Tutup
          </Button>
        </SheetContent>
      </Sheet>

      {/* Next Steps Sheet */}
      <Sheet open={activeSheet === 'steps'} onOpenChange={() => setActiveSheet(null)}>
        <SheetContent side='bottom' className='h-[70vh] overflow-y-auto'>
          <SheetHeader>
            <SheetTitle className='flex items-center gap-2'>
              <ListChecks className='h-5 w-5 text-blue-600' />
              Langkah Selanjutnya
            </SheetTitle>
            <SheetDescription>Checklist untuk memulai bisnis Anda</SheetDescription>
          </SheetHeader>

          <div className='space-y-4 py-6'>
            <div className='rounded-lg bg-blue-50 p-4'>
              <p className='text-sm text-blue-800'>{nextSteps.encouragement}</p>
            </div>

            <div className='space-y-2'>
              {nextSteps.checklist.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 rounded-lg border p-3 ${
                    item.isCompleted ? 'bg-muted/50' : ''
                  }`}
                >
                  <div
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      item.isCompleted
                        ? 'border-green-500 bg-green-500 text-white'
                        : 'border-muted-foreground'
                    }`}
                  >
                    {item.isCompleted && <span className='text-xs'>✓</span>}
                  </div>
                  <div className='flex-1'>
                    <p
                      className={`text-sm font-medium ${item.isCompleted ? 'text-muted-foreground line-through' : ''}`}
                    >
                      {item.step}
                    </p>
                    <p className='text-muted-foreground text-xs'>{item.whyImportant}</p>
                  </div>
                  <Badge
                    variant='outline'
                    className={`shrink-0 text-xs ${priorityColors[item.priority]}`}
                  >
                    {item.priority === 'high'
                      ? 'Prioritas'
                      : item.priority === 'medium'
                        ? 'Penting'
                        : 'Opsional'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <Button variant='ghost' className='w-full' onClick={() => setActiveSheet(null)}>
            <X className='mr-2 h-4 w-4' />
            Tutup
          </Button>
        </SheetContent>
      </Sheet>
    </>
  );
}
