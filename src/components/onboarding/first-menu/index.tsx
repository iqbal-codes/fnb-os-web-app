'use client';

import { useState } from 'react';
import { useFieldArray, Controller, useFormContext, useWatch } from 'react-hook-form';
import { UtensilsCrossed, Plus, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { calculateMenuCOGS, calculateIngredientCost } from '@/lib/businessLogic';
import type { OnboardingFormValues } from '@/components/onboarding/types';

import { IngredientRow } from './IngredientRow';
import { CogsResult } from './CogsResult';

const CATEGORY_OPTIONS = ['minuman', 'makanan', 'snack', 'dessert'];
const MARGIN_OPTIONS = [30, 35, 40, 45, 50, 55, 60, 65];

// Ingredient breakdown type
export interface IngredientCostBreakdown {
  name: string;
  cost: number;
}

interface FirstMenuSetupProps {
  onBack?: () => void;
  onNext: () => void;
}

// Helper to round to nearest 1000 (always up)
const roundToNearest1000 = (value: number): number => {
  return Math.ceil(value / 1000) * 1000;
};

// Header component
const FirstMenuHeader = () => (
  <div>
    <h3 className='flex items-center gap-2 font-semibold'>
      <UtensilsCrossed className='text-primary h-5 w-5' />
      Buat Menu Pertama
    </h3>
    <p className='text-muted-foreground text-sm'>Buat satu menu contoh dengan resepnya</p>
  </div>
);
FirstMenuHeader.displayName = 'FirstMenuHeader';

export function FirstMenuSetup({ onNext, onBack }: FirstMenuSetupProps) {
  const [isCalculated, setIsCalculated] = useState(false);
  const [selectedMargin, setSelectedMargin] = useState(50);
  const [ingredientBreakdown, setIngredientBreakdown] = useState<IngredientCostBreakdown[]>([]);

  const { control, setValue, getValues } = useFormContext<OnboardingFormValues>();

  const estimatedCogs = useWatch({ control, name: 'menuData.estimatedCogs' });
  const suggestedPrice = useWatch({ control, name: 'menuData.suggestedPrice' });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'menuData.ingredients',
  });

  const addIngredient = () => {
    append({
      id: `custom-${Date.now()}`,
      name: '',
      usageQuantity: 0,
      usageUnit: 'gram',
      isDifferentUnit: false,
      isAiSuggested: false,
      buyingQuantity: 0,
      buyingUnit: 'gram',
      buyingPrice: 0,
    });
  };

  // Calculate suggested price based on COGS and margin
  const calculateSuggestedPrice = (cogs: number, margin: number): number => {
    // Price = COGS / (1 - margin%)
    // e.g., COGS=5000, margin=50% => Price = 5000 / 0.5 = 10000
    const price = cogs / (1 - margin / 100);
    return roundToNearest1000(price);
  };

  const handleCalculate = () => {
    const data = getValues('menuData');
    if (data.ingredients.length === 0) {
      toast.error('Tambahkan minimal 1 bahan');
      return;
    }

    // Calculate breakdown for each ingredient (only material costs)
    const breakdown = data.ingredients.map((ing) => ({
      name: ing.name || 'Bahan tanpa nama',
      cost: calculateIngredientCost(ing),
    }));
    setIngredientBreakdown(breakdown);

    // Calculate total COGS (only material costs)
    const calculatedCogs = calculateMenuCOGS(data.ingredients);
    const newSuggestedPrice = calculateSuggestedPrice(calculatedCogs, selectedMargin);

    // Update Form
    setValue('menuData.estimatedCogs', calculatedCogs);
    setValue('menuData.suggestedPrice', newSuggestedPrice);

    setIsCalculated(true);
    toast.success('COGS & Harga berhasil dihitung!');
  };

  // Recalculate price when margin changes (only if already calculated)
  const handleMarginChange = (margin: number) => {
    setSelectedMargin(margin);
    if (isCalculated && estimatedCogs) {
      const newSuggestedPrice = calculateSuggestedPrice(estimatedCogs, margin);
      setValue('menuData.suggestedPrice', newSuggestedPrice);
    }
  };

  const handleNextClick = () => {
    if (!isCalculated) {
      toast.error("Mohon klik 'Cek COGS & Harga' terlebih dahulu");
      return;
    }
    onNext();
  };

  return (
    <div className='space-y-4'>
      <FirstMenuHeader />

      <div className='space-y-4'>
        {/* Menu Name */}
        <div className='space-y-2'>
          <Label>Nama Menu *</Label>
          <Controller
            name='menuData.name'
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder='e.g., Es Kopi Susu' value={field.value || ''} />
            )}
          />
        </div>

        {/* Category */}
        <div className='space-y-2'>
          <Label>Kategori</Label>
          <Controller
            name='menuData.category'
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder='Pilih kategori' />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Description (Optional) */}
        <div className='space-y-2'>
          <Label>Deskripsi (Opsional)</Label>
          <Controller
            name='menuData.description'
            control={control}
            render={({ field }) => (
              <Input {...field} placeholder='Deskripsi singkat menu...' value={field.value || ''} />
            )}
          />
        </div>

        {/* Ingredients */}
        <div className='space-y-2'>
          <Label>Bahan-bahan</Label>
          {fields.length === 0 ? (
            <div className='text-muted-foreground bg-muted/20 rounded-lg border border-dashed py-6 text-center text-sm'>
              Belum ada bahan. Tambahkan bahan utama untuk mendapatkan estimasi COGS & Harga.
            </div>
          ) : (
            <div className='space-y-3'>
              {fields.map((field, index) => (
                <IngredientRow key={field.id} index={index} remove={remove} />
              ))}
            </div>
          )}
          <Button variant='outline' className='w-full' onClick={addIngredient}>
            <Plus className='mr-2 h-4 w-4' />
            Tambah Bahan
          </Button>
        </div>
      </div>
      <Separator />

      {/* Logic to Show Calculation Button or Results */}
      {!isCalculated ? (
        <Button
          variant='secondary'
          className='border-primary/20 hover:border-primary/50 w-full border-2'
          onClick={handleCalculate}
          disabled={fields.length === 0}
        >
          <Calculator className='mr-2 h-4 w-4' />
          Cek COGS & Estimasi Harga
        </Button>
      ) : (
        <CogsResult
          ingredientBreakdown={ingredientBreakdown}
          estimatedCogs={estimatedCogs || 0}
          suggestedPrice={suggestedPrice || 0}
          selectedMargin={selectedMargin}
          marginOptions={MARGIN_OPTIONS}
          onMarginChange={handleMarginChange}
          onEditIngredients={() => setIsCalculated(false)}
        />
      )}

      {/* Action Buttons */}
      <div className='flex gap-3 pt-2'>
        {onBack && (
          <Button variant='outline' className='flex-1' onClick={onBack}>
            Kembali
          </Button>
        )}
        <Button className='flex-1' onClick={handleNextClick} disabled={!isCalculated}>
          Simpan Menu & Lanjut
        </Button>
      </div>
    </div>
  );
}
