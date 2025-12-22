'use client';

import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Package, ChefHat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NumberInput } from '@/components/ui/number-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UNIT_CATEGORIES, getUnitCategory } from '@/lib/businessLogic';
import type { Ingredient } from '@/components/onboarding/types';
import { DrawerFooter } from '@/components/ui/drawer';
import { useState, useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';

const ingredientSchema = z
  .object({
    name: z.string().min(1, 'Nama bahan wajib diisi'),
    category: z.enum(['ingredient', 'packaging']),
    buyingQuantity: z.number().optional(),
    buyingUnit: z.string().optional(),
    buyingPrice: z.number().optional(),
    usageQuantity: z.number().optional(),
    usageUnit: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.category === 'ingredient') {
      if (!data.buyingQuantity) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Jumlah wajib diisi',
          path: ['buyingQuantity'],
        });
      }
      if (!data.buyingUnit) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Satuan wajib dipilih',
          path: ['buyingUnit'],
        });
      }
      if (!data.usageQuantity) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Jumlah pakai wajib diisi',
          path: ['usageQuantity'],
        });
      }
      if (!data.usageUnit) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Satuan pakai wajib dipilih',
          path: ['usageUnit'],
        });
      }
    }
  });

type IngredientFormValues = z.infer<typeof ingredientSchema>;

interface IngredientDrawerFormProps {
  defaultValues?: Partial<Ingredient>;
  onSave: (data: IngredientFormValues) => void;
  onCancel: () => void;
}

