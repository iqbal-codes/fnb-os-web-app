import type { Metadata } from 'next';
import { ExportData } from '@/components/settings/ExportData';

export const metadata: Metadata = {
  title: 'Ekspor Data',
};

export default function ExportPage() {
  return (
    <div className='animate-fade-in space-y-6'>
      <ExportData />
    </div>
  );
}
