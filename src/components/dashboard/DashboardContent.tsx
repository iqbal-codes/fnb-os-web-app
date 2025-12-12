'use client';

import { useRouter, useParams } from 'next/navigation';
import {
  ShoppingCart,
  UtensilsCrossed,
  Package,
  BarChart3,
  Sparkles,
  ArrowRight,
  LogOut,
  Settings,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { useLogout } from '@/hooks/useAuth';
import { useDashboardStats } from '@/hooks/useDashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Business } from '@/types';
import { Link } from '@/i18n/navigation';

interface DashboardContentProps {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
    };
  };
  business: Business | null;
}

const quickActions = [
  {
    href: '/pos',
    label: 'Open POS',
    icon: ShoppingCart,
    color: 'bg-primary/10 text-primary',
  },
  {
    href: '/menu',
    label: 'Manage Menu',
    icon: UtensilsCrossed,
    color: 'bg-chart-2/10 text-chart-2',
  },
  {
    href: '/inventory',
    label: 'Inventory',
    icon: Package,
    color: 'bg-chart-3/10 text-chart-3',
  },
  {
    href: '/analytics',
    label: 'Analytics',
    icon: BarChart3,
    color: 'bg-chart-4/10 text-chart-4',
  },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function DashboardContent({ user, business }: DashboardContentProps) {
  const router = useRouter();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const logout = useLogout();

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const businessName = business?.name || 'Your Business';

  const handleLogout = async () => {
    try {
      const result = await logout.mutateAsync();
      toast.success('Logged out successfully');
      router.push(result.redirect || '/login');
      router.refresh();
    } catch {
      router.push('/login');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className='animate-fade-in space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold'>
            {getGreeting()}, {userName.split(' ')[0]}!
          </h1>
          <p className='text-muted-foreground text-sm'>{businessName}</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' size='icon' className='rounded-full'>
              <Avatar className='h-9 w-9'>
                <AvatarFallback className='bg-primary/10 text-primary'>
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-48'>
            <div className='px-2 py-1.5'>
              <p className='text-sm font-medium'>{userName}</p>
              <p className='text-muted-foreground text-xs'>{user.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href='/settings'>
                <Settings className='mr-2 h-4 w-4' />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className='text-destructive'>
              <LogOut className='mr-2 h-4 w-4' />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* No business alert */}
      {!business && (
        <Card className='border-orange-500/50 bg-orange-500/5'>
          <CardContent className='p-4'>
            <div className='flex items-start gap-3'>
              <AlertCircle className='mt-0.5 h-5 w-5 text-orange-500' />
              <div>
                <p className='text-sm font-medium'>Complete your setup</p>
                <p className='text-muted-foreground text-sm'>
                  Set up your business to unlock all features
                </p>
                <Button asChild size='sm' className='mt-2'>
                  <Link href='/onboarding'>
                    Complete Setup
                    <ArrowRight className='ml-2 h-3 w-3' />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className='grid grid-cols-2 gap-3'>
        <Card>
          <CardContent className='p-4'>
            <div className='text-muted-foreground mb-1 flex items-center gap-2 text-sm'>
              <TrendingUp className='h-4 w-4' />
              Today&apos;s Sales
            </div>
            {statsLoading ? (
              <Skeleton className='h-8 w-24' />
            ) : (
              <p className='text-2xl font-bold'>{formatCurrency(stats?.todaySales || 0)}</p>
            )}
            <p className='text-muted-foreground text-xs'>{stats?.todayOrders || 0} orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className='p-4'>
            <div className='text-muted-foreground mb-1 flex items-center gap-2 text-sm'>
              <Sparkles className='h-4 w-4' />
              Health Score
            </div>
            {statsLoading ? (
              <Skeleton className='h-8 w-16' />
            ) : (
              <p className='text-2xl font-bold'>{stats?.healthScore ?? '--'}</p>
            )}
            <p className='text-muted-foreground text-xs'>
              {stats?.healthScore ? 'Good standing' : 'Not enough data'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className='text-muted-foreground mb-3 text-sm font-medium'>Quick Actions</h2>
        <div className='grid grid-cols-2 gap-3'>
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className='transition-all hover:-translate-y-0.5 hover:shadow-md'>
                <CardContent className='p-4'>
                  <div
                    className={`h-10 w-10 rounded-lg ${action.color} mb-3 flex items-center justify-center`}
                  >
                    <action.icon className='h-5 w-5' />
                  </div>
                  <p className='text-sm font-medium'>{action.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* AI Business Doctor Card */}
      <Card className='overflow-hidden'>
        <CardHeader className='relative pb-2'>
          <CardTitle className='flex items-center gap-2 text-base'>
            <Sparkles className='text-primary h-5 w-5' />
            AI Business Doctor
          </CardTitle>
        </CardHeader>
        <CardContent className='relative pb-6'>
          <p className='text-muted-foreground mb-3 text-sm'>
            Get AI-powered insights about your business health and recommendations to improve
            profitability.
          </p>
          <Button asChild variant='outline' size='sm'>
            <Link href='/ai-doctor'>
              View Insights
              <ArrowRight className='ml-2 h-3 w-3' />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
