'use client';

import { useFieldArray, Controller, useFormContext, useWatch } from 'react-hook-form';
import { Banknote, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { OnboardingFormValues } from '@/components/onboarding/types';
import { useCallback, useEffect } from 'react';

interface OpexSetupProps {
  onBack: () => void;
  onNext: () => void;
}

const OpexHeader = () => {
  return (
    <div className='flex items-center justify-between'>
      <div>
        <h3 className='flex items-center gap-2 font-semibold'>
          <Banknote className='text-primary h-5 w-5' />
          Estimasi Biaya Operasional
        </h3>
        <p className='text-muted-foreground text-sm'>Atur estimasi OPEX bulanan Anda</p>
      </div>
    </div>
  );
};
OpexHeader.displayName = 'OpexHeader';

// No props needed for footer navigation really, passed from parent
interface OpexFooterProps {
  onBack?: () => void;
  onNext: () => void;
}

const OpexFooter = ({ onBack, onNext }: OpexFooterProps) => {
  return (
    <div className='flex gap-3'>
      {onBack && (
        <Button variant='outline' className='flex-1' onClick={onBack}>
          Kembali
        </Button>
      )}
      <Button className='flex-1' onClick={onNext}>
        Simpan & Lanjut
      </Button>
    </div>
  );
};
OpexFooter.displayName = 'OpexFooter';

const TotalMonthly = () => {
  const { control } = useFormContext<OnboardingFormValues>();

  const opexData = useWatch({ control, name: 'opexData' });

  // Calculate total whenever opexData changes
  const calculateMonthlyTotal = (categories: { amount: number; frequency: string }[]) => {
    return categories.reduce((sum, cat) => {
      const monthly =
        cat.frequency === 'daily'
          ? cat.amount * 30
          : cat.frequency === 'weekly'
            ? cat.amount * 4
            : cat.frequency === 'yearly'
              ? cat.amount / 12
              : cat.amount;
      return sum + monthly;
    }, 0);
  };

  return (
    <Card className='bg-primary/5 border-primary/20'>
      <CardContent className='p-4'>
        <div className='flex items-center justify-between'>
          <span className='font-medium'>Total OPEX Bulanan</span>
          <span className='text-primary text-xl font-bold'>
            Rp {calculateMonthlyTotal(opexData || []).toLocaleString('id-ID')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
TotalMonthly.displayName = 'TotalMonthly';

interface OpexCategoryRowProps {
  index: number;
  remove: (index: number) => void;
  canDelete: boolean;
}

const OpexCategoryRow = ({ index, remove, canDelete }: OpexCategoryRowProps) => {
  return (
    <div className='bg-muted/40 flex flex-col gap-2 rounded-lg border p-3'>
      <div className='flex w-full flex-row gap-2'>
        <Controller
          name={`opexData.${index}.name`}
          render={({ field }) => <Input {...field} placeholder='Nama OPEX (Contoh: Listrik)' />}
        />
        <Button
          size='icon'
          variant='secondary'
          className='text-destructive shrink-0'
          onClick={() => remove(index)}
          disabled={!canDelete}
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </div>
      <div className='flex flex-row gap-2'>
        <div className='flex-1/2'>
          <Controller
            name={`opexData.${index}.amount`}
            render={({ field: { value, onChange } }) => (
              <NumberInput
                value={value}
                onValueChange={onChange}
                placeholder='0'
                prefix='Rp '
                thousandSeparator='.'
                decimalSeparator=','
              />
            )}
          />
        </div>

        <div className='flex-1/2'>
          <Controller
            name={`opexData.${index}.frequency`}
            render={({ field: { value, onChange } }) => (
              <Select value={value} onValueChange={onChange}>
                <SelectTrigger className='w-full!'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='daily'>Harian</SelectItem>
                  <SelectItem value='weekly'>Mingguan</SelectItem>
                  <SelectItem value='monthly'>Bulanan</SelectItem>
                  <SelectItem value='yearly'>Tahunan</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>
    </div>
  );
};
OpexCategoryRow.displayName = 'OpexCategoryRow';

export function OpexSetup({ onBack, onNext }: OpexSetupProps) {
  const { control } = useFormContext<OnboardingFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'opexData',
  });

  const addCategory = useCallback(() => {
    append({
      id: `custom-${Date.now()}`,
      name: '',
      amount: 0,
      frequency: 'monthly',
    });
  }, [append]);

  useEffect(() => {
    if (fields.length === 0) {
      addCategory();
    }
  }, [fields.length, addCategory]);

  return (
    <div className='space-y-4'>
      <OpexHeader />

      <Card>
        <CardContent className='space-y-3 p-4'>
          {fields.map((field, index) => (
            <OpexCategoryRow
              key={field.id}
              index={index}
              remove={remove}
              canDelete={fields.length > 0} // Can delete all if wanted? Or require 1? Schema says array default is [] so ok.
            />
          ))}

          <Button variant='outline' className='w-full border-dashed' onClick={addCategory}>
            <Plus className='mr-2 h-4 w-4' />
            Tambah Kategori
          </Button>
        </CardContent>
      </Card>

      <TotalMonthly />

      <OpexFooter onBack={onBack} onNext={onNext} />
    </div>
  );
}