export function IngredientDrawerForm({
  defaultValues,
  onSave,
  onCancel,
}: IngredientDrawerFormProps) {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<IngredientFormValues>({
    resolver: zodResolver(ingredientSchema),
    defaultValues: {
      name: '',
      category: 'ingredient',
      buyingQuantity: undefined,
      buyingUnit: undefined,
      buyingPrice: undefined,
      usageQuantity: undefined,
      usageUnit: undefined,
      ...defaultValues,
    },
  });

  const [isDifferentUnit, setIsDifferentUnit] = useState(defaultValues?.isDifferentUnit || false);

  const selectedCategory = useWatch({ control, name: 'category' });
  const buyingUnit = useWatch({ control, name: 'buyingUnit' });

  // Determine allowed usage units
  const buyingUnitCategory = useMemo(() => {
    if (!buyingUnit) return null;
    return getUnitCategory(buyingUnit);
  }, [buyingUnit]);

  const handleCategoryChange = (val: 'ingredient' | 'packaging') => {
    setValue('category', val);
    // Reset values
    setValue('buyingQuantity', undefined);
    setValue('buyingUnit', '');
    setValue('buyingPrice', undefined);
    setValue('usageQuantity', undefined);
    setValue('usageUnit', '');
    setIsDifferentUnit(false);
  };

  const handleBuyingUnitChange = (val: string) => {
    setValue('buyingUnit', val);

    const cat = getUnitCategory(val);
    if (cat === 'unit') {
      setIsDifferentUnit(false);
    }

    // Reset usage info
    setValue('usageQuantity', undefined);
    setValue('usageUnit', '');

    setIsDifferentUnit(false);
  };

  const onSubmit = (data: IngredientFormValues) => {
    // If Packaging, force 1:1 structure
    if (data.category === 'packaging') {
      data.buyingQuantity = 1;
      data.buyingUnit = 'pcs';
      data.usageQuantity = 1;
      data.usageUnit = 'pcs';
    }

    // If not different unit (and not packaging), sync usage to buying
    if (data.category === 'ingredient' && !isDifferentUnit) {
      if (data.buyingQuantity && data.buyingUnit) {
        data.usageQuantity = data.buyingQuantity;
        data.usageUnit = data.buyingUnit;
      }
    }

    onSave({
      ...data,
      // Pass this back if needed by parent, though it's not in IngredientFormValues,
      // the parent might expect it merged or not.
      // We will stick to IngredientFormValues structure for now.
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className='space-y-4 px-4 pt-4 pb-2'>
        {/* Category Selection */}
        <div className='flex justify-center'>
          <Tabs
            value={selectedCategory}
            onValueChange={(v) => handleCategoryChange(v as 'ingredient' | 'packaging')}
            className='w-full'
          >
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='ingredient' className='flex items-center gap-2'>
                <ChefHat className='h-4 w-4' />
                Bahan Baku
              </TabsTrigger>
              <TabsTrigger value='packaging' className='flex items-center gap-2'>
                <Package className='h-4 w-4' />
                Kemasan
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Name */}
        <div className='space-y-2'>
          <Label>
            Nama {selectedCategory === 'packaging' ? 'Kemasan' : 'Bahan'}{' '}
            <span className='text-destructive'>*</span>
          </Label>
          <Controller
            name='name'
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                placeholder={
                  selectedCategory === 'ingredient' ? 'e.g. Tepung Terigu' : 'e.g. Cup 16oz'
                }
              />
            )}
          />
          {errors.name && <p className='text-destructive text-sm'>{errors.name.message}</p>}
        </div>

        {/* Buying Price */}
        <div className='space-y-2'>
          <Label className='text-xs'>
            {selectedCategory === 'packaging' ? 'Harga Satuan' : 'Harga'}{' '}
            <span className='text-destructive'>*</span>
          </Label>
          <Controller
            name='buyingPrice'
            control={control}
            render={({ field }) => (
              <NumberInput
                value={field.value}
                onValueChange={field.onChange}
                prefix='Rp '
                thousandSeparator='.'
                decimalSeparator=','
              />
            )}
          />
          {errors.buyingPrice && (
            <p className='text-destructive text-sm'>{errors.buyingPrice.message}</p>
          )}
        </div>

        {selectedCategory !== 'packaging' && (
          <div className='mb-2! grid grid-cols-2 gap-4'>
            {/* Buying Qty */}
            <div className='space-y-2'>
              <Label className='text-xs'>
                Jumlah <span className='text-destructive'>*</span>
              </Label>
              <Controller
                name='buyingQuantity'
                control={control}
                render={({ field }) => (
                  <NumberInput
                    value={field.value}
                    onValueChange={field.onChange}
                    decimalSeparator=','
                    thousandSeparator='.'
                    allowDecimals
                  />
                )}
              />
              {errors.buyingQuantity && (
                <p className='text-destructive text-xs'>{errors.buyingQuantity.message}</p>
              )}
            </div>

            {/* Buying Unit */}
            <div className='space-y-2'>
              <Label className='text-xs'>
                Satuan <span className='text-destructive'>*</span>
              </Label>
              <Controller
                name='buyingUnit'
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={handleBuyingUnitChange}>
                    <SelectTrigger>
                      <SelectValue placeholder='Pilih' />
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
                )}
              />
              {errors.buyingUnit && (
                <p className='text-destructive text-xs'>{errors.buyingUnit.message}</p>
              )}
            </div>
          </div>
        )}

        {selectedCategory !== 'packaging' && buyingUnitCategory !== 'unit' && buyingUnit && (
          <div className='flex flex-row items-center gap-2'>
            <Checkbox
              checked={isDifferentUnit}
              onCheckedChange={(checked) => setIsDifferentUnit(checked as boolean)}
            />
            <Label className='text-muted-foreground text-xs font-medium'>Beda satuan pakai</Label>
          </div>
        )}

        {selectedCategory !== 'packaging' && isDifferentUnit && (
          <>
            {/* Usage Info (Second) */}
            <div className='animate-in fade-in slide-in-from-top-1 grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label className='text-xs'>
                  Jumlah Pakai <span className='text-destructive'>*</span>
                </Label>
                <Controller
                  name='usageQuantity'
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      value={field.value}
                      onValueChange={field.onChange}
                      decimalSeparator=','
                      thousandSeparator='.'
                      allowDecimals
                    />
                  )}
                />
                {errors.usageQuantity && (
                  <p className='text-destructive text-xs'>{errors.usageQuantity.message}</p>
                )}
              </div>

              <div className='space-y-2'>
                <Label className='text-xs'>
                  Satuan Pakai <span className='text-destructive'>*</span>
                </Label>
                <Controller
                  name='usageUnit'
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder='Pilih' />
                      </SelectTrigger>
                      <SelectContent>
                        {(!buyingUnitCategory || buyingUnitCategory === 'mass') && (
                          <>
                            <div className='text-muted-foreground px-2 py-1.5 text-xs font-semibold'>
                              Berat
                            </div>
                            {UNIT_CATEGORIES.mass.units.map((u) => (
                              <SelectItem key={u} value={u}>
                                {u}
                              </SelectItem>
                            ))}
                          </>
                        )}

                        {(!buyingUnitCategory || buyingUnitCategory === 'volume') && (
                          <>
                            <div className='text-muted-foreground mt-1 border-t px-2 py-1.5 text-xs font-semibold'>
                              Volume
                            </div>
                            {UNIT_CATEGORIES.volume.units.map((u) => (
                              <SelectItem key={u} value={u}>
                                {u}
                              </SelectItem>
                            ))}
                          </>
                        )}

                        {(!buyingUnitCategory || buyingUnitCategory === 'unit') && (
                          <>
                            <div className='text-muted-foreground mt-1 border-t px-2 py-1.5 text-xs font-semibold'>
                              Unit
                            </div>
                            {UNIT_CATEGORIES.unit.units.map((u) => (
                              <SelectItem key={u} value={u}>
                                {u}
                              </SelectItem>
                            ))}
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.usageUnit && (
                  <p className='text-destructive text-xs'>{errors.usageUnit.message}</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      <DrawerFooter className='flex flex-row! gap-3'>
        <Button type='button' variant='outline' className='flex-1' onClick={onCancel}>
          Batal
        </Button>
        <Button type='submit' className='flex-1' disabled={!selectedCategory}>
          Simpan
        </Button>
      </DrawerFooter>
    </form>
  );
}
