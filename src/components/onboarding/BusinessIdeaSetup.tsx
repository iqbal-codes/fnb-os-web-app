import { useMemo, useState, memo } from 'react';
import { useFormContext, Controller, useWatch } from 'react-hook-form';
import { Check, ChevronsUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { cn } from '@/lib/utils';
import { businessTypes, cities, operatingModels, daysOfWeek } from './constants';
import type { OnboardingFormValues } from '@/components/onboarding/types';

interface BusinessIdeaSetupProps {
  onNext: () => void;
}

function BusinessIdeaSetupComponent({ onNext }: BusinessIdeaSetupProps) {
  const {
    control,
    trigger,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext<OnboardingFormValues>();

  console.log('rerender');

  const [openType, setOpenType] = useState(false);
  const [openCity, setOpenCity] = useState(false);

  // Removed unused useWatch to prevent unnecessary re-renders
  // const businessName = useWatch({ control, name: 'businessName' });

  // const selectedPrimaryModel = getValues('operatingModel');

  // // Filter secondary models to exclude the primary one
  // const secondaryOperatingModels = useMemo(() => {
  //   return operatingModels.filter((m) => m.value !== selectedPrimaryModel);
  // }, [selectedPrimaryModel]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ceritakan detail bisnis Anda</CardTitle>
        <CardDescription>Informasi ini membantu AI menyesuaikan rekomendasi</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* 1. Nama Bisnis (Optional) */}
        <div className='space-y-2'>
          <Label className='flex items-center justify-between'>
            Nama Bisnis (opsional)
            <span className='text-muted-foreground text-xs font-normal'>
              Bisa diubah kapan saja
            </span>
          </Label>
          <Controller
            name='businessName'
            control={control}
            render={({ field }) => <Input placeholder='Contoh: Kopi Kenangan' {...field} />}
          />
          {errors.businessName && (
            <p className='text-destructive text-sm'>{errors.businessName.message}</p>
          )}
        </div>

        {/* 2. Tipe Bisnis (Required, Searchable) */}
        <div className='space-y-2'>
          <Label>
            Tipe Bisnis <span className='text-destructive'>*</span>
          </Label>
          <Controller
            name='businessType'
            control={control}
            render={({ field }) => (
              <Popover open={openType} onOpenChange={setOpenType}>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    role='combobox'
                    aria-expanded={openType}
                    className='w-full justify-between'
                  >
                    {field.value ? (
                      businessTypes.find((type) => type.value === field.value)?.label
                    ) : (
                      <div className='text-muted-foreground'>Pilih tipe bisnis...</div>
                    )}
                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-[--radix-popover-trigger-width] p-0' align='start'>
                  <Command>
                    <CommandInput placeholder='Cari tipe bisnis...' />
                    <CommandList>
                      <CommandEmpty>Tipe bisnis tidak ditemukan.</CommandEmpty>
                      <CommandGroup>
                        {businessTypes.map((type) => (
                          <CommandItem
                            key={type.value}
                            value={type.label} // Create fuzzy search on label
                            onSelect={() => {
                              field.onChange(type.value);
                              setOpenType(false);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                field.value === type.value ? 'opacity-100' : 'opacity-0',
                              )}
                            />
                            <span className='mr-2'>{type.icon}</span>
                            {type.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.businessType && (
            <p className='text-destructive text-sm'>{errors.businessType.message}</p>
          )}
        </div>

        {/* 3. Kota/Kabupaten (Searchable) */}
        <div className='space-y-2'>
          <Label>Kota/Kabupaten</Label>
          <Controller
            name='city'
            control={control}
            render={({ field }) => (
              <Popover open={openCity} onOpenChange={setOpenCity}>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    role='combobox'
                    aria-expanded={openCity}
                    className='w-full justify-between font-normal'
                  >
                    {field.value ? (
                      cities.find((c) => c.value === field.value)?.label
                    ) : (
                      <div className='text-muted-foreground'>Cari kota/kabupaten...</div>
                    )}
                    <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-[--radix-popover-trigger-width] p-0' align='start'>
                  <Command>
                    <CommandInput placeholder='Cari kota...' />
                    <CommandList>
                      <CommandEmpty>Kota tidak ditemukan.</CommandEmpty>
                      <CommandGroup>
                        {cities.map((city) => (
                          <CommandItem
                            key={city.value}
                            value={city.label}
                            onSelect={() => {
                              field.onChange(city.value);
                              setOpenCity(false);
                            }}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                field.value === city.value ? 'opacity-100' : 'opacity-0',
                              )}
                            />
                            {city.label}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          />
        </div>

        {/* 4. Model Operasi (Primary + Secondary) */}
        <div className='space-y-4'>
          {/* Primary Model */}
          <div className='space-y-2'>
            <Label>Model Operasi Utama</Label>
            <Controller
              name='operatingModel'
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder='Pilih model operasi' />
                  </SelectTrigger>
                  <SelectContent>
                    {operatingModels.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Secondary Model (Collapsible concept or just visible optional) */}
          {/* <div className='space-y-2'>
            <Label className='text-muted-foreground text-sm font-normal'>
              Model Tambahan (Opsional)
            </Label>
            <Controller
              name='operatingModelSecondary'
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!selectedPrimaryModel}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Pilih model tambahan (opsional)' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='none' className='text-muted-foreground font-normal italic'>
                      Tidak ada
                    </SelectItem>
                    {secondaryOperatingModels.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div> */}
        </div>

        {/* 5. Hari Buka (Days Selector) */}
        <div className='space-y-2'>
          <Label>Hari Buka</Label>
          <Controller
            name='openDays'
            control={control}
            render={({ field }) => (
              <div className='flex flex-wrap gap-2'>
                {daysOfWeek.map((day) => {
                  const isSelected = field.value?.includes(day.value);
                  return (
                    <div
                      key={day.value}
                      onClick={() => {
                        const current = field.value || [];
                        const newValue = isSelected
                          ? current.filter((v) => v !== day.value)
                          : [...current, day.value];
                        field.onChange(newValue.sort((a, b) => a - b));
                      }}
                      className={cn(
                        'cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-all select-none',
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
                          : 'bg-background text-muted-foreground border-input hover:bg-accent hover:text-accent-foreground',
                      )}
                    >
                      {day.label}
                    </div>
                  );
                })}
              </div>
            )}
          />
          <p className='text-muted-foreground text-xs'>
            Tentukan hari operasional Anda untuk perhitungan BEP yang lebih akurat.
          </p>
        </div>

        <div className='mt-6 pt-4'>
          <Button className='w-full' onClick={onNext}>
            Lanjut
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export const BusinessIdeaSetup = memo(BusinessIdeaSetupComponent);
