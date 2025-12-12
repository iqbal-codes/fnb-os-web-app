import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Setup Your Business',
};

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className='from-background via-background to-primary/5 min-h-screen bg-gradient-to-b'>
      {/* Background decoration */}
      <div className='fixed inset-0 -z-10 overflow-hidden'>
        <div className='bg-primary/10 absolute top-20 left-1/4 h-72 w-72 rounded-full blur-3xl' />
        <div className='bg-chart-3/10 absolute right-1/3 bottom-40 h-64 w-64 rounded-full blur-3xl' />
      </div>

      <main className='container mx-auto max-w-2xl px-4 py-8'>{children}</main>
    </div>
  );
}
