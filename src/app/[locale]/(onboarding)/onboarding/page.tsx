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

const DEFAULT_FORM_VALUES: OnboardingFormValues = {
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
};

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
    defaultValues: DEFAULT_FORM_VALUES,
    mode: 'onChange',
  });

  const { trigger, getValues, reset } = methods;
  // Removed top-level watch to prevent full page re-renders

  const progress = (step / TOTAL_STEPS) * 100;

  const { user, isLoading: isAuthLoading } = useAuthStore();
  const userId = user?.id;

  // React Query for Remote State
  const { data: remoteStateResponse } = useOnboardingState();
  const remoteState = remoteStateResponse?.data;

  // Load state on mount - sync with Supabase and LocalStorage
  useEffect(() => {
    const restoreState = async () => {
      // 0. Wait for Auth to initialize
      if (isAuthLoading) return;

      // 1. Handle Guest / Not Logged In
      if (!userId) {
        // If no user, we can't restore specific state, but we should allow the form to function (without persistence)
        setIsHydrated(true);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let finalState: any = null;

      // 2. Try LocalStorage (Fastest)
      const localKey = `EFENBI_ONBOARDING_STATE_${userId}`;
      const localSaved = localStorage.getItem(localKey);

      let localState = null;
      try {
        localState = localSaved ? JSON.parse(localSaved) : null;
      } catch (err) {
        console.error('Failed to parse local state', err);
      }

      // 3. Compare with Remote (from React Query)
      if (
        remoteState &&
        (!localState || new Date(remoteState.updatedAt || 0) > new Date(localState?.updatedAt || 0))
      ) {
        finalState = remoteState;
        // Sync back to local
        localStorage.setItem(localKey, JSON.stringify(remoteState));
      } else {
        finalState = localState;
      }

      // 4. Restore
      if (finalState) {
        try {
          // Restore Form Values using reset to ensure atomic update
          if (finalState.formValues) {
            // Merge with defaults to ensure structure
            const mergedValues = {
              ...DEFAULT_FORM_VALUES,
              ...finalState.formValues,
            };
            reset(mergedValues);
          }

          // Restore Max Step
          if (finalState.maxReachedStep) {
            setMaxReachedStep(finalState.maxReachedStep);
          }
        } catch (e) {
          console.error('Failed to parse final state', e);
        }
      }

      // 5. Enable Validation and Persistence
      setIsHydrated(true);
    };

    restoreState();
  }, [userId, remoteState, reset, isAuthLoading]);

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

      localStorage.removeItem('EFENBI_ONBOARDING_STATE');
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
        enabled={isHydrated}
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
