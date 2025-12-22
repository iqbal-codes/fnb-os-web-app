import { useEffect, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useUpdateOnboardingState } from '@/hooks/useOnboarding';
import type { OnboardingFormValues } from '@/components/onboarding/types';

interface FormPersistenceProps {
  mode: 'selection' | 'new' | 'existing';
  step: number;
  maxReachedStep: number;
  userId: string;
  enabled?: boolean;
}

export function FormPersistence({
  mode,
  step,
  maxReachedStep,
  userId,
  enabled = true,
}: FormPersistenceProps) {
  const { control } = useFormContext<OnboardingFormValues>();
  const formValues = useWatch({ control });
  const lastSavedRef = useRef<string>('');

  const { mutate: saveState } = useUpdateOnboardingState();

  useEffect(() => {
    // 1. Cleanup old generic key if it exists
    if (localStorage.getItem('EFENBI_ONBOARDING_STATE')) {
      localStorage.removeItem('EFENBI_ONBOARDING_STATE');
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (mode === 'selection' && step === 1) return;
    if (!userId) return;

    const state = {
      mode,
      step,
      maxReachedStep,
      formValues,
      updatedAt: new Date().toISOString(),
    };

    const stateString = JSON.stringify(state);

    // Prevent redundant saves
    if (stateString === lastSavedRef.current) return;
    lastSavedRef.current = stateString;

    // 2. Save to LocalStorage (Immediate & Sync)
    const key = `EFENBI_ONBOARDING_STATE_${userId}`;
    localStorage.setItem(key, stateString);

    // 3. Save to Supabase via API (Debounced)
    const timer = setTimeout(() => {
      saveState(state);
    }, 1000);

    return () => clearTimeout(timer);
  }, [mode, step, formValues, maxReachedStep, userId, saveState, enabled]);

  return null;
}
