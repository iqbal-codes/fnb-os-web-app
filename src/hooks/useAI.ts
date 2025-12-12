// AI Hooks for Gemini integration
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { useBusinessStore } from "@/stores/businessStore";

// Types
interface PriceSuggestion {
  suggested_price: number;
  confidence: "low" | "medium" | "high";
  reasoning: string;
  market_range: {
    min: number;
    max: number;
  };
}

interface BusinessIssue {
  type: "pricing" | "cogs" | "opex" | "inventory" | "sales";
  severity: "low" | "medium" | "high";
  title: string;
  description: string;
}

interface Recommendation {
  priority: number;
  action: string;
  impact: string;
  category: string;
}

interface BusinessAnalysis {
  health_score: number;
  issues: BusinessIssue[];
  recommendations: Recommendation[];
  summary: string;
}

/**
 * Hook for getting AI price suggestions
 */
export function useAIPriceSuggestion() {
  return useMutation({
    mutationFn: async ({
      ingredientName,
      category,
      currentPrice,
      marketUnit,
    }: {
      ingredientName: string;
      category?: string;
      currentPrice?: number;
      marketUnit?: string;
    }) => {
      const response = await apiClient.post<{ suggestion: PriceSuggestion }>(
        "/api/ai/suggest-price",
        {
          ingredient_name: ingredientName,
          category,
          current_price: currentPrice,
          market_unit: marketUnit,
        }
      );
      return response.data.suggestion;
    },
  });
}

/**
 * Hook for getting AI business analysis
 */
export function useAIBusinessAnalysis() {
  const { currentBusiness } = useBusinessStore();

  return useQuery({
    queryKey: ["ai-analysis", currentBusiness?.id],
    queryFn: async (): Promise<BusinessAnalysis | null> => {
      if (!currentBusiness?.id) return null;

      try {
        const response = await apiClient.post<{ analysis: BusinessAnalysis }>(
          "/api/ai/analyze",
          { business_id: currentBusiness.id }
        );
        return response.data.analysis;
      } catch (error) {
        console.error("AI analysis error:", error);
        return null;
      }
    },
    enabled: !!currentBusiness?.id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook for triggering a fresh AI analysis
 */
export function useRefreshAIAnalysis() {
  const { currentBusiness } = useBusinessStore();

  return useMutation({
    mutationFn: async () => {
      if (!currentBusiness?.id) throw new Error("No business");

      const response = await apiClient.post<{ analysis: BusinessAnalysis }>(
        "/api/ai/analyze",
        { business_id: currentBusiness.id }
      );
      return response.data.analysis;
    },
  });
}

export type {
  PriceSuggestion,
  BusinessAnalysis,
  BusinessIssue,
  Recommendation,
};

