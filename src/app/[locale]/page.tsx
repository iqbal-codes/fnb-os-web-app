import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import {
  ChefHat,
  Sparkles,
  Calculator,
  BarChart3,
  ShoppingCart,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();

  const features = [
    {
      icon: Sparkles,
      title: locale === 'id' ? 'AI Business Doctor' : 'AI Business Doctor',
      description:
        locale === 'id'
          ? 'Dapatkan diagnosis bisnis berbasis AI dan rekomendasi untuk meningkatkan profitabilitas'
          : 'Get AI-powered business diagnostics and recommendations to improve profitability',
      color: 'text-primary',
    },
    {
      icon: Calculator,
      title: locale === 'id' ? 'Kalkulasi COGS' : 'COGS Calculator',
      description:
        locale === 'id'
          ? 'Hitung biaya bahan otomatis dan dapatkan rekomendasi harga'
          : 'Calculate ingredient costs automatically and get pricing recommendations',
      color: 'text-chart-2',
    },
    {
      icon: BarChart3,
      title: locale === 'id' ? 'Analisis BEP & ROI' : 'BEP & ROI Analysis',
      description:
        locale === 'id'
          ? 'Ketahui kapan bisnis Anda balik modal dan proyeksikan keuntungan'
          : 'Know when your business will break even and project your profits',
      color: 'text-chart-3',
    },
    {
      icon: ShoppingCart,
      title: locale === 'id' ? 'POS Lite' : 'POS Lite',
      description:
        locale === 'id'
          ? 'Sistem kasir mobile-first yang bekerja offline'
          : 'Mobile-first point of sale system that works offline',
      color: 'text-chart-4',
    },
    {
      icon: TrendingUp,
      title: locale === 'id' ? 'Laporan Real-time' : 'Real-time Reports',
      description:
        locale === 'id'
          ? 'Pantau penjualan, keuntungan, dan performa menu secara real-time'
          : 'Monitor sales, profits, and menu performance in real-time',
      color: 'text-chart-5',
    },
  ];

  return (
    <div className='min-h-screen'>
      {/* Header */}
      <header className='bg-background/80 sticky top-0 z-50 border-b backdrop-blur-lg'>
        <div className='container mx-auto flex h-16 items-center justify-between px-4'>
          <div className='flex items-center gap-2 text-xl font-bold'>
            <ChefHat className='text-primary h-7 w-7' />
            <span className='text-primary'>{t('common.appName')}</span>
          </div>
          <div className='flex items-center gap-2'>
            <LanguageSwitcher />
            <ThemeToggle />
            <Button asChild variant='outline' size='sm'>
              <Link href='/login'>{locale === 'id' ? 'Masuk' : 'Sign In'}</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className='container mx-auto px-4 py-16 text-center md:py-24'>
        <div className='mx-auto max-w-3xl space-y-6'>
          <h1 className='text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl'>
            {locale === 'id' ? 'Sistem Operasi' : 'Your'}{' '}
            <span className='text-primary'>
              {locale === 'id' ? 'Bisnis F&B Anda' : 'F&B Business OS'}
            </span>
          </h1>
          <p className='text-muted-foreground mx-auto max-w-xl text-lg sm:text-xl'>
            {locale === 'id'
              ? 'Rencanakan, jalankan, dan optimalkan bisnis makanan & minuman Anda dengan insight berbasis AI dan tools operasional lengkap.'
              : 'Plan, run, and optimize your food & beverage business with AI-powered insights and complete operational tools.'}
          </p>
          <div className='flex flex-col justify-center gap-4 pt-4 sm:flex-row'>
            <Button asChild size='lg' className='touch-target'>
              <Link href='/register'>
                {locale === 'id' ? 'Mulai Gratis' : 'Get Started Free'}
                <ArrowRight className='ml-2 h-5 w-5' />
              </Link>
            </Button>
            <Button asChild variant='outline' size='lg' className='touch-target'>
              <Link href='/login'>
                {locale === 'id' ? 'Saya Sudah Punya Akun' : 'I Have an Account'}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='container mx-auto px-4 py-16'>
        <div className='mb-12 text-center'>
          <h2 className='mb-4 text-2xl font-bold sm:text-3xl'>
            {locale === 'id' ? 'Semua yang Anda Butuhkan' : 'Everything You Need'}
          </h2>
          <p className='text-muted-foreground mx-auto max-w-2xl'>
            {locale === 'id'
              ? 'Dari perencanaan bisnis hingga operasional harian, eFeNBi membantu Anda mengelola semua aspek bisnis F&B.'
              : 'From business planning to daily operations, eFeNBi helps you manage every aspect of your F&B business.'}
          </p>
        </div>

        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {features.map((feature, index) => (
            <Card key={index} className='transition-shadow hover:shadow-lg'>
              <CardHeader>
                <div
                  className={`bg-muted mb-2 flex h-12 w-12 items-center justify-center rounded-lg ${feature.color}`}
                >
                  <feature.icon className='h-6 w-6' />
                </div>
                <CardTitle className='text-lg'>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className='text-sm'>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className='container mx-auto px-4 py-16'>
        <Card className='bg-primary/5 border-primary/20'>
          <CardContent className='py-12 text-center'>
            <h2 className='mb-4 text-2xl font-bold sm:text-3xl'>
              {locale === 'id'
                ? 'Siap Mulai Bisnis F&B Anda?'
                : 'Ready to Start Your F&B Business?'}
            </h2>
            <p className='text-muted-foreground mx-auto mb-6 max-w-xl'>
              {locale === 'id'
                ? 'Bergabung dengan ribuan pebisnis F&B yang sudah menggunakan eFeNBi untuk mengelola bisnis mereka.'
                : 'Join thousands of F&B entrepreneurs who are already using eFeNBi to manage their businesses.'}
            </p>
            <Button asChild size='lg'>
              <Link href='/register'>
                {locale === 'id' ? 'Buat Akun Gratis' : 'Create Free Account'}
                <ArrowRight className='ml-2 h-5 w-5' />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className='text-muted-foreground container mx-auto border-t px-4 py-8 text-center text-sm'>
        <p>
          © 2025 eFeNBi.{' '}
          {locale === 'id' ? 'Dibuat untuk entrepreneur F&B.' : 'Built for F&B entrepreneurs.'}
        </p>
      </footer>
    </div>
  );
}
