'use client';

import { Wifi, WifiOff, Cloud } from 'lucide-react';
import { useOnlineStatus } from '@/components/providers/OnlineStatusProvider';
import { cn } from '@/lib/utils';

export function OfflineIndicator() {
  const { isOnline, wasOffline, pendingSyncCount } = useOnlineStatus();

  if (isOnline && !wasOffline && pendingSyncCount === 0) {
    return null;
  }

  // Regular div at top of page - not sticky
  // This pushes the entire page down when visible
  // The header in each page handles its own sticky behavior
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2 py-1.5 text-xs font-medium transition-all duration-300',
        !isOnline && 'bg-destructive text-white',
        isOnline && wasOffline && 'bg-green-500 text-white',
        isOnline && pendingSyncCount > 0 && 'bg-orange-500 text-white',
      )}
    >
      {!isOnline && (
        <>
          <WifiOff className='h-3.5 w-3.5' />
          <span>Anda sedang offline – data akan disinkronkan saat terhubung</span>
        </>
      )}
      {isOnline && wasOffline && (
        <>
          <Wifi className='h-3.5 w-3.5' />
          <span>Kembali online – menyinkronkan data...</span>
        </>
      )}
      {isOnline && !wasOffline && pendingSyncCount > 0 && (
        <>
          <Cloud className='h-3.5 w-3.5 animate-pulse' />
          <span>Menyinkronkan {pendingSyncCount} item...</span>
        </>
      )}
    </div>
  );
}
