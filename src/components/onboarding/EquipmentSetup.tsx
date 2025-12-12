"use client";

import { useState } from "react";
import { Package, Sparkles, Plus, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { apiClient } from "@/lib/api/client";
import { toast } from "sonner";

interface EquipmentItem {
  id: string;
  name: string;
  quantity: number;
  estimated_price: number;
  priority: "essential" | "recommended" | "optional";
  isAiSuggested: boolean;
  isSelected: boolean;
}

interface EquipmentSetupProps {
  businessName?: string;
  businessType: string;
  description?: string;
  location?: string;
  operatingModel: string;
  teamSize: string;
  targetDailySales?: number;
  initialData?: EquipmentItem[];
  onSave: (data: EquipmentItem[]) => void;
  onBack?: () => void;
}

const priorityColors = {
  essential: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  recommended:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  optional: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
};

const priorityLabels = {
  essential: "Wajib",
  recommended: "Disarankan",
  optional: "Opsional",
};

export function EquipmentSetup({
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
}: EquipmentSetupProps) {
  const [equipment, setEquipment] = useState<EquipmentItem[]>(
    initialData || []
  );
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [newItemName, setNewItemName] = useState("");

  const loadAISuggestions = async () => {
    setIsLoadingAI(true);
    try {
      const response = await apiClient.post<{
        suggestion: {
          equipment: Array<{
            name: string;
            quantity: number;
            estimated_price: number;
            priority: "essential" | "recommended" | "optional";
          }>;
        };
      }>("/api/ai/suggest-equipment", {
        business_name: businessName,
        business_type: businessType,
        description,
        location,
        operating_model: operatingModel,
        team_size: teamSize,
        target_daily_sales: targetDailySales,
      });

      const aiEquipment = response.data.suggestion.equipment.map(
        (item, idx) => ({
          id: `ai-${idx}`,
          ...item,
          isAiSuggested: true,
          isSelected: item.priority === "essential",
        })
      );

      setEquipment(aiEquipment);
      toast.success("Rekomendasi AI dimuat!");
    } catch (error) {
      console.error("AI error:", error);
      toast.error("Gagal memuat rekomendasi AI");
    } finally {
      setIsLoadingAI(false);
    }
  };

  const toggleSelected = (id: string) => {
    setEquipment((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isSelected: !item.isSelected } : item
      )
    );
  };

  const updateQuantity = (id: string, quantity: number) => {
    setEquipment((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const updatePrice = (id: string, estimated_price: number) => {
    setEquipment((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, estimated_price, isAiSuggested: false }
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setEquipment((prev) => prev.filter((item) => item.id !== id));
  };

  const addItem = () => {
    if (!newItemName.trim()) return;
    const newItem: EquipmentItem = {
      id: `custom-${Date.now()}`,
      name: newItemName,
      quantity: 1,
      estimated_price: 0,
      priority: "optional",
      isAiSuggested: false,
      isSelected: true,
    };
    setEquipment((prev) => [...prev, newItem]);
    setNewItemName("");
  };

  const calculateTotal = () => {
    return equipment
      .filter((item) => item.isSelected)
      .reduce((sum, item) => sum + item.quantity * item.estimated_price, 0);
  };

  const handleSave = () => {
    onSave(equipment.filter((item) => item.isSelected));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Peralatan Starter Kit
          </h3>
          <p className="text-sm text-muted-foreground">
            Peralatan dasar untuk memulai bisnis
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

      {equipment.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Package className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-3">
              Belum ada peralatan. Klik AI Suggest untuk rekomendasi.
            </p>
            <Button onClick={loadAISuggestions} disabled={isLoadingAI}>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate dengan AI
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {equipment.map((item) => (
            <div
              key={item.id}
              className={`p-3 bg-muted/40 rounded-lg border transition-opacity ${
                !item.isSelected ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-2">
                  <Checkbox
                    checked={item.isSelected}
                    onCheckedChange={() => toggleSelected(item.id)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Badge
                        className={`text-xs ${priorityColors[item.priority]}`}
                      >
                        {priorityLabels[item.priority]}
                      </Badge>
                      {item.isAiSuggested && (
                        <Badge variant="outline" className="text-xs">
                          AI
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 -mr-2 text-muted-foreground hover:text-destructive"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex gap-2">
                <div className="w-[80px]">
                  <Label className="text-xs text-muted-foreground mb-1 block">
                    Qty
                  </Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.id, Number(e.target.value))
                    }
                    className="text-center"
                    min={1}
                  />
                </div>
                <div className="flex-1 relative">
                  <Label className="text-xs text-muted-foreground mb-1 block">
                    Estimasi Harga
                  </Label>
                  <span className="absolute left-3 top-[26px] text-muted-foreground text-sm">
                    Rp
                  </span>
                  <Input
                    type="number"
                    value={item.estimated_price}
                    onChange={(e) =>
                      updatePrice(item.id, Number(e.target.value))
                    }
                    className="pl-9 text-right"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Add custom item */}
          <div className="flex items-center gap-2 pt-2">
            <Input
              placeholder="Tambah peralatan lain..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()}
            />
            <Button variant="outline" size="icon" onClick={addItem}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Total Cost */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">Estimasi Modal Peralatan</span>
              <p className="text-xs text-muted-foreground">
                {equipment.filter((i) => i.isSelected).length} item dipilih
              </p>
            </div>
            <span className="text-xl font-bold text-primary">
              Rp {calculateTotal().toLocaleString("id-ID")}
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

