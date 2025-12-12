"use client";

import { useState } from "react";
import {
  Receipt,
  Calendar,
  Filter,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Banknote,
  QrCode,
  Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useSalesHistory,
  formatTransactionDate,
  getPaymentTypeLabel,
  getStatusVariant,
  type Transaction,
} from "@/hooks/useSalesHistory";

export function SalesHistory() {
  const [page, setPage] = useState(1);
  const [paymentFilter, setPaymentFilter] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading } = useSalesHistory({
    page,
    limit: 20,
    paymentType: paymentFilter || undefined,
  });

  const getPaymentIcon = (type: string) => {
    switch (type) {
      case "cash":
        return <Banknote className="h-4 w-4" />;
      case "qris":
        return <QrCode className="h-4 w-4" />;
      case "card":
        return <CreditCard className="h-4 w-4" />;
      case "transfer":
        return <Building2 className="h-4 w-4" />;
      default:
        return <Receipt className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  const transactions = data?.transactions || [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Riwayat Penjualan
          </h2>
          <p className="text-sm text-muted-foreground">
            {data?.total || 0} transaksi
          </p>
        </div>
        <Select
          value={paymentFilter || "all"}
          onValueChange={(val) => setPaymentFilter(val === "all" ? "" : val)}
        >
          <SelectTrigger className="w-32">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="cash">Tunai</SelectItem>
            <SelectItem value="qris">QRIS</SelectItem>
            <SelectItem value="transfer">Transfer</SelectItem>
            <SelectItem value="card">Kartu</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Receipt className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Belum ada transaksi</p>
            <p className="text-sm text-muted-foreground">
              Transaksi dari POS akan muncul di sini
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => (
            <TransactionCard
              key={tx.id}
              transaction={tx}
              isExpanded={expandedId === tx.id}
              onToggle={() =>
                setExpandedId(expandedId === tx.id ? null : tx.id)
              }
              getPaymentIcon={getPaymentIcon}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Sebelumnya
          </Button>
          <span className="flex items-center px-3 text-sm text-muted-foreground">
            {page} / {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === data.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Selanjutnya
          </Button>
        </div>
      )}
    </div>
  );
}

interface TransactionCardProps {
  transaction: Transaction;
  isExpanded: boolean;
  onToggle: () => void;
  getPaymentIcon: (type: string) => React.ReactNode;
}

function TransactionCard({
  transaction,
  isExpanded,
  onToggle,
  getPaymentIcon,
}: TransactionCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        {/* Main Row */}
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={onToggle}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
              {getPaymentIcon(transaction.payment_type)}
            </div>
            <div>
              <p className="font-medium text-sm">{transaction.order_number}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {formatTransactionDate(transaction.created_at)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-bold text-primary">
                Rp {transaction.total.toLocaleString("id-ID")}
              </p>
              <div className="flex items-center gap-1">
                <Badge
                  variant={getStatusVariant(transaction.status)}
                  className="text-xs"
                >
                  {transaction.status === "completed"
                    ? "Selesai"
                    : transaction.status}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {getPaymentTypeLabel(transaction.payment_type)}
                </Badge>
              </div>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Detail Pesanan
            </p>
            {transaction.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span>
                  {item.quantity}x {item.menu_name}
                </span>
                <span className="text-muted-foreground">
                  Rp {item.subtotal.toLocaleString("id-ID")}
                </span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-medium pt-2 border-t">
              <span>Total</span>
              <span>Rp {transaction.total.toLocaleString("id-ID")}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

