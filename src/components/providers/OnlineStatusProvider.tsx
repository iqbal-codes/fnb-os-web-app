'use client';

import { useEffect, useState, createContext, useContext, type ReactNode } from 'react';
import { useAuthStore } from '@/stores/authStore';

interface OnlineStatusContextValue {
  isOnline: boolean;
  wasOffline: boolean;
  pendingSyncCount: number;
}

const OnlineStatusContext = createContext<OnlineStatusContextValue>({
  isOnline: true,
  wasOffline: false,
  pendingSyncCount: 0,
});

export function OnlineStatusProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );
  const [wasOffline, setWasOffline] = useState(false);
  const [pendingSyncCount] = useState(0);
  const setStoreOnline = useAuthStore((state) => state.setOnline);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setStoreOnline(true);
      setWasOffline(true);
      // Reset after showing reconnection message
      setTimeout(() => setWasOffline(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setStoreOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setStoreOnline]);

  return (
    <OnlineStatusContext.Provider value={{ isOnline, wasOffline, pendingSyncCount }}>
      {children}
    </OnlineStatusContext.Provider>
  );
}

export function useOnlineStatus() {
  return useContext(OnlineStatusContext);
}
