"use client";

import { useState } from "react";
import {
  Search,
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  CreditCard,
  Banknote,
  Smartphone,
  X,
  ImageIcon,
} from "lucide-react";

import { useMenus } from "@/hooks/useMenus";
import { usePOSStore } from "@/stores/posStore";
import { useBusinessStore } from "@/stores/businessStore";
import { apiClient } from "@/lib/api/client";
import {
  addOfflineOrder,
  getOfflineOrderNumber,
  useOfflineOrderSync,
} from "@/hooks/useOfflineSync";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Image from "next/image";

const PAYMENT_TYPES = [
  {
    type: "cash" as const,
    label: "Tunai",
    icon: Banknote,
    color: "from-green-500 to-emerald-600",
  },
  {
    type: "qris" as const,
    label: "QRIS",
    icon: Smartphone,
    color: "from-blue-500 to-indigo-600",
  },
  {
    type: "card" as const,
    label: "Kartu",
    icon: CreditCard,
    color: "from-purple-500 to-pink-600",
  },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function POSInterface() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data, isLoading } = useMenus({ active: true });
  const menus = data?.menus || [];

  const {
    items,
    subtotal,
    total,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    setPaymentType,
  } = usePOSStore();

  const { currentBusiness } = useBusinessStore();

  // Filter menus
  const filteredMenus = menus.filter((menu) => {
    const matchesSearch = menu.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory =
      !selectedCategory || menu.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = [...new Set(menus.map((m) => m.category).filter(Boolean))];

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = (menu: (typeof menus)[0]) => {
    addItem({
      id: menu.id,
      name: menu.name,
      price: menu.selling_price,
    });
    // Quick haptic-like feedback
    toast.success(`+1 ${menu.name}`, {
      duration: 1000,
      position: "top-center",
    });
  };

  const handleCheckout = async (paymentType: "cash" | "qris" | "card") => {
    setIsProcessing(true);
    setPaymentType(paymentType);

    try {
      // Prepare order items
      const orderItems = items.map((item) => ({
        menu_id: item.menu_id,
        menu_name: item.menu_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
      }));

      console.log("Checkout payload:", {
        business_id: currentBusiness?.id,
        items: orderItems,
        total,
        paymentType,
      });

      // Call API to save transaction
      const response = await apiClient.post<{ order_number: string }>(
        "/api/sales",
        {
          business_id: currentBusiness?.id,
          items: orderItems,
          subtotal,
          tax: 0,
          total,
          payment_type: paymentType,
        }
      );

      console.log("Checkout response:", response);

      const orderNumber = response.data.order_number;

      toast.success(`🎉 Pesanan ${orderNumber} berhasil!`, {
        description: `Total: ${formatCurrency(
          total
        )} (${paymentType.toUpperCase()})`,
        duration: 3000,
      });

      clearCart();
      setShowPayment(false);
    } catch (error: any) {
      console.error("Checkout error:", error);
      console.error("Error details:", error.response?.data);

      // Temporarily show error to user for debugging
      toast.error(
        `Gagal menyimpan pesanan: ${
          error.response?.data?.error || error.message
        }`
      );

      // Still show success with local order number if API fails (offline mode)
      /* 
      const fallbackOrderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;
      toast.success(`🎉 Pesanan ${fallbackOrderNumber} berhasil!`, {
        description: `Total: ${formatCurrency(total)} - Tersimpan lokal`,
        duration: 3000,
      });
      clearCart();
      setShowPayment(false);
      */
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col">
      {/* Header with Search */}
      <div className="space-y-4 pb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Cari menu favorit..."
            className="pl-12 h-12 text-base rounded-2xl bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium shrink-0 transition-colors
              ${
                selectedCategory === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }
            `}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat || null)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium shrink-0 transition-colors
                ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }
              `}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="flex-1 overflow-y-auto pt-2 px-1 pb-24">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-44 rounded-xl" />
            ))}
          </div>
        ) : filteredMenus.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="font-medium">Tidak ada menu ditemukan</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredMenus.map((menu) => {
              const cartItem = items.find((i) => i.menu_id === menu.id);

              return (
                <Card
                  key={menu.id}
                  className={`
                    cursor-pointer transition-all duration-150 overflow-hidden py-0!
                    ${
                      cartItem
                        ? "ring-2 ring-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }
                  `}
                  onClick={() => handleAddToCart(menu)}
                >
                  <CardContent className="p-3">
                    {/* Image Placeholder */}
                    <div className="aspect-square w-full rounded-lg bg-muted flex items-center justify-center mb-2">
                      {menu.image_url ? (
                        <Image
                          src={menu.image_url}
                          alt={menu.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                      )}
                    </div>

                    {/* Name */}
                    <h3 className="font-medium text-sm truncate">
                      {menu.name}
                    </h3>

                    {/* Price */}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-bold text-primary">
                        {formatCurrency(menu.selling_price)}
                      </span>
                      {cartItem && (
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          {cartItem.quantity}x
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {itemCount > 0 && (
        <Sheet>
          <SheetTrigger asChild>
            <Button
              className="fixed bottom-20 left-4 right-4 h-14 rounded-xl shadow-lg bg-primary hover:bg-primary/90 transition-all animate-in slide-in-from-bottom-4"
              size="lg"
            >
              <div className="flex items-center w-full">
                <ShoppingCart className="h-5 w-5" />
                <Badge className="ml-1.5 bg-white/20 text-white text-xs px-1.5 py-0">
                  {itemCount}
                </Badge>
                <span className="ml-3 font-medium">Keranjang</span>
                <span className="ml-auto font-bold">
                  {formatCurrency(total)}
                </span>
              </div>
            </Button>
          </SheetTrigger>

          <SheetContent
            side="bottom"
            className="h-[80vh] rounded-t-2xl p-0 flex flex-col"
          >
            {/* Handle */}
            <div className="py-3 flex justify-center">
              <div className="w-10 h-1 rounded-full bg-muted" />
            </div>

            {/* Header */}
            <div className="px-4 pb-3 border-b">
              <SheetHeader>
                <SheetTitle className="text-lg flex items-center gap-2">
                  Keranjang
                  <Badge variant="secondary" className="text-xs">
                    {itemCount} item
                  </Badge>
                </SheetTitle>
              </SheetHeader>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
                >
                  {/* Image placeholder */}
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {item.menu_name}
                    </p>
                    <p className="text-sm text-primary font-semibold">
                      {formatCurrency(item.unit_price)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-lg"
                      onClick={() => {
                        if (item.quantity === 1) {
                          removeItem(item.id);
                        } else {
                          updateQuantity(item.id, item.quantity - 1);
                        }
                      }}
                    >
                      {item.quantity === 1 ? (
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      ) : (
                        <Minus className="h-3.5 w-3.5" />
                      )}
                    </Button>

                    <span className="w-6 text-center font-semibold text-sm">
                      {item.quantity}
                    </span>

                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-lg"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-background space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total</span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(total)}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-xl shrink-0"
                  onClick={clearCart}
                >
                  <X className="h-5 w-5" />
                </Button>
                <Button
                  className="flex-1 h-12 rounded-xl text-base font-semibold"
                  onClick={() => setShowPayment(true)}
                >
                  Bayar Sekarang
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Payment Dialog */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="rounded-3xl p-0 overflow-hidden max-w-sm">
          <div className="bg-gradient-to-br from-primary/10 via-background to-background p-6">
            <DialogHeader>
              <DialogTitle className="text-xl text-center">
                Pilih Pembayaran
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 mt-6">
              {/* Total Display */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  Total Pembayaran
                </p>
                <p className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  {formatCurrency(total)}
                </p>
              </div>

              {/* Payment Options */}
              <div className="space-y-3">
                {PAYMENT_TYPES.map(({ type, label, icon: Icon, color }) => (
                  <Button
                    key={type}
                    variant="outline"
                    className={`w-full h-16 rounded-2xl justify-start gap-4 text-left transition-all duration-200 hover:scale-[1.02] ${
                      isProcessing ? "opacity-50" : ""
                    }`}
                    disabled={isProcessing}
                    onClick={() => handleCheckout(type)}
                  >
                    <div
                      className={`h-12 w-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-lg font-medium">{label}</span>
                  </Button>
                ))}
              </div>

              {isProcessing && (
                <div className="text-center py-4">
                  <div className="inline-flex items-center gap-2 text-primary animate-pulse">
                    <div
                      className="h-2 w-2 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="h-2 w-2 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="h-2 w-2 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                    <span className="ml-2 font-medium">Memproses...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

