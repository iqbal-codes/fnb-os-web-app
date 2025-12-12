'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChefHat, Sparkles, Store, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

import { useCreateBusiness } from '@/hooks/useBusiness';
import { Ingredient } from '@/lib/businessLogic';
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
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';

// Onboarding step components
import { OpexSetup } from '@/components/onboarding/OpexSetup';
import { EquipmentSetup } from '@/components/onboarding/EquipmentSetup';
import { FirstMenuSetup } from '@/components/onboarding/FirstMenuSetup';
import { PlanningSummary } from '@/components/onboarding/PlanningSummary';
import { BusinessIdeaSetup } from '@/components/onboarding/BusinessIdeaSetup';
import { BulkMenuInput } from '@/components/onboarding/BulkMenuInput';
import { businessTypes, businessTypeValues } from '@/components/onboarding/constants';

// Constants
// Constants removed - imported from @/components/onboarding/constants

// Schema for Path A (New Business)
const newBusinessSchema = z.object({
  businessName: z.string().optional(),
  businessType: z.enum(businessTypeValues as unknown as [string, ...string[]]),
  description: z.string().optional(),
  location: z.string().optional(),
  operatingModel: z.string().optional(),
  teamSize: z.string().optional(),
  targetDailySales: z.number().min(1).max(500).optional(),
  targetMargin: z.number().min(10).max(80).optional(),
});

type NewBusinessFormData = z.infer<typeof newBusinessSchema>;
type OnboardingMode = 'selection' | 'new' | 'existing';

// Path A steps: 1=Idea, 2=OPEX, 3=Equipment, 4=Menu, 5=Ingredients(skip), 6=Summary
// Path B steps: 1=Basics, 2=BulkMenu, 3=OPEX, 4=Summary
const PATH_A_STEPS = 6;
const PATH_B_STEPS = 4;

interface OnboardingState {
  opexData: any[];
  equipmentData: any[];
  menuData: {
    name: string;
    cogs: number;
    suggestedPrice: number;
    ingredients: Ingredient[];
  };
  bulkMenus: any[];
}

