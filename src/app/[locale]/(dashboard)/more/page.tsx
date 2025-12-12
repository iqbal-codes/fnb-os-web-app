import type { Metadata } from "next";
import Link from "next/link";
import {
  BarChart3,
  Calculator,
  Sparkles,
  Settings,
  FileText,
  HelpCircle,
  ArrowRight,
  UtensilsCrossed,
  DollarSign,
  Receipt,
  ShoppingCart,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "More",
};

const moreItems = [
  {
    href: "/opex",
    label: "Biaya Operasional",
    description: "Kelola OPEX bulanan",
    icon: DollarSign,
    color: "text-red-500",
  },
  {
    href: "/sales",
    label: "Riwayat Penjualan",
    description: "Lihat transaksi",
    icon: Receipt,
    color: "text-green-500",
  },
  {
    href: "/ingredients",
    label: "Bahan & Ingredients",
    description: "Kelola katalog bahan",
    icon: UtensilsCrossed,
    color: "text-chart-5",
  },
  {
    href: "/analytics",
    label: "Analitik & Laporan",
    description: "Penjualan, profit, tren",
    icon: BarChart3,
    color: "text-chart-1",
  },
  {
    href: "/planning",
    label: "Perencanaan Bisnis",
    description: "BEP, ROI, belanja",
    icon: Calculator,
    color: "text-chart-2",
  },
  {
    href: "/shopping-list",
    label: "Daftar Belanja",
    description: "Generate dari stok rendah",
    icon: ShoppingCart,
    color: "text-blue-500",
  },
  {
    href: "/ai-doctor",
    label: "AI Business Doctor",
    description: "AI-powered insights",
    icon: Sparkles,
    color: "text-primary",
  },
  {
    href: "/settings",
    label: "Pengaturan",
    description: "Bisnis & akun",
    icon: Settings,
    color: "text-muted-foreground",
  },
  {
    href: "/export",
    label: "Ekspor Data",
    description: "CSV, PDF reports",
    icon: FileText,
    color: "text-chart-3",
  },
  {
    href: "/help",
    label: "Bantuan",
    description: "Panduan & FAQ",
    icon: HelpCircle,
    color: "text-chart-4",
  },
];

export default function MorePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold">More</h1>
        <p className="text-sm text-muted-foreground">
          Additional tools and settings
        </p>
      </div>

      <div className="space-y-2 gap-2">
        {moreItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className="hover:bg-muted/50 transition-colors mb-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`${item.color}`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

