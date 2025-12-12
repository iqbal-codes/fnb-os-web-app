import type { Metadata } from "next";
import { InventoryList } from "@/components/inventory/InventoryList";
import { LowStockAlert } from "@/components/inventory/LowStockAlert";

export const metadata: Metadata = {
  title: "Inventory",
};

export default function InventoryPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold">Inventory</h1>
        <p className="text-sm text-muted-foreground">
          Track ingredient stock levels
        </p>
      </div>

      {/* Low Stock Alert */}
      <LowStockAlert />

      {/* Inventory List */}
      <InventoryList />
    </div>
  );
}

