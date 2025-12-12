import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='from-background via-background to-primary/5 flex min-h-screen flex-col bg-gradient-to-b'>
      {/* Background decoration */}
      <div className='fixed inset-0 -z-10 overflow-hidden'>
        <div className='bg-primary/10 absolute top-20 left-1/4 h-72 w-72 rounded-full blur-3xl' />
        <div className='bg-chart-3/10 absolute right-1/4 bottom-20 h-64 w-64 rounded-full blur-3xl' />
      </div>

      <main className='flex flex-1 items-center justify-center p-4'>{children}</main>
    </div>
  );
}
