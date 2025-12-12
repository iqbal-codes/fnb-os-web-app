"use client";

import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  calculateMenuPricing,
  suggestSellingPrice,
  scoreMenuProfitability,
  type IngredientCost,
} from "@/lib/calculations/cogs";

interface COGSBreakdownProps {
  menuName: string;
  sellingPrice: number;
  ingredientCosts: IngredientCost[];
  opexPerItem?: number;
  targetMargin?: number;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function COGSBreakdown({
  menuName,
  sellingPrice,
  ingredientCosts,
  opexPerItem = 0,
  targetMargin = 30,
}: COGSBreakdownProps) {
  const totalIngredientCost = ingredientCosts.reduce(
    (sum, cost) => sum + cost.calculatedCost,
    0
  );

  const pricing = calculateMenuPricing(
    sellingPrice,
    totalIngredientCost,
    opexPerItem
  );

  const suggestions = suggestSellingPrice(
    totalIngredientCost,
    opexPerItem,
    targetMargin
  );

  const score = scoreMenuProfitability(pricing.grossMarginPercent);

  const scoreColors = {
    A: "bg-green-500",
    B: "bg-green-400",
    C: "bg-yellow-500",
    D: "bg-orange-500",
    F: "bg-red-500",
  };

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{menuName}</CardTitle>
            <Badge className={scoreColors[score.score]}>
              {score.score} - {score.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Price and Margin */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Harga Jual</p>
              <p className="text-2xl font-bold">
                {formatCurrency(sellingPrice)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gross Margin</p>
              <div className="flex items-center gap-2">
                <p
                  className={`text-2xl font-bold ${
                    pricing.isHealthy ? "text-green-600" : "text-orange-500"
                  }`}
                >
                  {pricing.grossMarginPercent}%
                </p>
                {pricing.isHealthy ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                )}
              </div>
            </div>
          </div>

          {/* Margin Progress */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Margin</span>
              <span>{pricing.grossMarginPercent}% dari target 60%</span>
            </div>
            <Progress
              value={Math.min(pricing.grossMarginPercent, 100)}
              className="h-2"
            />
          </div>

          {/* Cost Breakdown */}
          <div className="space-y-2 pt-2 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Biaya Bahan</span>
              <span>{formatCurrency(totalIngredientCost)}</span>
            </div>
            {opexPerItem > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">OPEX/item</span>
                <span>{formatCurrency(opexPerItem)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-medium">
              <span>Total COGS</span>
              <span>{formatCurrency(pricing.totalCOGS)}</span>
            </div>
            <div className="flex justify-between text-sm font-medium text-green-600">
              <span>Gross Profit</span>
              <span>{formatCurrency(pricing.grossProfit)}</span>
            </div>
          </div>

          {/* Recommendation */}
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              💡 {pricing.recommendation}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Ingredient Details */}
      {ingredientCosts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Detail Biaya Bahan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {ingredientCosts.map((cost, index) => {
                const percentage =
                  totalIngredientCost > 0
                    ? (
                        (cost.calculatedCost / totalIngredientCost) *
                        100
                      ).toFixed(1)
                    : 0;

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{cost.ingredientName}</p>
                      <p className="text-xs text-muted-foreground">
                        {cost.quantity} {cost.unit}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p>{formatCurrency(cost.calculatedCost)}</p>
                      <p className="text-xs text-muted-foreground">
                        {percentage}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price Suggestions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Rekomendasi Harga</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Minimum</p>
              <p className="font-medium">
                {formatCurrency(suggestions.minimum)}
              </p>
              <p className="text-xs text-muted-foreground">10% margin</p>
            </div>
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-xs text-primary font-medium">Recommended</p>
              <p className="font-bold text-primary">
                {formatCurrency(suggestions.suggested)}
              </p>
              <p className="text-xs text-muted-foreground">
                {targetMargin}% margin
              </p>
            </div>
            <div className="p-2 rounded-lg bg-muted/50">
              <p className="text-xs text-muted-foreground">Premium</p>
              <p className="font-medium">
                {formatCurrency(suggestions.premium)}
              </p>
              <p className="text-xs text-muted-foreground">40% margin</p>
            </div>
          </div>

          {sellingPrice < suggestions.minimum && (
            <div className="mt-3 p-2 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
              <TrendingDown className="h-4 w-4 shrink-0" />
              <span>Harga saat ini di bawah harga minimum!</span>
            </div>
          )}
          {sellingPrice >= suggestions.suggested && (
            <div className="mt-3 p-2 rounded-lg bg-green-500/10 text-green-600 text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 shrink-0" />
              <span>Harga sudah sesuai atau di atas rekomendasi</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

