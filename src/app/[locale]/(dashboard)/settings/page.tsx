import type { Metadata } from 'next';
import { SettingsPanel } from '@/components/settings/SettingsPanel';

export const metadata: Metadata = {
  title: 'Pengaturan',
};

export default function SettingsPage() {
  return (
    <div className='animate-fade-in space-y-6'>
      <SettingsPanel />
    </div>
  );
}
