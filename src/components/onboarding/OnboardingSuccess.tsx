'use client';

import { useFormContext, useWatch } from 'react-hook-form';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { OnboardingFormValues } from '@/components/onboarding/types';

interface OnboardingSuccessProps {
  onBack: () => void;
  onComplete: () => void;
}

export function OnboardingSuccess({ onBack, onComplete }: OnboardingSuccessProps) {
  const { control } = useFormContext<OnboardingFormValues>();

  const businessName = useWatch({ control, name: 'businessName' });
  const bulkMenus = useWatch({ control, name: 'bulkMenus' });
  const opexData = useWatch({ control, name: 'opexData' });

  const calculateOpexTotal = () => {
    return (opexData || []).reduce((sum, cat) => {
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
    <Card>
      <CardHeader>
        <CardTitle className='text-center'>Setup Selesai! 🎉</CardTitle>
        <CardDescription className='text-center'>Anda siap menggunakan SajiPlan</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='bg-muted/50 space-y-3 rounded-lg p-4'>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Bisnis</span>
            <span className='font-medium'>{businessName || '-'}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>Menu</span>
            <span className='font-medium'>{bulkMenus?.length || 0} item</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-muted-foreground'>OPEX Bulanan</span>
            <span className='font-medium'>Rp {calculateOpexTotal().toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div className='flex gap-3'>
          <Button variant='outline' className='flex-1' onClick={onBack}>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Kembali
          </Button>
          <Button className='flex-1' size='lg' onClick={onComplete}>
            Mulai Gunakan SajiPlan
            <ArrowRight className='ml-2 h-4 w-4' />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
