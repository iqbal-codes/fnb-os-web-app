'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChefHat, Sparkles, Store, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

import { useAuthStore } from '@/stores/authStore';
import { useOnboardingState } from '@/hooks/useOnboarding';
import { useCreateBusiness } from '@/hooks/useBusiness';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

// Onboarding step components
import { OpexSetup } from '@/components/onboarding/OpexSetup';
import { EquipmentSetup } from '@/components/onboarding/EquipmentSetup';
import { FirstMenuSetup } from '@/components/onboarding/first-menu';
import { PlanningSummary } from '@/components/onboarding/planning-summary';
import { BusinessIdeaSetup } from '@/components/onboarding/BusinessIdeaSetup';
import { BulkMenuInput } from '@/components/onboarding/BulkMenuInput';
import { ExistingBusinessSetup } from '@/components/onboarding/ExistingBusinessSetup';
import { OnboardingSuccess } from '@/components/onboarding/OnboardingSuccess';
import { FormPersistence } from '@/components/onboarding/FormPersistence';

// Schema and types
import { onboardingSchema } from '@/components/onboarding/schema';
import type { OnboardingFormValues, OnboardingMode } from '@/components/onboarding/types';

// Re-export for child components that need the type
export type { OnboardingFormValues } from '@/components/onboarding/types';

