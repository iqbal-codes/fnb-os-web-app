'use client';

import { useEffect } from 'react';
import { useCurrentUser } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useCurrentUser();
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    setLoading(isLoading);

    if (!isLoading) {
      if (data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    }
  }, [data, isLoading, setUser, setLoading]);

  return <>{children}</>;
}
