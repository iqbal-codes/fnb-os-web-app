import type { Metadata } from 'next';
import { MenuForm } from '@/components/menu/MenuForm';

export const metadata: Metadata = {
  title: 'Tambah Menu',
};

export default function NewMenuPage() {
  return (
    <div className='animate-fade-in'>
      <MenuForm />
    </div>
  );
}
