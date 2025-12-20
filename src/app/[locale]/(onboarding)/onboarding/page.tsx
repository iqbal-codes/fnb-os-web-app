'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { useAuthStore } from '@/stores/authStore';
import { useOnboardingState } from '@/hooks/useOnboarding';
import { useCreateBusiness } from '@/hooks/useBusiness';
import { Progress } from '@/components/ui/progress';

// Onboarding step components
import { OpexSetup } from '@/components/onboarding/OpexSetup';
import { EquipmentSetup } from '@/components/onboarding/EquipmentSetup';
import { FirstMenuSetup } from '@/components/onboarding/first-menu';
import { PlanningSummary } from '@/components/onboarding/planning-summary';
import { BusinessIdeaSetup } from '@/components/onboarding/BusinessIdeaSetup';
import { FormPersistence } from '@/components/onboarding/FormPersistence';

// Schema and types
import { onboardingSchema } from '@/components/onboarding/schema';
import type { OnboardingFormValues } from '@/components/onboarding/types';

// Re-export for child components that need the type
export type { OnboardingFormValues } from '@/components/onboarding/types';

const TOTAL_STEPS = 5;

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const createBusiness = useCreateBusiness();

  // Get state from URL (Source of Truth)
  const stepParam = searchParams.get('step');
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
      city: '',
      operatingModel: '',
      operatingModelSecondary: '',
      openDays: [],
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

  const progress = (step / TOTAL_STEPS) * 100;

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

  // Validation: Prevent URL jumping and invalid steps
  useEffect(() => {
    if (!isHydrated) return;

    const effectiveLimit = Math.min(maxReachedStep, TOTAL_STEPS);

    if (step < 1) {
      router.replace(`${pathname}?step=1`);
    } else if (step > effectiveLimit) {
      router.replace(`${pathname}?step=${effectiveLimit}`);
      toast.error('Selesaikan langkah sebelumnya terlebih dahulu');
    }
  }, [step, maxReachedStep, router, pathname, isHydrated]);

  const updateUrl = (newStep: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('step', newStep.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleBack = () => {
    if (step > 1) {
      updateUrl(step - 1);
    }
  };

  const validateStep = async () => {
    let isValid = false;
    const values = getValues();

    switch (step) {
      case 1: // Business Idea
        isValid = await trigger(['businessType']);
        if (!values.businessType) {
          toast.error('Pilih tipe bisnis terlebih dahulu');
          return false;
        }
        isValid = true;
        break;
      case 2: // OPEX
        isValid = true;
        break;
      case 3: // Equipment
        isValid = true;
        break;
      case 4: // Menu
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
    return isValid;
  };

  const handleNext = async () => {
    if (step < TOTAL_STEPS) {
      const isValid = await validateStep();
      if (!isValid) return;

      const nextStep = step + 1;
      setMaxReachedStep(Math.max(maxReachedStep, nextStep));
      updateUrl(nextStep);
    }
  };

  const handleComplete = async () => {
    const values = getValues();
    try {
      await createBusiness.mutateAsync({
        name: values.businessName || 'My F&B Business',
        type: values.businessType!,
        location: values.city,
        isPlanningMode: true,
      });

      localStorage.removeItem('SAJIPLAN_ONBOARDING_STATE');
      toast.success('Business created successfully!');
      router.push('/planning');
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create business';
      toast.error(message);
    }
  };

  // --- Renderers ---

  // --- Wrap everything else in FormProvider ---
  return (
    <FormProvider {...methods}>
      <FormPersistence
        mode='new'
        step={step}
        maxReachedStep={maxReachedStep}
        userId={userId || ''}
      />
      <div className='animate-fade-in'>
        {/* Progress Helper */}
        <div className='mb-6'>
          <div className='mb-2 flex items-center justify-between'>
            <span className='text-muted-foreground text-sm'>
              Langkah {step} dari {TOTAL_STEPS}
            </span>
          </div>
          <Progress value={progress} className='h-2' />
        </div>

        {/* --- STEPS --- */}
        <>
          {step === 1 && <BusinessIdeaSetup onNext={handleNext} />}

          {step === 2 && <OpexSetup onBack={handleBack} onNext={handleNext} />}

          {step === 3 && <EquipmentSetup onBack={handleBack} onNext={handleNext} />}

          {step === 4 && <FirstMenuSetup onBack={handleBack} onNext={handleNext} />}

          {step === 5 && <PlanningSummary onComplete={handleComplete} onBack={handleBack} />}
        </>
      </div>
    </FormProvider>
  );
}
