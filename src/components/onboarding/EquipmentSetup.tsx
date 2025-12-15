'use client';

import { useFieldArray, Controller, useFormContext, useWatch } from 'react-hook-form';
import { Package, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Label } from '@/components/ui/label';
import type { OnboardingFormValues } from '@/components/onboarding/types';

interface EquipmentSetupProps {
  onBack?: () => void;
  onNext: () => void;
}

interface EquipmentRowProps {
  index: number;
  remove: (index: number) => void;
  canDelete?: boolean;
}

// React Compiler enabled - no manual memo needed
const EquipmentRow = ({ index, remove, canDelete = true }: EquipmentRowProps) => {
  return (
    <div className='bg-muted/40 flex flex-col gap-2 rounded-lg border p-3'>
      <div className='flex w-full flex-row items-center gap-2'>
        <div className='relative flex-1'>
          <Controller
            name={`equipmentData.${index}.name`}
            render={({ field }) => <Input {...field} placeholder='Nama Peralatan' />}
          />
        </div>
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
        <div className='flex-1/3'>
          <Label className='text-muted-foreground mb-1 block text-xs'>Qty</Label>
          <Controller
            name={`equipmentData.${index}.quantity`}
            render={({ field: { value, onChange } }) => (
              <NumberInput value={value} onValueChange={onChange} placeholder='0' min={1} />
            )}
          />
        </div>

        <div className='flex-2/3'>
          <Label className='text-muted-foreground mb-1 block text-xs'>Estimasi Harga</Label>
          <Controller
            name={`equipmentData.${index}.estimated_price`}
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
      </div>
    </div>
  );
};
EquipmentRow.displayName = 'EquipmentRow';

const EquipmentHeader = () => {
  return (
    <div className='flex items-center justify-between'>
      <div>
        <h3 className='flex items-center gap-2 font-semibold'>
          <Package className='text-primary h-5 w-5' />
          Peralatan Starter Kit
        </h3>
        <p className='text-muted-foreground text-sm'>Peralatan dasar untuk memulai bisnis</p>
      </div>
    </div>
  );
};
EquipmentHeader.displayName = 'EquipmentHeader';

interface EquipmentFooterProps {
  onBack?: () => void;
  onNext: () => void;
}

const EquipmentFooter = ({ onBack, onNext }: EquipmentFooterProps) => {
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
EquipmentFooter.displayName = 'EquipmentFooter';

const EquipmentTotal = () => {
  const { control } = useFormContext<OnboardingFormValues>();
  const equipment = useWatch({ control, name: 'equipmentData' });

  const calculateTotal = (items: typeof equipment) => {
    // Need to type items properly or let TS infer from useWatch but sometimes generic
    return (items || []).reduce((sum, item) => sum + item.quantity * item.estimated_price, 0);
  };

  return (
    <Card className='bg-primary/5 border-primary/20'>
      <CardContent className='p-4'>
        <div className='flex items-center justify-between'>
          <div>
            <span className='font-medium'>Estimasi Modal Peralatan</span>
            <p className='text-muted-foreground text-xs'>{(equipment || []).length} item dipilih</p>
          </div>
          <span className='text-primary text-xl font-bold'>
            Rp {calculateTotal(equipment).toLocaleString('id-ID')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
EquipmentTotal.displayName = 'EquipmentTotal';

export function EquipmentSetup({ onBack, onNext }: EquipmentSetupProps) {
  const { control } = useFormContext<OnboardingFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'equipmentData',
  });

  const addItem = () => {
    append({
      id: `custom-${Date.now()}`,
      name: '',
      quantity: 1,
      estimated_price: 0,
      priority: 'optional',
      isAiSuggested: false,
      isSelected: true,
    });
  };

  return (
    <div className='space-y-4'>
      <EquipmentHeader />

      <Card>
        <CardContent className='space-y-3 p-4'>
          {fields.map((field, index) => (
            <EquipmentRow key={field.id} index={index} remove={remove} />
          ))}

          <Button variant='outline' className='w-full border-dashed' onClick={addItem}>
            <Plus className='mr-2 h-4 w-4' />
            Tambah Peralatan
          </Button>
        </CardContent>
      </Card>

      {/* Total Cost */}
      <EquipmentTotal />

      <EquipmentFooter onBack={onBack} onNext={onNext} />
    </div>
  );
}
