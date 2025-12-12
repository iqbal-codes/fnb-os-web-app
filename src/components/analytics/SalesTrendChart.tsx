"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSalesTrend, formatCurrency } from "@/hooks/useAnalytics";

interface SalesTrendChartProps {
  period?: "week" | "month";
}

export function SalesTrendChart({ period = "month" }: SalesTrendChartProps) {
  const { data: salesData, isLoading } = useSalesTrend({ period });

  // Generate random heights once for skeleton loading state using lazy initialization
  const [skeletonHeights] = useState(() =>
    Array.from({ length: 7 }, () => 30 + Math.random() * 70)
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-end justify-between gap-1">
            {skeletonHeights.map((height, i) => (
              <Skeleton
                key={i}
                className="flex-1 h-full"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasData = salesData && salesData.length > 0;
  const maxRevenue = hasData ? Math.max(...salesData.map((d) => d.revenue)) : 0;

  // Calculate trend
  const trend =
    hasData && salesData.length >= 2
      ? ((salesData[salesData.length - 1].revenue - salesData[0].revenue) /
          (salesData[0].revenue || 1)) *
        100
      : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Tren Penjualan</CardTitle>
          {hasData && (
            <div
              className={`flex items-center gap-1 text-sm ${
                trend > 0
                  ? "text-green-600"
                  : trend < 0
                  ? "text-red-600"
                  : "text-muted-foreground"
              }`}
            >
              {trend > 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : trend < 0 ? (
                <TrendingDown className="h-4 w-4" />
              ) : (
                <Minus className="h-4 w-4" />
              )}
              <span>{Math.abs(trend).toFixed(1)}%</span>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {period === "week" ? "7 hari terakhir" : "30 hari terakhir"}
        </p>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-sm">Belum ada data penjualan</p>
              <p className="text-xs">
                Mulai terima pesanan untuk melihat grafik
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Simple bar chart */}
            <div className="h-36 flex items-end justify-between gap-1">
              {salesData.slice(-14).map((day, i) => {
                const height =
                  maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
                return (
                  <div
                    key={i}
                    className="flex-1 bg-primary/80 rounded-t hover:bg-primary transition-colors relative group"
                    style={{ height: `${Math.max(height, 2)}%` }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="bg-popover text-popover-foreground text-xs p-2 rounded shadow-lg whitespace-nowrap">
                        <p className="font-medium">
                          {new Date(day.date).toLocaleDateString("id-ID", {
                            weekday: "short",
                            day: "numeric",
                          })}
                        </p>
                        <p>{formatCurrency(day.revenue)}</p>
                        <p className="text-muted-foreground">
                          {day.orders} pesanan
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {salesData.length > 0
                  ? new Date(salesData[0].date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })
                  : ""}
              </span>
              <span>
                {salesData.length > 0
                  ? new Date(
                      salesData[salesData.length - 1].date
                    ).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })
                  : ""}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

