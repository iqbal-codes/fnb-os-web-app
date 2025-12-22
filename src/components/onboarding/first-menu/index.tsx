'use client';

import { useState } from 'react';
import { useFieldArray, Controller, useFormContext, useWatch } from 'react-hook-form';
import { UtensilsCrossed, Plus, Calculator, Pencil, Trash2, Package, ChefHat } from 'lucide-react';
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
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { toast } from 'sonner';
import { calculateMenuCOGS, calculateIngredientCost } from '@/lib/businessLogic';
import type { OnboardingFormValues, Ingredient } from '@/components/onboarding/types';

import { CogsResult } from './CogsResult';
import { IngredientDrawerForm } from './IngredientDrawerForm';

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
    <p className='text-muted-foreground text-sm'>Buat satu menu dengan resepnya</p>
  </div>
);
FirstMenuHeader.displayName = 'FirstMenuHeader';

export function FirstMenuSetup({ onNext, onBack }: FirstMenuSetupProps) {
  const [isCalculated, setIsCalculated] = useState(false);
  const [selectedMargin, setSelectedMargin] = useState(60);
  const [ingredientBreakdown, setIngredientBreakdown] = useState<IngredientCostBreakdown[]>([]);

  // Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const { control, setValue, getValues } = useFormContext<OnboardingFormValues>();

  const estimatedCogs = useWatch({ control, name: 'menuData.estimatedCogs' });
  const suggestedPrice = useWatch({ control, name: 'menuData.suggestedPrice' });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'menuData.ingredients',
  });

  // Calculate suggested price based on COGS and margin
  const calculateSuggestedPrice = (cogs: number, margin: number): number => {
    // Price = COGS / (1 - margin%)
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

  const handleSaveIngredient = (
    data: Omit<Ingredient, 'id' | 'isDifferentUnit' | 'isAiSuggested'>,
  ) => {
    const newIngredient: Ingredient = {
      id: editingIndex !== null ? fields[editingIndex].id : `custom-${Date.now()}`,
      isAiSuggested: false,
      // Calculate isDifferentUnit strictly primarily for data compatibility
      isDifferentUnit: true, // Always true in this new simplified flow as we capture both explicitly
      ...data,
    };

    if (editingIndex !== null) {
      update(editingIndex, newIngredient);
    } else {
      append(newIngredient);
    }
    setIsDrawerOpen(false);
    setEditingIndex(null);
    setIsCalculated(false); // Reset calculation on change
  };

  const openAddDrawer = () => {
    setEditingIndex(null);
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (index: number) => {
    setEditingIndex(index);
    setIsDrawerOpen(true);
  };

  return (
    <div className='space-y-4 overflow-y-auto'>
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

        {/* Ingredients List */}
        <div className='space-y-2'>
          <Label>Bahan-bahan & Kemasan</Label>
          {fields.length === 0 ? (
            <div className='text-muted-foreground bg-muted/20 flex flex-col items-center gap-2 rounded-lg border border-dashed py-8 text-center text-sm'>
              <UtensilsCrossed className='h-8 w-8 opacity-20' />
              <p>Belum ada bahan. Tambahkan bahan baku & kemasan.</p>
            </div>
          ) : (
            <div className='space-y-2'>
              {fields.map((field, index) => {
                // Calculate estimated cost for display
                const cost = calculateIngredientCost(field as Ingredient); // cast safe here
                return (
                  <div
                    key={field.id}
                    className='hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors'
                  >
                    <div className='flex items-center gap-3 overflow-hidden'>
                      <div className='bg-primary/10 text-primary rounded-full p-2'>
                        {field.category === 'packaging' ? (
                          <Package className='h-4 w-4' />
                        ) : (
                          <ChefHat className='h-4 w-4' />
                        )}
                      </div>
                      <div className='overflow-hidden'>
                        <p className='truncate font-medium'>
                          {field.name} @ ~Rp {Math.ceil(cost).toLocaleString('id-ID')}
                        </p>
                        <p className='text-muted-foreground text-xs'>
                          {field.usageQuantity} {field.usageUnit} • Harga: {field.buyingQuantity}{' '}
                          {field.buyingUnit} @ {field.buyingPrice?.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center gap-1'>
                      <Button
                        size='icon'
                        variant='ghost'
                        className='h-8 w-8'
                        onClick={() => openEditDrawer(index)}
                      >
                        <Pencil className='h-4 w-4' />
                      </Button>
                      <Button
                        size='icon'
                        variant='ghost'
                        className='text-destructive hover:text-destructive h-8 w-8'
                        onClick={() => remove(index)}
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Button variant='outline' className='mt-2 w-full' onClick={openAddDrawer}>
            <Plus className='mr-2 h-4 w-4' />
            Tambah Bahan / Kemasan
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

      {/* INGREDIENT DRAWER */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className='mt-4'>
          {isDrawerOpen && (
            <IngredientDrawerForm
              defaultValues={editingIndex !== null ? fields[editingIndex] : undefined}
              onSave={handleSaveIngredient}
              onCancel={() => setIsDrawerOpen(false)}
            />
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
