"use client";

import { AlertTriangle, TrendingUp, TrendingDown, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  usePriceAlerts,
  formatPriceChange,
  type PriceAlert,
} from "@/hooks/usePriceHistory";

export function PriceAlerts() {
  const { data: alerts, isLoading } = usePriceAlerts();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Package className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
          <p className="text-sm text-muted-foreground">
            Tidak ada perubahan harga signifikan
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Peringatan Harga ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert) => (
          <PriceAlertItem key={alert.ingredient_id} alert={alert} />
        ))}
      </CardContent>
    </Card>
  );
}

function PriceAlertItem({ alert }: { alert: PriceAlert }) {
  const isIncrease = alert.change_percent > 0;
  const severityColors = {
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    medium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
      <div
        className={`p-2 rounded-full ${
          isIncrease
            ? "bg-red-100 dark:bg-red-900"
            : "bg-green-100 dark:bg-green-900"
        }`}
      >
        {isIncrease ? (
          <TrendingUp className="h-4 w-4 text-red-600 dark:text-red-400" />
        ) : (
          <TrendingDown className="h-4 w-4 text-green-600 dark:text-green-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-sm truncate">
            {alert.ingredient_name}
          </p>
          <Badge className={severityColors[alert.severity]} variant="outline">
            {formatPriceChange(alert.change_percent)}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{alert.message}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Rp {alert.old_price.toLocaleString("id-ID")} → Rp{" "}
          {alert.current_price.toLocaleString("id-ID")}
        </p>
      </div>
    </div>
  );
}

