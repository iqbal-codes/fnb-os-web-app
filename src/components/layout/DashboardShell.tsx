'use client';

import { useEffect } from 'react';
import type { BusinessType } from '@/types';
import { MobileNav } from '@/components/layout/MobileNav';
import { PWAInstallPrompt, IOSInstallBanner } from '@/components/pwa/PWAInstallPrompt';
import { OfflineIndicator } from '@/components/pwa/OfflineIndicator';
import { useBusiness } from '@/hooks/useBusiness';
import { useBusinessStore } from '@/stores/businessStore';

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const { data, isLoading } = useBusiness();
  const { setCurrentBusiness, setLoading } = useBusinessStore();

  useEffect(() => {
    if (data?.business) {
      setCurrentBusiness({
        ...data.business,
        type: data.business.type as BusinessType,
      });
    }
    setLoading(isLoading);
  }, [data, isLoading, setCurrentBusiness, setLoading]);
  return (
    <div className='min-h-screen pb-20'>
      {/* Offline status banner */}
      <OfflineIndicator />

      {/* Main content area */}
      <main className='container mx-auto max-w-lg px-4 py-4'>{children}</main>

      {/* Bottom navigation */}
      <MobileNav />

      {/* PWA install prompts */}
      <PWAInstallPrompt />
      <IOSInstallBanner />
    </div>
  );
}
