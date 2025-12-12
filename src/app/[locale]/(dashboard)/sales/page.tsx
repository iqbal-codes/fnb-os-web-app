import type { Metadata } from 'next';
import { SalesHistory } from '@/components/pos/SalesHistory';

export const metadata: Metadata = {
  title: 'Riwayat Penjualan',
};

export default function SalesPage() {
  return (
    <div className='animate-fade-in space-y-6'>
      <SalesHistory />
    </div>
  );
}
