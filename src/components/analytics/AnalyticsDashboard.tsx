'use client';

import { useState } from 'react';
import { DollarSign, TrendingUp, Package, BarChart3, FileDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SalesTrendChart } from '@/components/analytics/SalesTrendChart';
import { MenuRanking } from '@/components/analytics/MenuRanking';
import { CostBreakdownChart } from '@/components/analytics/CostBreakdownChart';
import { useSalesSummary, formatCurrency } from '@/hooks/useAnalytics';

type Period = 'week' | 'month';

export function AnalyticsDashboard() {
  const [period, setPeriod] = useState<Period>('month');
  const { data: summary, isLoading: summaryLoading } = useSalesSummary();

  return (
    <div className='animate-fade-in space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold'>Analitik & Laporan</h1>
          <p className='text-muted-foreground text-sm'>Pantau performa bisnis dan tren penjualan</p>
        </div>
        <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <SelectTrigger className='w-32'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='week'>7 Hari</SelectItem>
            <SelectItem value='month'>30 Hari</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className='grid grid-cols-2 gap-4'>
        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg'>
                <DollarSign className='text-primary h-5 w-5' />
              </div>
              <div>
                <p className='text-muted-foreground text-xs'>
                  Penjualan {period === 'week' ? 'Minggu' : 'Bulan'} Ini
                </p>
                {summaryLoading ? (
                  <Skeleton className='h-6 w-24' />
                ) : (
                  <p className='text-lg font-bold'>
                    {formatCurrency(period === 'week' ? summary?.week || 0 : summary?.month || 0)}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10'>
                <TrendingUp className='h-5 w-5 text-green-600' />
              </div>
              <div>
                <p className='text-muted-foreground text-xs'>Hari Ini</p>
                {summaryLoading ? (
                  <Skeleton className='h-6 w-20' />
                ) : (
                  <p className='text-lg font-bold'>{formatCurrency(summary?.today || 0)}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10'>
                <Package className='h-5 w-5 text-orange-600' />
              </div>
              <div>
                <p className='text-muted-foreground text-xs'>Total Pesanan</p>
                {summaryLoading ? (
                  <Skeleton className='h-6 w-12' />
                ) : (
                  <p className='text-lg font-bold'>
                    {period === 'week' ? summary?.weekOrders || 0 : summary?.monthOrders || 0}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10'>
                <BarChart3 className='h-5 w-5 text-blue-600' />
              </div>
              <div>
                <p className='text-muted-foreground text-xs'>Avg. Order</p>
                {summaryLoading ? (
                  <Skeleton className='h-6 w-20' />
                ) : (
                  <p className='text-lg font-bold'>{formatCurrency(summary?.avgOrderValue || 0)}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue='sales' className='space-y-4'>
        <TabsList className='w-full'>
          <TabsTrigger value='sales' className='flex-1'>
            Penjualan
          </TabsTrigger>
          <TabsTrigger value='products' className='flex-1'>
            Produk
          </TabsTrigger>
          <TabsTrigger value='costs' className='flex-1'>
            Biaya
          </TabsTrigger>
        </TabsList>

        <TabsContent value='sales'>
          <SalesTrendChart period={period} />
        </TabsContent>

        <TabsContent value='products'>
          <MenuRanking period={period} />
        </TabsContent>

        <TabsContent value='costs'>
          <CostBreakdownChart period={period} />
        </TabsContent>
      </Tabs>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-base'>
            <FileDown className='h-4 w-4' />
            Ekspor Laporan
          </CardTitle>
          <CardDescription>Download laporan dalam format CSV atau PDF</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex gap-3'>
            <Button variant='outline' className='flex-1' disabled>
              📄 Export CSV
            </Button>
            <Button variant='outline' className='flex-1' disabled>
              📊 Export PDF
            </Button>
          </div>
          <p className='text-muted-foreground mt-2 text-xs'>
            Fitur ekspor akan aktif setelah ada data transaksi.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
