'use client';

import { useEffect, useState } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function OfflineIndicator() {
  // Use lazy initialization to avoid setState in effect
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        toast.success('Koneksi kembali!', {
          description: 'Data akan disinkronkan',
          icon: <Wifi className='h-4 w-4' />,
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      toast.warning('Mode Offline', {
        description: 'Beberapa fitur mungkin terbatas',
        icon: <WifiOff className='h-4 w-4' />,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  if (isOnline) return null;

  return (
    <div className='animate-fade-in fixed top-0 right-0 left-0 z-[60] flex items-center justify-center gap-2 bg-yellow-500 px-4 py-1.5 text-center text-sm font-medium text-yellow-950'>
      <WifiOff className='h-4 w-4' />
      <span>Mode Offline - Data tersimpan lokal</span>
    </div>
  );
}

/**
 * Hook to check online status
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Pull-to-refresh component for mobile
 */
export function PullToRefresh({ children }: { children: React.ReactNode }) {
  const [refreshing, setRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const [pulling, setPulling] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
      setPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!pulling) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;

    if (diff > 80 && !refreshing) {
      setRefreshing(true);
      // Trigger refresh
      window.location.reload();
    }
  };

  const handleTouchEnd = () => {
    setPulling(false);
  };

  return (
    <div onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      {refreshing && (
        <div className='bg-background fixed top-0 right-0 left-0 z-50 flex items-center justify-center py-4'>
          <RefreshCw className='text-primary h-5 w-5 animate-spin' />
        </div>
      )}
      {children}
    </div>
  );
}

/**
 * Sync status indicator for offline operations
 */
export function SyncStatus({
  pendingCount = 0,
  isSyncing = false,
  className,
}: {
  pendingCount?: number;
  isSyncing?: boolean;
  className?: string;
}) {
  if (pendingCount === 0 && !isSyncing) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full px-2 py-1 text-xs',
        isSyncing ? 'bg-blue-500/10 text-blue-600' : 'bg-orange-500/10 text-orange-600',
        className,
      )}
    >
      {isSyncing ? (
        <>
          <RefreshCw className='h-3 w-3 animate-spin' />
          <span>Menyinkronkan...</span>
        </>
      ) : (
        <>
          <WifiOff className='h-3 w-3' />
          <span>{pendingCount} transaksi menunggu</span>
        </>
      )}
    </div>
  );
}
