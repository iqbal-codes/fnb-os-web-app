import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Business } from "@/types";

interface AuthState {
  user: {
    id: string;
    email: string;
  } | null;
  business: Business | null;
  isLoading: boolean;
  isOnline: boolean;

  // Actions
  setUser: (user: AuthState["user"]) => void;
  setBusiness: (business: Business | null) => void;
  setLoading: (loading: boolean) => void;
  setOnline: (online: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      business: null,
      isLoading: true,
      isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,

      setUser: (user) => set({ user }),
      setBusiness: (business) => set({ business }),
      setLoading: (isLoading) => set({ isLoading }),
      setOnline: (isOnline) => set({ isOnline }),
      logout: () => set({ user: null, business: null }),
    }),
    {
      name: "sajiplan-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        business: state.business,
      }),
    }
  )
);

