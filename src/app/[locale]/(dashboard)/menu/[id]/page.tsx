import type { Metadata } from 'next';
import { MenuForm } from '@/components/menu/MenuForm';

export const metadata: Metadata = {
  title: 'Edit Menu',
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditMenuPage({ params }: Props) {
  const { id } = await params;

  return (
    <div className='animate-fade-in'>
      <MenuForm menuId={id} />
    </div>
  );
}
