'use client';

import { useState } from 'react';
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
} from 'lucide-react';

import { useMenus } from '@/hooks/useMenus';
import { usePOSStore } from '@/stores/posStore';
import { useBusinessStore } from '@/stores/businessStore';
import { apiClient } from '@/lib/api/client';
import {
  addOfflineOrder,
  getOfflineOrderNumber,
  useOfflineOrderSync,
} from '@/hooks/useOfflineSync';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import Image from 'next/image';

const PAYMENT_TYPES = [
  {
    type: 'cash' as const,
    label: 'Tunai',
    icon: Banknote,
    color: 'from-green-500 to-emerald-600',
  },
  {
    type: 'qris' as const,
    label: 'QRIS',
    icon: Smartphone,
    color: 'from-blue-500 to-indigo-600',
  },
  {
    type: 'card' as const,
    label: 'Kartu',
    icon: CreditCard,
    color: 'from-purple-500 to-pink-600',
  },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function POSInterface() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data, isLoading } = useMenus({ active: true });
  const menus = data?.menus || [];

  const { items, subtotal, total, addItem, removeItem, updateQuantity, clearCart, setPaymentType } =
    usePOSStore();

  const { currentBusiness } = useBusinessStore();

  // Filter menus
  const filteredMenus = menus.filter((menu) => {
    const matchesSearch = menu.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || menu.category === selectedCategory;
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
      position: 'top-center',
    });
  };

  const handleCheckout = async (paymentType: 'cash' | 'qris' | 'card') => {
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

      console.log('Checkout payload:', {
        business_id: currentBusiness?.id,
        items: orderItems,
        total,
        paymentType,
      });

      // Call API to save transaction
      const response = await apiClient.post<{ order_number: string }>('/api/sales', {
        business_id: currentBusiness?.id,
        items: orderItems,
        subtotal,
        tax: 0,
        total,
        payment_type: paymentType,
      });

      console.log('Checkout response:', response);

      const orderNumber = response.data.order_number;

      toast.success(`🎉 Pesanan ${orderNumber} berhasil!`, {
        description: `Total: ${formatCurrency(total)} (${paymentType.toUpperCase()})`,
        duration: 3000,
      });

      clearCart();
      setShowPayment(false);
    } catch (error: any) {
      console.error('Checkout error:', error);
      console.error('Error details:', error.response?.data);

      // Temporarily show error to user for debugging
      toast.error(`Gagal menyimpan pesanan: ${error.response?.data?.error || error.message}`);

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
    <div className='flex h-[calc(100vh-7rem)] flex-col'>
      {/* Header with Search */}
      <div className='space-y-4 pb-4'>
        <div className='relative'>
          <Search className='text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2' />
          <Input
            placeholder='Cari menu favorit...'
            className='bg-muted/50 focus-visible:ring-primary/50 h-12 rounded-2xl border-0 pl-12 text-base focus-visible:ring-2'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category Pills */}
        <div className='scrollbar-hide flex gap-2 overflow-x-auto pb-2'>
          <button
            onClick={() => setSelectedCategory(null)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selectedCategory === null
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            } `}
          >
            Semua
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat || null)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              } `}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className='flex-1 overflow-y-auto px-1 pt-2 pb-24'>
        {isLoading ? (
          <div className='grid grid-cols-2 gap-3'>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className='h-44 rounded-xl' />
            ))}
          </div>
        ) : filteredMenus.length === 0 ? (
          <div className='text-muted-foreground py-16 text-center'>
            <p className='font-medium'>Tidak ada menu ditemukan</p>
          </div>
        ) : (
          <div className='grid grid-cols-2 gap-3'>
            {filteredMenus.map((menu) => {
              const cartItem = items.find((i) => i.menu_id === menu.id);

              return (
                <Card
                  key={menu.id}
                  className={`cursor-pointer overflow-hidden py-0! transition-all duration-150 ${
                    cartItem ? 'ring-primary bg-primary/5 ring-2' : 'hover:bg-muted/50'
                  } `}
                  onClick={() => handleAddToCart(menu)}
                >
                  <CardContent className='p-3'>
                    {/* Image Placeholder */}
                    <div className='bg-muted mb-2 flex aspect-square w-full items-center justify-center rounded-lg'>
                      {menu.image_url ? (
                        <Image
                          src={menu.image_url}
                          alt={menu.name}
                          className='h-full w-full rounded-lg object-cover'
                        />
                      ) : (
                        <ImageIcon className='text-muted-foreground/40 h-8 w-8' />
                      )}
                    </div>

                    {/* Name */}
                    <h3 className='truncate text-sm font-medium'>{menu.name}</h3>

                    {/* Price */}
                    <div className='mt-1 flex items-center justify-between'>
                      <span className='text-primary text-sm font-bold'>
                        {formatCurrency(menu.selling_price)}
                      </span>
                      {cartItem && (
                        <span className='text-primary bg-primary/10 rounded-full px-2 py-0.5 text-xs font-medium'>
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
              className='bg-primary hover:bg-primary/90 animate-in slide-in-from-bottom-4 fixed right-4 bottom-20 left-4 h-14 rounded-xl shadow-lg transition-all'
              size='lg'
            >
              <div className='flex w-full items-center'>
                <ShoppingCart className='h-5 w-5' />
                <Badge className='ml-1.5 bg-white/20 px-1.5 py-0 text-xs text-white'>
                  {itemCount}
                </Badge>
                <span className='ml-3 font-medium'>Keranjang</span>
                <span className='ml-auto font-bold'>{formatCurrency(total)}</span>
              </div>
            </Button>
          </SheetTrigger>

          <SheetContent side='bottom' className='flex h-[80vh] flex-col rounded-t-2xl p-0'>
            {/* Handle */}
            <div className='flex justify-center py-3'>
              <div className='bg-muted h-1 w-10 rounded-full' />
            </div>

            {/* Header */}
            <div className='border-b px-4 pb-3'>
              <SheetHeader>
                <SheetTitle className='flex items-center gap-2 text-lg'>
                  Keranjang
                  <Badge variant='secondary' className='text-xs'>
                    {itemCount} item
                  </Badge>
                </SheetTitle>
              </SheetHeader>
            </div>

            {/* Cart Items */}
            <div className='flex-1 space-y-3 overflow-y-auto px-4 py-3'>
              {items.map((item) => (
                <div key={item.id} className='bg-muted/50 flex items-center gap-3 rounded-xl p-3'>
                  {/* Image placeholder */}
                  <div className='bg-muted flex h-12 w-12 shrink-0 items-center justify-center rounded-lg'>
                    <ImageIcon className='text-muted-foreground/40 h-5 w-5' />
                  </div>

                  {/* Info */}
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-medium'>{item.menu_name}</p>
                    <p className='text-primary text-sm font-semibold'>
                      {formatCurrency(item.unit_price)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='outline'
                      size='icon'
                      className='h-8 w-8 rounded-lg'
                      onClick={() => {
                        if (item.quantity === 1) {
                          removeItem(item.id);
                        } else {
                          updateQuantity(item.id, item.quantity - 1);
                        }
                      }}
                    >
                      {item.quantity === 1 ? (
                        <Trash2 className='text-destructive h-3.5 w-3.5' />
                      ) : (
                        <Minus className='h-3.5 w-3.5' />
                      )}
                    </Button>

                    <span className='w-6 text-center text-sm font-semibold'>{item.quantity}</span>

                    <Button
                      variant='outline'
                      size='icon'
                      className='h-8 w-8 rounded-lg'
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className='h-3.5 w-3.5' />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className='bg-background space-y-3 border-t p-4'>
              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>Total</span>
                <span className='text-primary text-xl font-bold'>{formatCurrency(total)}</span>
              </div>

              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='icon'
                  className='h-12 w-12 shrink-0 rounded-xl'
                  onClick={clearCart}
                >
                  <X className='h-5 w-5' />
                </Button>
                <Button
                  className='h-12 flex-1 rounded-xl text-base font-semibold'
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
        <DialogContent className='max-w-sm overflow-hidden rounded-3xl p-0'>
          <div className='from-primary/10 via-background to-background bg-gradient-to-br p-6'>
            <DialogHeader>
              <DialogTitle className='text-center text-xl'>Pilih Pembayaran</DialogTitle>
            </DialogHeader>

            <div className='mt-6 space-y-6'>
              {/* Total Display */}
              <div className='from-primary/20 via-primary/10 rounded-2xl bg-gradient-to-br to-transparent p-6 text-center'>
                <p className='text-muted-foreground mb-1 text-sm'>Total Pembayaran</p>
                <p className='from-primary to-primary/70 bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent'>
                  {formatCurrency(total)}
                </p>
              </div>

              {/* Payment Options */}
              <div className='space-y-3'>
                {PAYMENT_TYPES.map(({ type, label, icon: Icon, color }) => (
                  <Button
                    key={type}
                    variant='outline'
                    className={`h-16 w-full justify-start gap-4 rounded-2xl text-left transition-all duration-200 hover:scale-[1.02] ${
                      isProcessing ? 'opacity-50' : ''
                    }`}
                    disabled={isProcessing}
                    onClick={() => handleCheckout(type)}
                  >
                    <div
                      className={`h-12 w-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}
                    >
                      <Icon className='h-6 w-6 text-white' />
                    </div>
                    <span className='text-lg font-medium'>{label}</span>
                  </Button>
                ))}
              </div>

              {isProcessing && (
                <div className='py-4 text-center'>
                  <div className='text-primary inline-flex animate-pulse items-center gap-2'>
                    <div
                      className='bg-primary h-2 w-2 animate-bounce rounded-full'
                      style={{ animationDelay: '0ms' }}
                    />
                    <div
                      className='bg-primary h-2 w-2 animate-bounce rounded-full'
                      style={{ animationDelay: '150ms' }}
                    />
                    <div
                      className='bg-primary h-2 w-2 animate-bounce rounded-full'
                      style={{ animationDelay: '300ms' }}
                    />
                    <span className='ml-2 font-medium'>Memproses...</span>
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
