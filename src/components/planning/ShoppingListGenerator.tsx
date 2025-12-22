'use client';

import { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Minus,
  Download,
  Share2,
  Check,
  AlertTriangle,
  Package,
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useInventory, type InventoryWithIngredient } from '@/hooks/useInventory';
import { formatRupiah } from '@/hooks/useOpex';

interface ShoppingItem {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
  suggestedQty: number;
  adjustedQty: number;
  unit: string;
  estimatedPrice: number;
  checked: boolean;
}

export function ShoppingListGenerator() {
  const { data: inventoryData, isLoading } = useInventory();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [generated, setGenerated] = useState(false);

  // Generate shopping list from low stock items
  const generateList = () => {
    const inventory: InventoryWithIngredient[] = inventoryData || [];
    const lowStock = inventory.filter((item) => item.current_stock <= (item.min_stock || 0));

    const shoppingItems: ShoppingItem[] = lowStock.map((item) => {
      const deficit = Math.max(0, (item.min_stock || 0) * 2 - item.current_stock);
      return {
        id: item.ingredient_id,
        name: item.ingredient?.name || 'Unknown',
        currentStock: item.current_stock,
        minStock: item.min_stock || 0,
        suggestedQty: deficit,
        adjustedQty: deficit,
        unit: item.unit,
        estimatedPrice: 0, // Would need price from ingredients table
        checked: false,
      };
    });

    setItems(shoppingItems);
    setGenerated(true);
  };

  const updateQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, adjustedQty: Math.max(0, item.adjustedQty + delta) } : item,
      ),
    );
  };

  const toggleChecked = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)),
    );
  };

  const totalEstimate = items.reduce(
    (sum, item) => sum + item.adjustedQty * item.estimatedPrice,
    0,
  );

  const exportToText = () => {
    const text = items
      .filter((item) => item.adjustedQty > 0)
      .map((item) => `- ${item.name}: ${item.adjustedQty} ${item.unit}`)
      .join('\n');

    if (navigator.share) {
      navigator.share({
        title: 'Daftar Belanja eFeNBi',
        text: `Daftar Belanja:\n${text}\n\nEstimasi Total: ${formatRupiah(totalEstimate)}`,
      });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Daftar belanja disalin ke clipboard');
    }
  };

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <Skeleton className='h-8 w-48' />
        <Skeleton className='h-32 w-full' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='flex items-center gap-2 text-xl font-semibold'>
            <ShoppingCart className='h-5 w-5' />
            Daftar Belanja
          </h1>
          <p className='text-muted-foreground text-sm'>Generate dari stok rendah</p>
        </div>
        {!generated ? (
          <Button onClick={generateList}>
            <Plus className='mr-1 h-4 w-4' />
            Generate
          </Button>
        ) : (
          <Button variant='outline' onClick={exportToText}>
            <Share2 className='mr-1 h-4 w-4' />
            Share
          </Button>
        )}
      </div>

      {!generated ? (
        <Card>
          <CardContent className='py-12 text-center'>
            <ShoppingCart className='text-muted-foreground mx-auto mb-3 h-12 w-12 opacity-50' />
            <p className='text-muted-foreground mb-4'>
              Generate daftar belanja otomatis berdasarkan stok rendah
            </p>
            <Button onClick={generateList}>
              <Package className='mr-2 h-4 w-4' />
              Cek Stok & Generate
            </Button>
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className='py-12 text-center'>
            <Check className='mx-auto mb-3 h-12 w-12 text-green-500' />
            <p className='font-medium text-green-600'>Stok Aman!</p>
            <p className='text-muted-foreground text-sm'>Tidak ada bahan yang perlu dibeli</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Shopping List */}
          <div className='space-y-3'>
            {items.map((item) => (
              <Card key={item.id} className={item.checked ? 'opacity-60' : ''}>
                <CardContent className='p-4'>
                  <div className='flex items-center gap-3'>
                    <Checkbox
                      checked={item.checked}
                      onCheckedChange={() => toggleChecked(item.id)}
                    />
                    <div className='min-w-0 flex-1'>
                      <p className={`font-medium ${item.checked ? 'line-through' : ''}`}>
                        {item.name}
                      </p>
                      <div className='text-muted-foreground flex items-center gap-2 text-xs'>
                        <Badge variant='outline' className='text-xs'>
                          Stok: {item.currentStock} {item.unit}
                        </Badge>
                        {item.currentStock <= item.minStock && (
                          <Badge variant='destructive' className='text-xs'>
                            <AlertTriangle className='mr-1 h-3 w-3' />
                            Rendah
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='outline'
                        size='icon'
                        className='h-8 w-8'
                        onClick={() => updateQty(item.id, -1)}
                        disabled={item.adjustedQty === 0}
                      >
                        <Minus className='h-3 w-3' />
                      </Button>
                      <div className='w-16 text-center'>
                        <span className='font-bold'>{item.adjustedQty}</span>
                        <span className='text-muted-foreground ml-1 text-xs'>{item.unit}</span>
                      </div>
                      <Button
                        variant='outline'
                        size='icon'
                        className='h-8 w-8'
                        onClick={() => updateQty(item.id, 1)}
                      >
                        <Plus className='h-3 w-3' />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Total Estimate */}
          <Card className='bg-primary/5 border-primary/20'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-muted-foreground text-sm'>Estimasi Total Belanja</p>
                  <p className='text-primary text-2xl font-bold'>{formatRupiah(totalEstimate)}</p>
                </div>
                <Button onClick={exportToText}>
                  <Download className='mr-1 h-4 w-4' />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
