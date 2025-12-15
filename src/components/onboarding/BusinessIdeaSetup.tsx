import { Building2, MapPin, Users } from 'lucide-react';
import { useFormContext, Controller } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import { businessTypes, operatingModels, teamSizes } from './constants';
// Import type from parent if needed, or just use general context
import type { OnboardingFormValues } from '@/components/onboarding/types';

interface BusinessIdeaSetupProps {
  onBack: () => void;
  onNext: () => void;
}

export function BusinessIdeaSetup({ onBack, onNext }: BusinessIdeaSetupProps) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<OnboardingFormValues>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ceritakan ide bisnis Anda</CardTitle>
        <CardDescription>Ini membantu AI memberikan rekomendasi</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <Label>Nama Bisnis (opsional)</Label>
          <Input placeholder='e.g., Kopi Nusantara' {...register('businessName')} />
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
          {errors.businessType && (
            <p className='text-destructive text-sm'>{errors.businessType.message}</p>
          )}
        </div>

        <div className='space-y-2'>
          <Label>Deskripsi Singkat</Label>
          <Textarea
            placeholder='Ceritakan konsep bisnis Anda...'
            rows={2}
            {...register('description')}
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label className='flex items-center gap-1'>
              <MapPin className='h-3 w-3' /> Lokasi
            </Label>
            <Input placeholder='Jakarta' {...register('location')} />
          </div>
          <div className='space-y-2'>
            <Label className='flex items-center gap-1'>
              <Building2 className='h-3 w-3' /> Model Operasi
            </Label>
            <Controller
              name='operatingModel'
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder='Pilih' />
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
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label className='flex items-center gap-1'>
              <Users className='h-3 w-3' /> Ukuran Tim
            </Label>
            <Controller
              name='teamSize'
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder='Pilih' />
                  </SelectTrigger>
                  <SelectContent>
                    {teamSizes.map((size) => (
                      <SelectItem key={size.value} value={size.value}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className='space-y-2'>
            <Label>Target Penjualan/Hari</Label>
            <Controller
              name='targetDailySales'
              control={control}
              render={({ field }) => (
                <NumberInput
                  value={field.value}
                  onValueChange={field.onChange}
                  min={1}
                  max={500}
                  thousandSeparator='.'
                  decimalSeparator=','
                  placeholder='30'
                />
              )}
            />
          </div>
        </div>

        <div className='mt-6 flex gap-3'>
          <Button variant='outline' className='flex-1' onClick={onBack} type='button'>
            Kembali
          </Button>
          <Button className='flex-1' onClick={onNext}>
            Lanjut
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
