'use client';

import { useFormContext, Controller, useWatch } from 'react-hook-form';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { businessTypes } from '@/components/onboarding/constants';
import type { OnboardingFormValues } from '@/components/onboarding/types';

interface ExistingBusinessSetupProps {
  onNext: () => void;
  onBack: () => void;
}

export function ExistingBusinessSetup({ onNext, onBack }: ExistingBusinessSetupProps) {
  const { control, register } = useFormContext<OnboardingFormValues>();

  // Watch only what's needed for UI feedback locally
  const businessType = useWatch({ control, name: 'businessType' });
  const targetDailySales = useWatch({ control, name: 'targetDailySales' });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Bisnis</CardTitle>
        <CardDescription>Data dasar bisnis Anda</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <Label>Nama Bisnis *</Label>
          <Input placeholder='e.g., Warung Kopi Pak Haji' {...register('businessName')} />
        </div>

        <div className='space-y-2'>
          <Label>Tipe Bisnis *</Label>
          <Controller
            name='businessType'
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder='Pilih tipe bisnis' />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className='flex items-center gap-2'>
                        <span>{type.icon}</span>
                        <span>{type.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className='space-y-2'>
          <Label>Lokasi</Label>
          <Input placeholder='Jakarta' {...register('location')} />
        </div>

        <div className='space-y-2'>
          <Label>Rata-rata Penjualan/Hari (opsional)</Label>
          <div className='flex items-center gap-2'>
            <Controller
              name='targetDailySales'
              control={control}
              render={({ field }) => (
                <Slider
                  min={5}
                  max={200}
                  step={5}
                  value={[field.value ?? 30]}
                  onValueChange={(v) => field.onChange(v[0])}
                  className='flex-1'
                />
              )}
            />
            <span className='w-16 text-right text-sm font-medium'>
              {targetDailySales || 30} /hari
            </span>
          </div>
        </div>

        <div className='mt-6 flex gap-3'>
          <Button variant='outline' className='flex-1' onClick={onBack}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Kembali
          </Button>
          <Button className='flex-1' onClick={onNext} disabled={!businessType}>
            Lanjut
            <ArrowRight className='ml-2 h-4 w-4' />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
