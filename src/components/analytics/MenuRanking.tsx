"use client";

import { Trophy, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useMenuPerformance, formatCurrency } from "@/hooks/useAnalytics";

interface MenuRankingProps {
  period?: "week" | "month";
  limit?: number;
}

export function MenuRanking({ period = "month", limit = 5 }: MenuRankingProps) {
  const { data: menuData, isLoading } = useMenuPerformance({ period });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const hasData = menuData && menuData.length > 0;
  const topMenus = hasData ? menuData.slice(0, limit) : [];

  // Sort by quantity sold for "best sellers"
  const bestSellers = [...topMenus].sort(
    (a, b) => b.quantitySold - a.quantitySold
  );

  // Sort by margin for "most profitable"
  const mostProfitable = [...topMenus].sort((a, b) => b.margin - a.margin);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-500" />
          Performa Menu
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {period === "week" ? "7 hari terakhir" : "30 hari terakhir"}
        </p>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-sm">Belum ada data produk</p>
              <p className="text-xs">Tambahkan menu dan mulai berjualan</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Best Sellers */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Terlaris
              </p>
              <div className="space-y-2">
                {bestSellers.slice(0, 3).map((menu, i) => (
                  <div key={menu.menuId} className="flex items-center gap-3">
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        i === 0
                          ? "bg-yellow-500/20 text-yellow-600"
                          : i === 1
                          ? "bg-gray-400/20 text-gray-600"
                          : "bg-orange-400/20 text-orange-600"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {menu.menuName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {menu.quantitySold} terjual
                      </p>
                    </div>
                    <p className="text-sm font-medium">
                      {formatCurrency(menu.revenue)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Margin Performance */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Margin Tertinggi
              </p>
              <div className="space-y-2">
                {mostProfitable.slice(0, 3).map((menu) => (
                  <div key={menu.menuId} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {menu.menuName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Profit {formatCurrency(menu.profit)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        menu.margin >= 40
                          ? "default"
                          : menu.margin >= 25
                          ? "secondary"
                          : "destructive"
                      }
                      className="text-xs"
                    >
                      {menu.margin.toFixed(1)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

