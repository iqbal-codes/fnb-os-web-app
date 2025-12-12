"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { calculateBEP, calculateROI, formatIDR } from "@/lib/calculations/bep";
import { TrendingUp, Target, Calendar, Percent } from "lucide-react";

interface BEPDashboardProps {
  fixedCostsMonthly: number;
  variableCostPerUnit: number;
  averageSellingPrice: number;
  totalInvestment?: number;
  estimatedMonthlySales?: number;
}

export function BEPDashboard({
  fixedCostsMonthly,
  variableCostPerUnit,
  averageSellingPrice,
  totalInvestment = 0,
  estimatedMonthlySales = 0,
}: BEPDashboardProps) {
  const bep = calculateBEP(
    fixedCostsMonthly,
    variableCostPerUnit,
    averageSellingPrice
  );

  const monthlyRevenue = estimatedMonthlySales * averageSellingPrice;
  const monthlyCOGS = estimatedMonthlySales * variableCostPerUnit;

  const roi =
    totalInvestment > 0
      ? calculateROI(
          totalInvestment,
          monthlyRevenue,
          monthlyCOGS,
          fixedCostsMonthly
        )
      : null;

  // Progress toward BEP
  const bepProgress =
    bep.bepUnits > 0 && estimatedMonthlySales > 0
      ? Math.min((estimatedMonthlySales / bep.bepUnits) * 100, 100)
      : 0;

  return (
    <div className="space-y-4">
      {/* BEP Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Break-Even Point (BEP)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-3xl font-bold text-primary">{bep.bepUnits}</p>
              <p className="text-sm text-muted-foreground">unit/bulan</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-3xl font-bold text-primary">
                {bep.bepUnitsDaily}
              </p>
              <p className="text-sm text-muted-foreground">unit/hari</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Target Revenue/bulan
              </span>
              <span className="font-medium">{formatIDR(bep.bepRevenue)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Target Revenue/hari</span>
              <span className="font-medium">
                {formatIDR(bep.bepRevenueDaily)}
              </span>
            </div>
          </div>

          {estimatedMonthlySales > 0 && (
            <div className="pt-3 border-t">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress ke BEP</span>
                <span
                  className={
                    bepProgress >= 100 ? "text-green-600" : "text-orange-500"
                  }
                >
                  {bepProgress.toFixed(0)}%
                </span>
              </div>
              <Progress value={bepProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {bepProgress >= 100
                  ? "✅ Sudah melewati BEP!"
                  : `Butuh ${bep.bepUnits - estimatedMonthlySales} unit lagi`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contribution Margin */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Percent className="h-4 w-4" />
            Contribution Margin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Harga Jual Rata-rata
              </span>
              <span>{formatIDR(averageSellingPrice)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Variable Cost/unit</span>
              <span className="text-destructive">
                -{formatIDR(variableCostPerUnit)}
              </span>
            </div>
            <div className="flex justify-between text-sm font-medium pt-2 border-t">
              <span>Contribution Margin</span>
              <span className="text-green-600">
                {formatIDR(bep.contributionMargin)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Rasio</span>
              <span>{(bep.contributionMarginRatio * 100).toFixed(1)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ROI Analysis */}
      {roi && totalInvestment > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Return on Investment (ROI)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">
                  {roi.annualROI}%
                </p>
                <p className="text-xs text-muted-foreground">ROI/tahun</p>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-2xl font-bold">{roi.paybackMonths}</p>
                </div>
                <p className="text-xs text-muted-foreground">bulan payback</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Investasi</span>
                <span>{formatIDR(roi.totalInvestment)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Profit/bulan</span>
                <span className="text-green-600">
                  {formatIDR(roi.monthlyProfit)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Profit/tahun</span>
                <span className="text-green-600">
                  {formatIDR(roi.yearOneProfit)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
        <p>
          <strong>Fixed Costs:</strong> {formatIDR(fixedCostsMonthly)}/bulan
        </p>
        <p className="mt-1">
          BEP menunjukkan berapa unit yang harus dijual untuk menutup semua
          biaya. Setelah BEP tercapai, setiap penjualan berikutnya adalah
          profit.
        </p>
      </div>
    </div>
  );
}

