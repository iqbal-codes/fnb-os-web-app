'use client';

import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UNIT_CATEGORIES, getUnitCategory } from '@/lib/businessLogic';
import type { OnboardingFormValues } from '@/components/onboarding/types';

// Helper to get buying options based on usage unit category
const getBuyingOptions = (usageUnit: string) => {
  const cat = getUnitCategory(usageUnit);
  if (cat === 'unknown') return UNIT_CATEGORIES.unit.units;
  return UNIT_CATEGORIES[cat].units;
};

interface IngredientRowProps {
  index: number;
  remove: (index: number) => void;
}

export function IngredientRow({ index, remove }: IngredientRowProps) {
  const { control, setValue, getValues } = useFormContext<OnboardingFormValues>();

  // Watch fields needed for logic
  const usageUnit = useWatch({ control, name: `menuData.ingredients.${index}.usageUnit` });
  const isDifferentUnit = useWatch({
    control,
    name: `menuData.ingredients.${index}.isDifferentUnit`,
  });
  const usageQuantity = useWatch({ control, name: `menuData.ingredients.${index}.usageQuantity` });

  // Custom handlers to preserve syncing logic
  const handleUsageQuantityChange = (val: number | undefined) => {
    const value = val || 0;
    setValue(`menuData.ingredients.${index}.usageQuantity`, value);

    if (!isDifferentUnit) {
      setValue(`menuData.ingredients.${index}.buyingQuantity`, value);
    }
  };

  const handleUsageUnitChange = (val: string) => {
    setValue(`menuData.ingredients.${index}.usageUnit`, val);

    if (!isDifferentUnit) {
      setValue(`menuData.ingredients.${index}.buyingUnit`, val);
    } else {
      // Auto-adjust Buying Unit options if Usage Unit changes (ONLY if Different Unit is active)
      const newCategory = getUnitCategory(val);
      if (newCategory !== 'unknown') {
        const defaultBuyUnit =
          newCategory === 'mass' ? 'kg' : newCategory === 'volume' ? 'liter' : 'pack';

        const currentBuyUnit = getValues(`menuData.ingredients.${index}.buyingUnit`);
        const currentBuyCategory = currentBuyUnit ? getUnitCategory(currentBuyUnit) : undefined;
        if (currentBuyCategory !== newCategory) {
          setValue(`menuData.ingredients.${index}.buyingUnit`, defaultBuyUnit);
        }
      }
    }
  };

  const handleIsDifferentUnitChange = (checked: boolean) => {
    setValue(`menuData.ingredients.${index}.isDifferentUnit`, checked);

    if (!checked) {
      // Sync immediately when toggling OFF
      const currentUsageQty = getValues(`menuData.ingredients.${index}.usageQuantity`);
      const currentUsageUnit = getValues(`menuData.ingredients.${index}.usageUnit`);
      setValue(`menuData.ingredients.${index}.buyingQuantity`, currentUsageQty);
      setValue(`menuData.ingredients.${index}.buyingUnit`, currentUsageUnit);
    } else {
      // Toggle ON: Set defaults if needed
      const currentBuyingQty = getValues(`menuData.ingredients.${index}.buyingQuantity`);
      if (!currentBuyingQty) {
        setValue(`menuData.ingredients.${index}.buyingQuantity`, 1);
      }

      const currentUsageUnit = getValues(`menuData.ingredients.${index}.usageUnit`);
      const cat = getUnitCategory(currentUsageUnit);
      if (cat !== 'unknown') {
        const defaultBuy = cat === 'mass' ? 'kg' : cat === 'volume' ? 'liter' : 'pack';
        const currentBuyUnit = getValues(`menuData.ingredients.${index}.buyingUnit`);
        const currentBuyCat = currentBuyUnit ? getUnitCategory(currentBuyUnit) : undefined;

        if (currentBuyCat !== cat) {
          setValue(`menuData.ingredients.${index}.buyingUnit`, defaultBuy);
        }
      } else {
        setValue(`menuData.ingredients.${index}.buyingUnit`, currentUsageUnit);
      }
    }
  };

  return (
    <Card className='overflow-hidden border shadow-sm'>
      <CardContent className='space-y-3 p-4'>
        {/* Top Row: Name & Usage */}
        <div>
          <div className='flex flex-col gap-2'>
            <div className='flex flex-1 flex-row items-end gap-2'>
              <div className='flex-1 space-y-1.5'>
                <Label className='text-muted-foreground text-xs font-medium'>Nama Bahan</Label>
                <Controller
                  name={`menuData.ingredients.${index}.name`}
                  render={({ field }) => (
                    <Input {...field} placeholder='Nama bahan' className='w-full' />
                  )}
                />
              </div>
              <div className='flex justify-end'>
                <Button
                  variant='secondary'
                  size='icon'
                  className='text-muted-foreground hover:text-destructive'
                  onClick={() => remove(index)}
                >
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>
            </div>
            <div className='flex flex-row gap-2'>
              <div className='flex-1/2 space-y-1.5'>
                <Label className='text-muted-foreground text-xs font-medium'>Pakai</Label>

                <NumberInput
                  value={usageQuantity}
                  onValueChange={handleUsageQuantityChange}
                  placeholder='0'
                  allowDecimals
                />
              </div>
              <div className='flex-1/2 space-y-1.5'>
                <Label className='text-muted-foreground text-xs font-medium'>Satuan</Label>
                <Select value={usageUnit} onValueChange={handleUsageUnitChange}>
                  <SelectTrigger className='flex-1/2'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <div className='text-muted-foreground px-2 py-1.5 text-xs font-semibold'>
                      Berat
                    </div>
                    {UNIT_CATEGORIES.mass.units.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                    <div className='text-muted-foreground mt-1 border-t px-2 py-1.5 text-xs font-semibold'>
                      Volume
                    </div>
                    {UNIT_CATEGORIES.volume.units.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                    <div className='text-muted-foreground mt-1 border-t px-2 py-1.5 text-xs font-semibold'>
                      Unit
                    </div>
                    {UNIT_CATEGORIES.unit.units.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: Buying Info (Bg muted) */}
        <div className='bg-muted/40 flex flex-col gap-2 rounded-lg border p-3 text-sm'>
          <div className='flex flex-col gap-2'>
            <div className='flex-1 space-y-1.5'>
              <Label className='text-muted-foreground text-xs font-medium'>Harga Bahan</Label>
              <Controller
                name={`menuData.ingredients.${index}.buyingPrice`}
                render={({ field: { value, onChange } }) => (
                  <NumberInput
                    value={value || 0}
                    onValueChange={onChange}
                    placeholder='Harga Beli'
                    prefix='Rp '
                    thousandSeparator='.'
                    decimalSeparator=','
                  />
                )}
              />
            </div>
            <div className='flex flex-row items-center gap-2'>
              <Checkbox checked={isDifferentUnit} onCheckedChange={handleIsDifferentUnitChange} />
              <Label className='text-muted-foreground text-xs font-medium'>Beda satuan beli</Label>
            </div>
          </div>
          {isDifferentUnit && (
            <div className='flex flex-row items-center gap-2'>
              <div className='flex-1/2'>
                <Controller
                  name={`menuData.ingredients.${index}.buyingQuantity`}
                  render={({ field: { value, onChange } }) => (
                    <NumberInput value={value || 0} onValueChange={onChange} placeholder='Qty' />
                  )}
                />
              </div>

              <Controller
                name={`menuData.ingredients.${index}.buyingUnit`}
                render={({ field: { value, onChange } }) => (
                  <Select value={value || ''} onValueChange={onChange}>
                    <SelectTrigger className='flex-1/2'>
                      <SelectValue placeholder='Unit' />
                    </SelectTrigger>
                    <SelectContent>
                      {getBuyingOptions(usageUnit).map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}
          {isDifferentUnit && (
            <div className='text-muted-foreground text-xs italic'>
              * Masukkan info kemasan beli (misal: 1 kg seharga Rp 50.000)
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

IngredientRow.displayName = 'IngredientRow';
