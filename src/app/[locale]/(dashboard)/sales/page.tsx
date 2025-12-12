import type { Metadata } from "next";
import { SalesHistory } from "@/components/pos/SalesHistory";

export const metadata: Metadata = {
  title: "Riwayat Penjualan",
};

export default function SalesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <SalesHistory />
    </div>
  );
}

