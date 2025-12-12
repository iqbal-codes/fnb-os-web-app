"use client";

import { useState } from "react";
import { FileText, Download, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { apiClient } from "@/lib/api/client";
import { useBusinessStore } from "@/stores/businessStore";

interface TransactionItem {
  menu_id: string;
  menu_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface Transaction {
  id: string;
  order_number: string;
  items: TransactionItem[];
  total: number;
  payment_type: string;
  status: string;
  created_at: string;
}

export function ExportData() {
  const { currentBusiness } = useBusinessStore();
  const [isExporting, setIsExporting] = useState(false);
  const [period, setPeriod] = useState("30");
  const [format, setFormat] = useState("csv");

  const handleExport = async () => {
    if (!currentBusiness?.id) {
      toast.error("Bisnis tidak ditemukan");
      return;
    }

    setIsExporting(true);
    try {
      const response = await apiClient.get<{ transactions: Transaction[] }>(
        `/api/sales?business_id=${currentBusiness.id}&limit=1000`
      );

      const transactions = response.data.transactions || [];

      if (transactions.length === 0) {
        toast.error("Tidak ada data untuk diekspor");
        return;
      }

      if (format === "csv") {
        exportToCSV(transactions);
      } else {
        toast.info("Format PDF belum tersedia, mengunduh CSV");
        exportToCSV(transactions);
      }

      toast.success("Data berhasil diekspor");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Gagal mengekspor data");
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = (data: Transaction[]) => {
    const headers = [
      "Order Number",
      "Date",
      "Total",
      "Payment Type",
      "Status",
      "Items",
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(",")]
        .concat(
          data.map((row) => {
            const items =
              row.items
                ?.map((i) => `${i.quantity}x ${i.menu_name}`)
                .join("; ") || "";
            return [
              row.order_number,
              new Date(row.created_at).toLocaleDateString("id-ID"),
              row.total,
              row.payment_type,
              row.status,
              `"${items}"`,
            ].join(",");
          })
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `sales_report_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Ekspor Data
        </h1>
        <p className="text-sm text-muted-foreground">
          Unduh laporan penjualan dalam format CSV
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Konfigurasi Ekspor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Periode Data</Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 Hari Terakhir</SelectItem>
                <SelectItem value="30">30 Hari Terakhir</SelectItem>
                <SelectItem value="90">3 Bulan Terakhir</SelectItem>
                <SelectItem value="all">Semua Waktu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Format File</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV (Excel)</SelectItem>
                <SelectItem value="pdf" disabled>
                  PDF (Segera Hadir)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full"
            onClick={handleExport}
            disabled={isExporting || !currentBusiness}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isExporting ? "Mengekspor..." : "Unduh Laporan"}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardContent className="p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Catatan:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Laporan berisi detail transaksi, item terjual, dan nominal.</li>
            <li>
              Format CSV dapat dibuka dengan Microsoft Excel atau Google Sheets.
            </li>
            <li>Untuk laporan keuangan lengkap, silakan cek menu Analitik.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

