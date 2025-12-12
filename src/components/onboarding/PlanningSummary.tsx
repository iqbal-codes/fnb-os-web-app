"use client";

import {
  TrendingUp,
  Calculator,
  Target,
  Calendar,
  ShoppingCart,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface PlanningSummaryProps {
  businessName: string;
  menuData: {
    name: string;
    cogs: number;
    suggestedPrice: number;
  };
  opexTotal: number;
  equipmentTotal: number;
  targetDailySales: number;
  onComplete: () => void;
  onBack?: () => void;
}

export function PlanningSummary({
  businessName,
  menuData,
  opexTotal,
  equipmentTotal,
  targetDailySales,
  onComplete,
  onBack,
}: PlanningSummaryProps) {
  // Calculations
  const cogs = menuData.cogs || 0;
  const sellingPrice = menuData.suggestedPrice || cogs * 2.5;
  const margin =
    sellingPrice > 0 ? ((sellingPrice - cogs) / sellingPrice) * 100 : 0;
  const profitPerCup = sellingPrice - cogs;

  // OPEX per cup (assuming 30 sales/day, 30 days/month)
  const dailySales = targetDailySales || 30;
  const monthlySales = dailySales * 30;
  const opexPerCup = monthlySales > 0 ? opexTotal / monthlySales : 0;

  // Net profit per cup
  const netProfitPerCup = profitPerCup - opexPerCup;

  // Break Even Point
  const bepCupsPerDay =
    netProfitPerCup > 0 ? Math.ceil(opexTotal / 30 / netProfitPerCup) : 0;

  // ROI (months to recover equipment investment)
  const monthlyNetProfit = netProfitPerCup * monthlySales;
  const roiMonths =
    monthlyNetProfit > 0 ? Math.ceil(equipmentTotal / monthlyNetProfit) : 0;

  const formatCurrency = (amount: number) =>
    `Rp ${Math.round(amount).toLocaleString("id-ID")}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold">Selamat, {businessName}! 🎉</h2>
        <p className="text-muted-foreground">
          Berikut ringkasan perencanaan bisnis Anda
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Calculator className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">COGS per Porsi</p>
            <p className="font-bold text-lg">{formatCurrency(cogs)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Harga Jual</p>
            <p className="font-bold text-lg">{formatCurrency(sellingPrice)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-6 w-6 text-amber-600 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Gross Margin</p>
            <p className="font-bold text-lg">{margin.toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <ShoppingCart className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">OPEX/Cup</p>
            <p className="font-bold text-lg">{formatCurrency(opexPerCup)}</p>
          </CardContent>
        </Card>
      </div>

      {/* BEP & ROI */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Analisis Keuangan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Break Even Point</span>
              <span className="font-bold">{bepCupsPerDay} cups/hari</span>
            </div>
            <Progress
              value={Math.min((dailySales / bepCupsPerDay) * 100, 100)}
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Target: {dailySales} cups/hari
            </p>
          </div>

          <div className="flex items-center justify-between py-3 border-t">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="font-medium">Estimasi ROI</span>
            </div>
            <span className="text-xl font-bold text-primary">
              {roiMonths} bulan
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-background">
              <p className="text-muted-foreground">Modal Peralatan</p>
              <p className="font-bold">{formatCurrency(equipmentTotal)}</p>
            </div>
            <div className="p-3 rounded-lg bg-background">
              <p className="text-muted-foreground">OPEX Bulanan</p>
              <p className="font-bold">{formatCurrency(opexTotal)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu Preview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Menu Anda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <p className="font-medium">{menuData.name}</p>
              <p className="text-xs text-muted-foreground">
                COGS: {formatCurrency(cogs)} | Profit:{" "}
                {formatCurrency(profitPerCup)}
              </p>
            </div>
            <span className="text-lg font-bold">
              {formatCurrency(sellingPrice)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Anda bisa menambah menu lainnya di dashboard
          </p>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="flex gap-3">
        {onBack && (
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={onBack}
          >
            Kembali
          </Button>
        )}
        <Button className="flex-1" size="lg" onClick={onComplete}>
          Mulai Bisnis Saya
          <TrendingUp className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

