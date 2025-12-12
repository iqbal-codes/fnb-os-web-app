import type { Metadata } from 'next';
import { InventoryList } from '@/components/inventory/InventoryList';
import { LowStockAlert } from '@/components/inventory/LowStockAlert';

export const metadata: Metadata = {
  title: 'Inventory',
};

export default function InventoryPage() {
  return (
    <div className='animate-fade-in space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-xl font-semibold'>Inventory</h1>
        <p className='text-muted-foreground text-sm'>Track ingredient stock levels</p>
      </div>

      {/* Low Stock Alert */}
      <LowStockAlert />

      {/* Inventory List */}
      <InventoryList />
    </div>
  );
}
