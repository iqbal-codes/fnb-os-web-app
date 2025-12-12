import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Business } from "@/types";

interface BusinessState {
  currentBusiness: Business | null;
  businesses: Business[];
  isLoading: boolean;

  // Actions
  setCurrentBusiness: (business: Business | null) => void;
  setBusinesses: (businesses: Business[]) => void;
  setLoading: (loading: boolean) => void;
  clearBusiness: () => void;
}

export const useBusinessStore = create<BusinessState>()(
  persist(
    (set) => ({
      currentBusiness: null,
      businesses: [],
      isLoading: false,

      setCurrentBusiness: (business) => set({ currentBusiness: business }),
      setBusinesses: (businesses) => set({ businesses }),
      setLoading: (isLoading) => set({ isLoading }),
      clearBusiness: () => set({ currentBusiness: null, businesses: [] }),
    }),
    {
      name: "sajiplan-business",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentBusiness: state.currentBusiness,
        businesses: state.businesses,
      }),
    }
  )
);

