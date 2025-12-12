import type { Metadata } from 'next';
import { BusinessDoctor } from '@/components/ai/BusinessDoctor';

export const metadata: Metadata = {
  title: 'AI Business Doctor',
};

export default function AIDoctorage() {
  return (
    <div className='animate-fade-in space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-xl font-semibold'>AI Business Doctor</h1>
        <p className='text-muted-foreground text-sm'>
          Analisis kesehatan bisnis dan rekomendasi AI
        </p>
      </div>

      {/* AI Doctor Component */}
      <BusinessDoctor />
    </div>
  );
}
