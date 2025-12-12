"use client";

import { useState } from "react";
import {
  Package,
  AlertTriangle,
  TrendingDown,
  Plus,
  Minus,
  MoreVertical,
} from "lucide-react";

import {
  useInventory,
  getStockStatus,
  calculateRestockAmount,
} from "@/hooks/useInventory";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StockAdjustDialog } from "./StockAdjustDialog";
import type { InventoryWithIngredient } from "@/hooks/useInventory";

const statusConfig = {
  ok: {
    color:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    label: "OK",
  },
  low: {
    color:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    label: "Low",
    icon: AlertTriangle,
  },
  critical: {
    color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    label: "Critical",
    icon: TrendingDown,
  },
};

export function InventoryList() {
  const { data: inventory, isLoading } = useInventory();
  const [selectedItem, setSelectedItem] =
    useState<InventoryWithIngredient | null>(null);
  const [adjustType, setAdjustType] = useState<
    "purchase" | "usage" | "adjustment" | "waste"
  >("adjustment");

  const handleAdjust = (
    item: InventoryWithIngredient,
    type: typeof adjustType
  ) => {
    setSelectedItem(item);
    setAdjustType(type);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!inventory || inventory.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">No Inventory Items</h3>
          <p className="text-sm text-muted-foreground">
            Add ingredients first, then set up inventory tracking for each.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {inventory.map((item) => {
          const status = getStockStatus(item.current_stock, item.min_stock);
          const config = statusConfig[status];
          const restockAmount = calculateRestockAmount(
            item.current_stock,
            item.min_stock
          );
          const StatusIcon = "icon" in config ? config.icon : null;

          return (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div
                    className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${config.color}`}
                  >
                    {StatusIcon ? (
                      <StatusIcon className="h-5 w-5" />
                    ) : (
                      <Package className="h-5 w-5" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">
                        {item.ingredient?.name || "Unknown"}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`text-xs shrink-0 ${config.color}`}
                      >
                        {config.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span>
                        <strong
                          className={
                            status !== "ok"
                              ? "text-destructive"
                              : "text-foreground"
                          }
                        >
                          {item.current_stock}
                        </strong>
                        {" / "}
                        {item.min_stock} {item.unit}
                      </span>
                      {status !== "ok" && restockAmount > 0 && (
                        <span className="text-xs">
                          Need +{restockAmount} {item.unit}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleAdjust(item, "usage")}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleAdjust(item, "purchase")}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleAdjust(item, "adjustment")}
                        >
                          Adjust Stock
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleAdjust(item, "waste")}
                        >
                          Record Waste
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <StockAdjustDialog
        open={!!selectedItem}
        onOpenChange={(open) => !open && setSelectedItem(null)}
        item={selectedItem}
        defaultType={adjustType}
      />
    </>
  );
}

