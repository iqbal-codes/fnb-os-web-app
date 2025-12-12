import type { Metadata } from 'next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Target, TrendingUp, ShoppingCart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Business Planning',
};

export default function PlanningPage() {
  return (
    <div className='animate-fade-in space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-xl font-semibold'>Perencanaan Bisnis</h1>
        <p className='text-muted-foreground text-sm'>Analisis BEP, ROI, dan perencanaan keuangan</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue='bep' className='space-y-4'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='bep' className='text-xs sm:text-sm'>
            <Target className='mr-1 hidden h-4 w-4 sm:inline' />
            BEP
          </TabsTrigger>
          <TabsTrigger value='roi' className='text-xs sm:text-sm'>
            <TrendingUp className='mr-1 hidden h-4 w-4 sm:inline' />
            ROI
          </TabsTrigger>
          <TabsTrigger value='shopping' className='text-xs sm:text-sm'>
            <ShoppingCart className='mr-1 hidden h-4 w-4 sm:inline' />
            Belanja
          </TabsTrigger>
        </TabsList>

        <TabsContent value='bep'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-base'>
                <Calculator className='h-5 w-5' />
                Kalkulator Break-Even Point
              </CardTitle>
              <CardDescription>
                Hitung berapa unit yang harus dijual untuk balik modal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='text-muted-foreground p-8 text-center'>
                <Target className='mx-auto mb-4 h-12 w-12 opacity-50' />
                <p className='text-sm'>Tambahkan data OPEX dan menu untuk menghitung BEP.</p>
                <p className='mt-2 text-xs'>Buka Settings → OPEX untuk input biaya operasional.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='roi'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-base'>
                <TrendingUp className='h-5 w-5' />
                Analisis ROI
              </CardTitle>
              <CardDescription>Proyeksi return on investment dan payback period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='text-muted-foreground p-8 text-center'>
                <TrendingUp className='mx-auto mb-4 h-12 w-12 opacity-50' />
                <p className='text-sm'>
                  Input modal awal dan estimasi penjualan untuk analisis ROI.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='shopping'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-base'>
                <ShoppingCart className='h-5 w-5' />
                Daftar Belanja
              </CardTitle>
              <CardDescription>
                Generate daftar belanja berdasarkan target penjualan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='text-muted-foreground p-8 text-center'>
                <ShoppingCart className='mx-auto mb-4 h-12 w-12 opacity-50' />
                <p className='text-sm'>
                  Fitur ini akan generate daftar bahan yang perlu dibeli berdasarkan target
                  penjualan mingguan.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className='grid grid-cols-2 gap-4'>
        <Card>
          <CardContent className='p-4 text-center'>
            <p className='text-muted-foreground text-xs'>Est. BEP/hari</p>
            <p className='text-primary text-xl font-bold'>-</p>
            <p className='text-muted-foreground text-xs'>unit</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4 text-center'>
            <p className='text-muted-foreground text-xs'>Payback Period</p>
            <p className='text-primary text-xl font-bold'>-</p>
            <p className='text-muted-foreground text-xs'>bulan</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