export default function OnboardingPage() {
  const router = useRouter();
  const [mode, setMode] = useState<OnboardingMode>('selection');
  const [step, setStep] = useState(1);
  const createBusiness = useCreateBusiness();

  // Onboarding collected data
  const [onboardingData, setOnboardingData] = useState<OnboardingState>({
    opexData: [],
    equipmentData: [],
    menuData: { name: '', cogs: 0, suggestedPrice: 0, ingredients: [] },
    bulkMenus: [],
  });

  const { register, handleSubmit, control, watch, setValue } = useForm<NewBusinessFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(newBusinessSchema) as any,
    defaultValues: {
      businessName: '',
      businessType: undefined,
      description: '',
      location: '',
      operatingModel: '',
      teamSize: '',
      targetDailySales: 30,
      targetMargin: 30,
    },
    mode: 'onChange',
  });

  const formValues = watch();
  const totalSteps = mode === 'new' ? PATH_A_STEPS : PATH_B_STEPS;
  const progress = (step / totalSteps) * 100;

  // Load state on mount
  useEffect(() => {
    const saved = localStorage.getItem('SAJIPLAN_ONBOARDING_STATE');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.mode) setMode(parsed.mode);
        if (parsed.step) setStep(parsed.step);
        if (parsed.onboardingData) setOnboardingData(parsed.onboardingData);
        if (parsed.formValues) {
          // Reset form with saved values, but keep defaultValues for safety
          // We use a timeout to ensure form is ready
          setTimeout(() => {
            Object.keys(parsed.formValues).forEach((key) => {
              setValue(key as keyof NewBusinessFormData, parsed.formValues[key]);
            });
          }, 0);
        }
      } catch (e) {
        console.error('Failed to load state', e);
      }
    }
  }, [setValue]);

  // Save state
  useEffect(() => {
    if (mode === 'selection' && step === 1) return; // Don't save initial state if empty

    const state = {
      mode,
      step,
      onboardingData,
      formValues,
    };
    localStorage.setItem('SAJIPLAN_ONBOARDING_STATE', JSON.stringify(state));
  }, [mode, step, onboardingData, formValues]);

  const handleModeSelect = (selectedMode: 'new' | 'existing') => {
    setMode(selectedMode);
    setStep(1);
  };

  const handleBack = () => {
    if (step === 1) {
      setMode('selection');
    } else {
      setStep(step - 1);
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  // Calculate totals for summary
  const calculateOpexTotal = () => {
    return onboardingData.opexData.reduce((sum, cat: any) => {
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

  const calculateEquipmentTotal = () => {
    return onboardingData.equipmentData.reduce(
      (sum, eq: any) => sum + eq.quantity * eq.estimated_price,
      0,
    );
  };

  const handleComplete = async () => {
    try {
      await createBusiness.mutateAsync({
        name: formValues.businessName || 'My F&B Business',
        type: formValues.businessType,
        description: formValues.description,
        location: formValues.location,
        targetMargin: formValues.targetMargin,
        isPlanningMode: mode === 'new',
      });

      localStorage.removeItem('SAJIPLAN_ONBOARDING_STATE');
      toast.success('Business created successfully!');
      router.push(mode === 'new' ? '/planning' : '/dashboard');
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create business';
      toast.error(message);
    }
  };

  // Mode Selection Screen
  if (mode === 'selection') {
    return (
      <div className='animate-fade-in'>
        <div className='mb-8 text-center'>
          <ChefHat className='text-primary mx-auto mb-4 h-12 w-12' />
          <h1 className='mb-2 text-2xl font-bold'>Selamat Datang di SajiPlan!</h1>
          <p className='text-muted-foreground'>
            Plan, run, and optimize your F&B business with AI.
          </p>
        </div>

        <div className='grid gap-4'>
          <Card
            className='hover:border-primary/50 cursor-pointer border-2 transition-all hover:shadow-lg'
            onClick={() => handleModeSelect('new')}
          >
            <CardContent className='p-6'>
              <div className='flex items-start gap-4'>
                <div className='bg-primary/10 text-primary rounded-xl p-3'>
                  <Sparkles className='h-6 w-6' />
                </div>
                <div className='flex-1'>
                  <h3 className='mb-1 text-lg font-semibold'>Saya ingin memulai bisnis baru</h3>
                  <p className='text-muted-foreground text-sm'>
                    Dapatkan bantuan perencanaan modal, pricing, COGS, dan analisis BEP
                  </p>
                </div>
                <ArrowRight className='text-muted-foreground h-5 w-5' />
              </div>
            </CardContent>
          </Card>

          <Card
            className='hover:border-primary/50 cursor-pointer border-2 transition-all hover:shadow-lg'
            onClick={() => handleModeSelect('existing')}
          >
            <CardContent className='p-6'>
              <div className='flex items-start gap-4'>
                <div className='bg-chart-2/10 text-chart-2 rounded-xl p-3'>
                  <Store className='h-6 w-6' />
                </div>
                <div className='flex-1'>
                  <h3 className='mb-1 text-lg font-semibold'>Saya sudah punya bisnis</h3>
                  <p className='text-muted-foreground text-sm'>
                    Langsung ke POS, inventory tracking, dan business analytics
                  </p>
                </div>
                <ArrowRight className='text-muted-foreground h-5 w-5' />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ============ PATH A: NEW BUSINESS ============
  if (mode === 'new') {
    return (
      <div className='animate-fade-in'>
        {/* Progress */}
        <div className='mb-6'>
          <div className='mb-2 flex items-center justify-between'>
            <span className='text-muted-foreground text-sm'>
              Langkah {step} dari {totalSteps}
            </span>
            <span className='text-primary text-sm font-medium'>Planning Mode</span>
          </div>
          <Progress value={progress} className='h-2' />
        </div>

        {/* Step 1: Business Idea */}
        {step === 1 && (
          <BusinessIdeaSetup
            initialData={formValues}
            onSave={(data) => {
              // Update all fields
              setValue('businessName', data.businessName);
              setValue('businessType', data.businessType);
              setValue('description', data.description);
              setValue('location', data.location);
              setValue('operatingModel', data.operatingModel);
              setValue('teamSize', data.teamSize);
              setValue('targetDailySales', data.targetDailySales);
              handleNext();
            }}
            onBack={handleBack}
          />
        )}

        {/* Step 2: OPEX Setup */}
        {step === 2 && (
          <OpexSetup
            businessName={formValues.businessName}
            businessType={formValues.businessType || ''}
            description={formValues.description}
            location={formValues.location}
            operatingModel={formValues.operatingModel || ''}
            teamSize={formValues.teamSize}
            targetDailySales={formValues.targetDailySales}
            initialData={onboardingData.opexData}
            onSave={(data) => {
              setOnboardingData((prev) => ({ ...prev, opexData: data }));
              handleNext();
            }}
            onBack={handleBack}
          />
        )}

        {/* Step 3: Equipment Setup */}
        {step === 3 && (
          <EquipmentSetup
            businessName={formValues.businessName}
            businessType={formValues.businessType || ''}
            description={formValues.description}
            location={formValues.location}
            operatingModel={formValues.operatingModel || ''}
            teamSize={formValues.teamSize || ''}
            targetDailySales={formValues.targetDailySales}
            initialData={onboardingData.equipmentData}
            onSave={(data) => {
              setOnboardingData((prev) => ({ ...prev, equipmentData: data }));
              handleNext();
            }}
            onBack={handleBack}
          />
        )}

        {/* Step 4: First Menu */}
        {step === 4 && (
          <FirstMenuSetup
            businessType={formValues.businessType || ''}
            opexTotal={calculateOpexTotal()}
            targetDailySales={formValues.targetDailySales || 30}
            onSave={(data) => {
              setOnboardingData((prev) => ({
                ...prev,
                menuData: {
                  name: data.name,
                  cogs: data.estimatedCogs,
                  suggestedPrice: data.suggestedPrice,
                  ingredients: data.ingredients,
                },
              }));
              // Skip step 5 (ingredient prices are in menu), go to summary
              setStep(6);
            }}
            onBack={handleBack}
          />
        )}

        {/* Step 5: Ingredient Price (skipped, handled in Step 4) */}

        {/* Step 6: Summary */}
        {step === 6 && (
          <PlanningSummary
            businessName={formValues.businessName || 'Bisnis Anda'}
            menuData={onboardingData.menuData}
            opexTotal={calculateOpexTotal()}
            equipmentTotal={calculateEquipmentTotal()}
            targetDailySales={formValues.targetDailySales || 30}
            onComplete={handleComplete}
            onBack={handleBack}
          />
        )}

        {/* Navigation for Step 1 only - REMOVED as it's now inside BusinessIdeaSetup */}
      </div>
    );
  }

  // ============ PATH B: EXISTING BUSINESS ============
  if (mode === 'existing') {
    return (
      <div className='animate-fade-in'>
        {/* Progress */}
        <div className='mb-6'>
          <div className='mb-2 flex items-center justify-between'>
            <span className='text-muted-foreground text-sm'>
              Langkah {step} dari {totalSteps}
            </span>
            <span className='text-chart-2 text-sm font-medium'>Business Mode</span>
          </div>
          <Progress value={progress} className='h-2' />
        </div>

        {/* Step 1: Business Basics */}
        {step === 1 && (
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
                    {formValues.targetDailySales} /hari
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Bulk Menu Input */}
        {step === 2 && (
          <BulkMenuInput
            onSave={(menus) => {
              setOnboardingData((prev) => ({ ...prev, bulkMenus: menus }));
              handleNext();
            }}
            onBack={handleBack}
          />
        )}

        {/* Step 3: OPEX */}
        {step === 3 && (
          <OpexSetup
            businessType={formValues.businessType || ''}
            operatingModel='cafe'
            initialData={onboardingData.opexData}
            onSave={(data) => {
              setOnboardingData((prev) => ({ ...prev, opexData: data }));
              handleNext();
            }}
            onBack={handleBack}
          />
        )}

        {/* Step 4: Summary */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className='text-center'>Setup Selesai! 🎉</CardTitle>
              <CardDescription className='text-center'>
                Anda siap menggunakan SajiPlan
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='bg-muted/50 space-y-3 rounded-lg p-4'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Bisnis</span>
                  <span className='font-medium'>{formValues.businessName || '-'}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Menu</span>
                  <span className='font-medium'>{onboardingData.bulkMenus.length} item</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>OPEX Bulanan</span>
                  <span className='font-medium'>
                    Rp {calculateOpexTotal().toLocaleString('id-ID')}
                  </span>
                </div>
              </div>

              <div className='flex gap-3'>
                <Button variant='outline' className='flex-1' onClick={handleBack}>
                  <ArrowLeft className='mr-2 h-4 w-4' />
                  Kembali
                </Button>
                <Button className='flex-1' size='lg' onClick={handleComplete}>
                  Mulai Gunakan SajiPlan
                  <ArrowRight className='ml-2 h-4 w-4' />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation for Step 1 */}
        {step === 1 && (
          <div className='mt-6 flex gap-3'>
            <Button variant='outline' className='flex-1' onClick={handleBack}>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Kembali
            </Button>
            <Button className='flex-1' onClick={handleNext} disabled={!formValues.businessType}>
              Lanjut
              <ArrowRight className='ml-2 h-4 w-4' />
            </Button>
          </div>
        )}
      </div>
    );
  }

  return null;
}
