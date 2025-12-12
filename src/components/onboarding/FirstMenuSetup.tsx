"use client";

import { useState } from "react";
import {
  UtensilsCrossed,
  Sparkles,
  Plus,
  Trash2,
  Loader2,
  Calculator,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api/client";
import { toast } from "sonner";

interface RecipeIngredient {
  id: string;
  name: string;
  usageQuantity: number;
  usageUnit: string;
  buyingQuantity: number;
  buyingUnit: string;
  buyingPrice: number;
  isAiSuggested: boolean;
}

interface FirstMenuData {
  name: string;
  category: string;
  description: string;
  ingredients: RecipeIngredient[];
  estimatedCogs: number;
  suggestedPrice: number;
}

interface FirstMenuSetupProps {
  businessType: string;
  opexTotal: number;
  targetDailySales: number;
  onSave: (data: FirstMenuData) => void;
  onBack?: () => void;
}

const UNIT_OPTIONS = ["gram", "ml", "pcs", "sdm", "sdt"];
const BUYING_UNIT_OPTIONS = [
  "kg",
  "liter",
  "pcs",
  "pack",
  "botol",
  "kaleng",
  "karton",
];
const CATEGORY_OPTIONS = ["minuman", "makanan", "snack", "dessert"];

export function FirstMenuSetup({
  businessType,
  opexTotal,
  targetDailySales,
  onSave,
  onBack,
}: FirstMenuSetupProps) {
  const [menuName, setMenuName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [suggestedPrice, setSuggestedPrice] = useState(0);

  // State for calculation results
  const [isCalculated, setIsCalculated] = useState(false);
  const [materialCogs, setMaterialCogs] = useState(0);
  const [opexPerCup, setOpexPerCup] = useState(0);
  const [totalCogs, setTotalCogs] = useState(0);

  const loadAISuggestions = async () => {
    if (!menuName.trim()) {
      toast.error("Masukkan nama menu terlebih dahulu");
      return;
    }

    setIsLoadingAI(true);
    setIsCalculated(false); // Reset calculation
    try {
      const response = await apiClient.post<{
        suggestion: {
          menu_name: string;
          category: string;
          ingredients: Array<{
            name: string;
            usage_quantity: number;
            usage_unit: string;
            buying_quantity: number;
            buying_unit: string;
            buying_price: number;
          }>;
          estimated_cogs: number;
          suggested_selling_price: number;
        };
      }>("/api/ai/suggest-ingredients", {
        menu_name: menuName,
        menu_description: description,
        business_type: businessType,
      });

      const { suggestion } = response.data;

      setCategory(suggestion.category);
      // setSuggestedPrice(suggestion.suggested_selling_price); // We'll recalculate this

      const aiIngredients = suggestion.ingredients.map((ing, idx) => ({
        id: `ai-${idx}`,
        name: ing.name,
        usageQuantity: ing.usage_quantity,
        usageUnit: ing.usage_unit,
        buyingQuantity: ing.buying_quantity,
        buyingUnit: ing.buying_unit,
        buyingPrice: ing.buying_price,
        isAiSuggested: true,
      }));

      setIngredients(aiIngredients);
      toast.success("Resep AI dimuat!");
    } catch (error) {
      console.error("AI error:", error);
      toast.error("Gagal memuat resep AI");
    } finally {
      setIsLoadingAI(false);
    }
  };

  const addIngredient = () => {
    const newIng: RecipeIngredient = {
      id: `custom-${Date.now()}`,
      name: "",
      usageQuantity: 0,
      usageUnit: "gram",
      buyingQuantity: 1,
      buyingUnit: "kg",
      buyingPrice: 0,
      isAiSuggested: false,
    };
    setIngredients((prev) => [...prev, newIng]);
    setIsCalculated(false);
  };

  const updateIngredient = (
    id: string,
    field: keyof RecipeIngredient,
    value: string | number
  ) => {
    setIngredients((prev) =>
      prev.map((ing) =>
        ing.id === id ? { ...ing, [field]: value, isAiSuggested: false } : ing
      )
    );
    setIsCalculated(false);
  };

  const removeIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((ing) => ing.id !== id));
    setIsCalculated(false);
  };

  const calculateDetailedCogs = () => {
    let matSettingsCogs = 0;

    ingredients.forEach((ing) => {
      // Logic:
      // If buying unit contains 'kg' or 'liter', convert to g/ml.
      // If usage unit contains 'gram' or 'ml', keep as is.
      // If units don't match standard mass/vol, we just do (Usage / Buying) * Price
      // But we need to handle "1 kg" buy vs "12 gram" usage.

      let ratio = 0;

      const buyingUnit = ing.buyingUnit;
      const usageUnit = ing.usageUnit;

      if (buyingUnit === "kg" && usageUnit === "gram") {
        ratio = ing.usageQuantity / (ing.buyingQuantity * 1000);
      } else if (buyingUnit === "liter" && usageUnit === "ml") {
        ratio = ing.usageQuantity / (ing.buyingQuantity * 1000);
      } else {
        // Fallback: direct ratio (e.g. usage 2 pcs from buy 10 pcs)
        // NOTE: This assumes user handles other conversions.
        ratio = ing.usageQuantity / ing.buyingQuantity;
      }

      matSettingsCogs += ratio * ing.buyingPrice;
    });

    return Math.ceil(matSettingsCogs);
  };

  const handleCalculate = () => {
    if (ingredients.length === 0) {
      toast.error("Tambahkan minimal 1 bahan");
      return;
    }

    const calculatedMatCogs = calculateDetailedCogs();
    setMaterialCogs(calculatedMatCogs);

    // Calculate OPEX per cup
    // Assume 30 days/month
    const monthlySales = (targetDailySales || 30) * 30;
    const calcOpexPerCup = opexTotal / monthlySales;
    setOpexPerCup(Math.ceil(calcOpexPerCup));

    const total = calculatedMatCogs + calcOpexPerCup;
    setTotalCogs(total);
    setSuggestedPrice(Math.ceil(total * 1.5)); // Simple margin 33% (1.5x markup) + extra, actually usually COGS * 2 or 2.5
    // Let's stick to 50-60% margin? (Price - COGS) / Price
    // If Price = COGS * 2, Margin = 50%
    setSuggestedPrice(Math.ceil(total * 2));

    setIsCalculated(true);
    toast.success("COGS & Harga berhasil dihitung!");
  };

  const handleSave = () => {
    if (!isCalculated) {
      toast.error("Mohon klik 'Cek COGS & Harga' terlebih dahulu");
      return;
    }
    if (!menuName.trim()) {
      toast.error("Nama menu wajib diisi");
      return;
    }

    onSave({
      name: menuName,
      category: category || "minuman",
      description,
      ingredients,
      estimatedCogs: materialCogs, // Save material COGS as base
      suggestedPrice: suggestedPrice,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5 text-primary" />
          Buat Menu Pertama
        </h3>
        <p className="text-sm text-muted-foreground">
          Buat satu menu contoh dengan resepnya
        </p>
      </div>

      <div className="space-y-4">
        {/* Menu Name with AI Suggest */}
        <div className="space-y-2">
          <Label>Nama Menu *</Label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Es Kopi Susu"
              value={menuName}
              onChange={(e) => setMenuName(e.target.value)}
            />
            <Button
              variant="outline"
              onClick={loadAISuggestions}
              disabled={isLoadingAI || !menuName.trim()}
            >
              {isLoadingAI ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Ketik nama menu lalu klik ✨ untuk generate resep AI
          </p>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label>Kategori</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ingredients */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Bahan-bahan</Label>
            <Button variant="ghost" size="sm" onClick={addIngredient}>
              <Plus className="h-4 w-4 mr-1" />
              Tambah
            </Button>
          </div>

          {ingredients.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-center text-muted-foreground">
                <p className="text-sm">
                  Ketik nama menu dan klik AI untuk generate bahan, atau tambah
                  manual.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {ingredients.map((ing) => (
                <Card key={ing.id} className="overflow-hidden">
                  <CardContent className="p-3 space-y-3">
                    {/* Top Row: Name & Usage */}
                    <div className="flex gap-2 items-start">
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Nama Bahan
                        </Label>
                        <Input
                          value={ing.name}
                          onChange={(e) =>
                            updateIngredient(ing.id, "name", e.target.value)
                          }
                          placeholder="Nama bahan"
                        />
                      </div>
                      <div className="w-20 space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Pakai
                        </Label>
                        <Input
                          type="number"
                          value={ing.usageQuantity}
                          onChange={(e) =>
                            updateIngredient(
                              ing.id,
                              "usageQuantity",
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>
                      <div className="w-24 space-y-1">
                        <Label className="text-xs text-muted-foreground">
                          Satuan
                        </Label>
                        <Select
                          value={ing.usageUnit}
                          onValueChange={(v) =>
                            updateIngredient(ing.id, "usageUnit", v)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {UNIT_OPTIONS.map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mt-6"
                        onClick={() => removeIngredient(ing.id)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>

                    {/* Bottom Row: Buying Info (Bg muted) */}
                    <div className="bg-muted/50 p-3 rounded-lg flex gap-3 items-center text-sm">
                      <span className="text-muted-foreground text-xs whitespace-nowrap w-16">
                        Info Beli:
                      </span>
                      <div className="flex-1 flex gap-2 items-center">
                        <span className="text-xs text-muted-foreground">
                          Beli
                        </span>
                        <Input
                          type="number"
                          className="h-8 w-16 bg-background"
                          value={ing.buyingQuantity}
                          onChange={(e) =>
                            updateIngredient(
                              ing.id,
                              "buyingQuantity",
                              Number(e.target.value)
                            )
                          }
                        />
                        <Select
                          value={ing.buyingUnit}
                          onValueChange={(v) =>
                            updateIngredient(ing.id, "buyingUnit", v)
                          }
                        >
                          <SelectTrigger className="h-8 w-20 bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {BUYING_UNIT_OPTIONS.map((unit) => (
                              <SelectItem key={unit} value={unit}>
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-xs text-muted-foreground">
                          @ Rp
                        </span>
                        <Input
                          type="number"
                          className="h-8 flex-1 bg-background"
                          placeholder="Harga Beli"
                          value={ing.buyingPrice || ""}
                          onChange={(e) =>
                            updateIngredient(
                              ing.id,
                              "buyingPrice",
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Logic to Show Calculation Button or Results */}
      {!isCalculated ? (
        <Button
          variant="secondary"
          className="w-full border-2 border-primary/20 hover:border-primary/50"
          onClick={handleCalculate}
          disabled={ingredients.length === 0}
        >
          <Calculator className="mr-2 h-4 w-4" />
          Cek COGS & Estimasi Harga
        </Button>
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-primary/10">
                <span className="text-sm font-medium">Material COGS</span>
                <span className="font-bold">
                  Rp {materialCogs.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Est. OPEX / porsi</span>
                <span>+ Rp {opexPerCup.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-primary/20">
                <span className="font-bold text-primary">Total COGS</span>
                <span className="font-bold text-lg text-primary">
                  Rp {totalCogs.toLocaleString("id-ID")}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  Rekomendasi Harga Jual (Margin 50%)
                </p>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-3xl font-bold text-green-600">
                    Rp {suggestedPrice.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="mt-4 flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCalculated(false)}
                  >
                    Edit Bahan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        {onBack && (
          <Button variant="outline" className="flex-1" onClick={onBack}>
            Kembali
          </Button>
        )}
        <Button
          className="flex-1"
          onClick={handleSave}
          disabled={!isCalculated} // DISABLED UNTIL CALCULATED
        >
          Simpan Menu & Lanjut
        </Button>
      </div>
    </div>
  );
}