const PATH_A_STEPS = 5;
const PATH_B_STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const createBusiness = useCreateBusiness();

  // Get state from URL (Source of Truth)
  const modeParam = searchParams.get('mode') as OnboardingMode | null;
  const stepParam = searchParams.get('step');

  const mode: OnboardingMode =
    modeParam && ['new', 'existing'].includes(modeParam) ? modeParam : 'selection';
  const step = stepParam ? parseInt(stepParam, 10) : 1;

  const [maxReachedStep, setMaxReachedStep] = useState(1);
  const [isHydrated, setIsHydrated] = useState(false);

  // Initialize Form
  const methods = useForm<OnboardingFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(onboardingSchema) as any,
    defaultValues: {
      businessName: '',
      businessType: undefined,
      description: '',
      location: '',
      operatingModel: '',
      teamSize: '',
      targetDailySales: undefined,
      targetMargin: 50,
      opexData: [],
      equipmentData: [],
      menuData: {
        name: '',
        category: 'minuman',
        description: '',
        ingredients: [],
        estimatedCogs: 0,
        suggestedPrice: 0,
      },
      bulkMenus: [],
    },
    mode: 'onChange',
  });

  const { setValue, trigger, getValues } = methods;
  // Removed top-level watch to prevent full page re-renders

  const totalSteps = mode === 'new' ? PATH_A_STEPS : PATH_B_STEPS;
  const progress = (step / totalSteps) * 100;

  const { user } = useAuthStore();
  const userId = user?.id;

  // React Query for Remote State
  const { data: remoteStateResponse } = useOnboardingState();
  const remoteState = remoteStateResponse?.data;

  // Load state on mount - sync with Supabase and LocalStorage
  useEffect(() => {
    const restoreState = async () => {
      // Must wait for user to be checked
      if (userId === undefined) return;
      if (!userId) {
        // Handle case if no user but on this page? Middleware prevents this, but safe to check.
        setIsHydrated(true);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let finalState: any = null;

      // 1. Try LocalStorage (Fastest)
      const localKey = `SAJIPLAN_ONBOARDING_STATE_${userId}`;
      const localSaved = localStorage.getItem(localKey);
      const localState = localSaved ? JSON.parse(localSaved) : null;

      // 2. Compare with Remote (from React Query)
      // We only run this logic if we have remote state or if we are sure remote state is empty/loaded
      // For now, let's treat the query data as available if the hook executed.

      if (
        remoteState &&
        (!localState || new Date(remoteState.updatedAt) > new Date(localState.updatedAt))
      ) {
        finalState = remoteState;
        // Sync back to local
        localStorage.setItem(localKey, JSON.stringify(remoteState));
      } else {
        finalState = localState;
      }

      // 3. Restore
      if (finalState) {
        try {
          // Restore Form Values
          if (finalState.formValues) {
            Object.keys(finalState.formValues).forEach((key) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              setValue(key as keyof OnboardingFormValues, finalState.formValues[key] as any);
            });
          }

          // Restore Max Step
          if (finalState.maxReachedStep) {
            setMaxReachedStep(finalState.maxReachedStep);
          }
        } catch (e) {
          console.error('Failed to parse final state', e);
        }
      }

      // 5. Enable Validation
      setIsHydrated(true);
    };

    restoreState();
  }, [setValue, userId, remoteState]);

  // Validation: Prevent URL jumping - simplified
  // Validation: Prevent URL jumping and invalid steps
  useEffect(() => {
    if (!isHydrated) return;
    if (mode === 'selection') return;

    const effectiveLimit = Math.min(maxReachedStep, totalSteps);

    if (step < 1) {
      router.replace(`${pathname}?mode=${mode}&step=1`);
    } else if (step > effectiveLimit) {
      router.replace(`${pathname}?mode=${mode}&step=${effectiveLimit}`);
      toast.error('Selesaikan langkah sebelumnya terlebih dahulu');
    }
  }, [step, maxReachedStep, totalSteps, mode, router, pathname, isHydrated]);

  const updateUrl = (newMode: OnboardingMode, newStep: number) => {
    const params = new URLSearchParams(searchParams);
    if (newMode === 'selection') {
      params.delete('mode');
      params.delete('step');
    } else {
      params.set('mode', newMode);
      params.set('step', newStep.toString());
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleModeSelect = (selectedMode: 'new' | 'existing') => {
    setMaxReachedStep(1);
    updateUrl(selectedMode, 1);
  };

  const handleBack = () => {
    if (step <= 1) {
      updateUrl('selection', 1);
    } else {
      updateUrl(mode, step - 1);
    }
  };

  const validateStep = async () => {
    let isValid = false;
    const values = getValues();

    if (mode === 'new') {
      switch (step) {
        case 1: // Business Idea
          isValid = await trigger(['businessType']); // At least businessType is usually required, but schema says optional? schema in components enforced it.
          // Let's enforce strictly if needed.
          if (!values.businessType) {
            // trigger might pass if schema allows optional, so explicit check
            toast.error('Pilih tipe bisnis terlebih dahulu');
            return false;
          }
          isValid = true;
          break;
        case 2: // OPEX
          // Opex is optional strictly speaking, but maybe good to hav some check?
          // Assuming always valid for now as it can be empty
          isValid = true;
          break;
        case 3: // Equipment
          isValid = true;
          break;
        case 4: // Menu
          // Check if name and category are filled
          if (!values.menuData.name) {
            toast.error('Nama menu wajib diisi');
            return false;
          }
          if (!values.menuData.ingredients || values.menuData.ingredients.length === 0) {
            toast.error('Tambahkan minimal 1 bahan');
            return false;
          }
          isValid = true;
          break;
        default:
          isValid = true;
      }
    } else {
      // Mode Existing
      if (step === 1) {
        isValid = await trigger(['businessName', 'businessType']);
      } else {
        isValid = true;
      }
    }
    return isValid;
  };

  const handleNext = async () => {
    if (step < totalSteps) {
      const isValid = await validateStep();
      if (!isValid) return;

      const nextStep = step + 1;
      setMaxReachedStep(Math.max(maxReachedStep, nextStep));
      updateUrl(mode, nextStep);
    }
  };

  const handleComplete = async () => {
    const values = getValues();
    try {
      await createBusiness.mutateAsync({
        name: values.businessName || 'My F&B Business',
        type: values.businessType!,
        description: values.description,
        location: values.location,
        targetMargin: values.targetMargin,
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

  // --- Renderers ---

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

          <Card className='cursor-not-allowed border-2 opacity-20 transition-all hover:shadow-lg'>
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

  // --- Wrap everything else in FormProvider ---
  return (
    <FormProvider {...methods}>
      <FormPersistence
        mode={mode}
        step={step}
        maxReachedStep={maxReachedStep}
        userId={userId || ''}
      />
      <div className='animate-fade-in'>
        {/* Progress Helper */}
        <div className='mb-6'>
          <div className='mb-2 flex items-center justify-between'>
            <span className='text-muted-foreground text-sm'>
              Langkah {step} dari {totalSteps}
            </span>
            <span className='text-primary text-sm font-medium'>
              {mode === 'new' ? 'Planning Mode' : 'Business Mode'}
            </span>
          </div>
          <Progress value={progress} className='h-2' />
        </div>

        {/* --- PATH A: NEW BUSINESS --- */}
        {mode === 'new' && (
          <>
            {step === 1 && <BusinessIdeaSetup onBack={handleBack} onNext={handleNext} />}

            {step === 2 && <OpexSetup onBack={handleBack} onNext={handleNext} />}

            {step === 3 && <EquipmentSetup onBack={handleBack} onNext={handleNext} />}

            {step === 4 && <FirstMenuSetup onBack={handleBack} onNext={handleNext} />}

            {step === 5 && <PlanningSummary onComplete={handleComplete} onBack={handleBack} />}
          </>
        )}

        {/* --- PATH B: EXISTING BUSINESS --- */}
        {mode === 'existing' && (
          <>
            {step === 1 && <ExistingBusinessSetup onNext={handleNext} onBack={handleBack} />}

            {step === 2 && (
              <BulkMenuInput
                onSave={(menus) => {
                  setValue('bulkMenus', menus);
                  handleNext();
                }}
                onBack={handleBack}
              />
            )}

            {step === 3 && <OpexSetup onBack={handleBack} onNext={handleNext} />}

            {step === 4 && <OnboardingSuccess onBack={handleBack} onComplete={handleComplete} />}
          </>
        )}
      </div>
    </FormProvider>
  );
}
