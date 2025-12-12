import type { Metadata } from 'next';
import { HelpCenter } from '@/components/settings/HelpCenter';

export const metadata: Metadata = {
  title: 'Bantuan',
};

export default function HelpPage() {
  return (
    <div className='animate-fade-in space-y-6'>
      <HelpCenter />
    </div>
  );
}
