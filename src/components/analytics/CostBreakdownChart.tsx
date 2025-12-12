"use client";

import { PieChart, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCostBreakdown, formatCurrency } from "@/hooks/useAnalytics";

interface CostBreakdownChartProps {
  period?: "week" | "month";
}

export function CostBreakdownChart({
  period = "month",
}: CostBreakdownChartProps) {
  const { data: breakdown, isLoading } = useCostBreakdown({ period });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasData = breakdown && breakdown.totalRevenue > 0;

  // Calculate segments for visualization
  const segments = [
    {
      label: "COGS",
      value: breakdown?.totalCogs || 0,
      percent: breakdown?.cogsPercent || 0,
      color: "bg-red-500",
      textColor: "text-red-600",
    },
    {
      label: "OPEX",
      value: breakdown?.totalOpex || 0,
      percent: breakdown?.opexPercent || 0,
      color: "bg-orange-500",
      textColor: "text-orange-600",
    },
    {
      label: "Profit",
      value: breakdown?.netProfit || 0,
      percent: breakdown?.profitPercent || 0,
      color: "bg-green-500",
      textColor: "text-green-600",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <PieChart className="h-4 w-4" />
          Breakdown Biaya
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          COGS vs OPEX vs Profit {period === "week" ? "(7 hari)" : "(30 hari)"}
        </p>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Belum ada data biaya</p>
              <p className="text-xs">Input OPEX dan catat transaksi</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Total Revenue */}
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">Total Pendapatan</p>
              <p className="text-2xl font-bold">
                {formatCurrency(breakdown?.totalRevenue || 0)}
              </p>
            </div>

            {/* Horizontal Bar Breakdown */}
            <div className="h-6 rounded-full overflow-hidden flex bg-muted">
              {segments.map((seg, i) => (
                <div
                  key={i}
                  className={`${seg.color} transition-all`}
                  style={{ width: `${seg.percent}%` }}
                  title={`${seg.label}: ${seg.percent.toFixed(1)}%`}
                />
              ))}
            </div>

            {/* Legend */}
            <div className="space-y-2">
              {segments.map((seg, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${seg.color}`} />
                    <span className="text-sm">{seg.label}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${seg.textColor}`}>
                      {seg.percent.toFixed(1)}%
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({formatCurrency(seg.value)})
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Profit Summary */}
            <div
              className={`p-3 rounded-lg ${
                (breakdown?.profitPercent || 0) >= 20
                  ? "bg-green-500/10"
                  : (breakdown?.profitPercent || 0) >= 10
                  ? "bg-yellow-500/10"
                  : "bg-red-500/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm">Net Profit</span>
                <span
                  className={`font-bold ${
                    (breakdown?.profitPercent || 0) >= 20
                      ? "text-green-600"
                      : (breakdown?.profitPercent || 0) >= 10
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(breakdown?.netProfit || 0)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {(breakdown?.profitPercent || 0) >= 20
                  ? "Margin sehat!"
                  : (breakdown?.profitPercent || 0) >= 10
                  ? "Perlu ditingkatkan"
                  : "Margin terlalu rendah"}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

