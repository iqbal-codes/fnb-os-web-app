import type { Metadata } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calculator, Target, TrendingUp, ShoppingCart } from "lucide-react";

export const metadata: Metadata = {
  title: "Business Planning",
};

export default function PlanningPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold">Perencanaan Bisnis</h1>
        <p className="text-sm text-muted-foreground">
          Analisis BEP, ROI, dan perencanaan keuangan
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="bep" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="bep" className="text-xs sm:text-sm">
            <Target className="h-4 w-4 mr-1 hidden sm:inline" />
            BEP
          </TabsTrigger>
          <TabsTrigger value="roi" className="text-xs sm:text-sm">
            <TrendingUp className="h-4 w-4 mr-1 hidden sm:inline" />
            ROI
          </TabsTrigger>
          <TabsTrigger value="shopping" className="text-xs sm:text-sm">
            <ShoppingCart className="h-4 w-4 mr-1 hidden sm:inline" />
            Belanja
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bep">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Kalkulator Break-Even Point
              </CardTitle>
              <CardDescription>
                Hitung berapa unit yang harus dijual untuk balik modal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">
                  Tambahkan data OPEX dan menu untuk menghitung BEP.
                </p>
                <p className="text-xs mt-2">
                  Buka Settings → OPEX untuk input biaya operasional.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roi">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Analisis ROI
              </CardTitle>
              <CardDescription>
                Proyeksi return on investment dan payback period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">
                  Input modal awal dan estimasi penjualan untuk analisis ROI.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shopping">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Daftar Belanja
              </CardTitle>
              <CardDescription>
                Generate daftar belanja berdasarkan target penjualan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">
                  Fitur ini akan generate daftar bahan yang perlu dibeli
                  berdasarkan target penjualan mingguan.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Est. BEP/hari</p>
            <p className="text-xl font-bold text-primary">-</p>
            <p className="text-xs text-muted-foreground">unit</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Payback Period</p>
            <p className="text-xl font-bold text-primary">-</p>
            <p className="text-xs text-muted-foreground">bulan</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

