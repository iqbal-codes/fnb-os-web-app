"use client";

import { useState, useEffect } from "react";
import { Banknote, Sparkles, Plus, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api/client";
import { toast } from "sonner";

interface OpexCategory {
  id: string;
  name: string;
  amount: number;
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  isAiSuggested: boolean;
}

interface OpexSetupProps {
  businessName?: string;
  businessType: string;
  description?: string;
  location?: string;
  operatingModel: string;
  teamSize?: string;
  targetDailySales?: number;
  initialData?: OpexCategory[];
  onSave: (data: OpexCategory[]) => void;
  onBack?: () => void;
}

const DEFAULT_CATEGORIES: OpexCategory[] = [
  // ... (omitting unchanged lines for brevity if possible, but replace_file_content needs contiguous block. I will just target the props interface and function start separately if needed, or use multi_replace. Let's use multi_replace for safety or just two calls. I'll do two calls to be safe and clear.)

  // Actually, I can just update the interface and props in one go if they are close, but they are far apart.
  // Let's update the interface first.

  {
    id: "1",
    name: "Listrik",
    amount: 500000,
    frequency: "monthly",
    isAiSuggested: true,
  },
  {
    id: "2",
    name: "Air",
    amount: 150000,
    frequency: "monthly",
    isAiSuggested: true,
  },
  {
    id: "3",
    name: "Internet",
    amount: 300000,
    frequency: "monthly",
    isAiSuggested: true,
  },
  {
    id: "4",
    name: "Packaging",
    amount: 200000,
    frequency: "monthly",
    isAiSuggested: true,
  },
  {
    id: "5",
    name: "Gas/LPG",
    amount: 100000,
    frequency: "monthly",
    isAiSuggested: true,
  },
  {
    id: "6",
    name: "Lain-lain",
    amount: 200000,
    frequency: "monthly",
    isAiSuggested: true,
  },
];

const frequencyLabels = {
  daily: "Harian",
  weekly: "Mingguan",
  monthly: "Bulanan",
  yearly: "Tahunan",
};

export function OpexSetup({
  businessName,
  businessType,
  description,
  location,
  operatingModel,
  teamSize,
  targetDailySales,
  initialData,
  onSave,
  onBack,
}: OpexSetupProps) {
  const [categories, setCategories] = useState<OpexCategory[]>(
    initialData || DEFAULT_CATEGORIES
  );
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const loadAISuggestions = async () => {
    setIsLoadingAI(true);
    try {
      const response = await apiClient.post<{
        suggestion: {
          typical_opex_categories: Array<{
            name: string;
            estimated_amount: number;
            frequency: string;
          }>;
        };
      }>("/api/ai/suggest-opex", {
        business_name: businessName,
        business_type: businessType,
        description,
        operating_model: operatingModel,
        team_size: teamSize,
        location,
        target_daily_sales: targetDailySales,
      });

      const aiCategories = response.data.suggestion.typical_opex_categories.map(
        (cat, idx) => ({
          id: `ai-${idx}`,
          name: cat.name,
          amount: cat.estimated_amount,
          frequency: (cat.frequency as "monthly") || "monthly",
          isAiSuggested: true,
        })
      );

      setCategories(aiCategories);
      toast.success("Estimasi AI dimuat!");
    } catch (error) {
      console.error("AI error:", error);
      toast.error("Gagal memuat estimasi AI");
    } finally {
      setIsLoadingAI(false);
    }
  };

  const updateAmount = (id: string, amount: number) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id ? { ...cat, amount, isAiSuggested: false } : cat
      )
    );
  };

  const updateFrequency = (
    id: string,
    frequency: OpexCategory["frequency"]
  ) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, frequency } : cat))
    );
  };

  const removeCategory = (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  };

  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCat: OpexCategory = {
      id: `custom-${Date.now()}`,
      name: newCategoryName,
      amount: 0,
      frequency: "monthly",
      isAiSuggested: false,
    };
    setCategories((prev) => [...prev, newCat]);
    setNewCategoryName("");
  };

  const calculateMonthlyTotal = () => {
    return categories.reduce((sum, cat) => {
      const monthly =
        cat.frequency === "daily"
          ? cat.amount * 30
          : cat.frequency === "weekly"
          ? cat.amount * 4
          : cat.frequency === "yearly"
          ? cat.amount / 12
          : cat.amount;
      return sum + monthly;
    }, 0);
  };

  const handleSave = () => {
    onSave(categories);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <Banknote className="h-5 w-5 text-primary" />
            Estimasi Biaya Operasional
          </h3>
          <p className="text-sm text-muted-foreground">
            Atur estimasi OPEX bulanan Anda
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadAISuggestions}
          disabled={isLoadingAI}
        >
          {isLoadingAI ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : (
            <Sparkles className="h-4 w-4 mr-1" />
          )}
          AI Suggest
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 space-y-3">
          {categories.map((cat) => (
            <div key={cat.id} className="p-3 bg-muted/40 rounded-lg border">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{cat.name}</span>
                  {cat.isAiSuggested && (
                    <Badge variant="secondary" className="text-xs h-5 px-1.5">
                      AI
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 -mr-2 text-muted-foreground hover:text-destructive"
                  onClick={() => removeCategory(cat.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    Rp
                  </span>
                  <Input
                    type="number"
                    value={cat.amount}
                    onChange={(e) =>
                      updateAmount(cat.id, Number(e.target.value))
                    }
                    className="pl-9 text-right"
                    placeholder="0"
                  />
                </div>
                <div className="w-[110px]">
                  <Select
                    value={cat.frequency}
                    onValueChange={(v) =>
                      updateFrequency(cat.id, v as OpexCategory["frequency"])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Harian</SelectItem>
                      <SelectItem value="weekly">Mingguan</SelectItem>
                      <SelectItem value="monthly">Bulanan</SelectItem>
                      <SelectItem value="yearly">Tahunan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}

          {/* Add new category */}
          <div className="flex items-center gap-2 pt-2">
            <Input
              placeholder="Tambah kategori baru..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCategory()}
            />
            <Button variant="outline" size="icon" onClick={addCategory}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Total */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Total OPEX Bulanan</span>
            <span className="text-xl font-bold text-primary">
              Rp {calculateMonthlyTotal().toLocaleString("id-ID")}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        {onBack && (
          <Button variant="outline" className="flex-1" onClick={onBack}>
            Kembali
          </Button>
        )}
        <Button className="flex-1" onClick={handleSave}>
          Simpan & Lanjut
        </Button>
      </div>
    </div>
  );
}

