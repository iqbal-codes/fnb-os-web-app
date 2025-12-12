'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { ChefHat, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Link, useRouter } from '@/i18n/navigation';
import { useRegister } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  const t = useTranslations();
  const router = useRouter();
  const registerMutation = useRegister();

  const registerSchema = z
    .object({
      fullName: z.string().min(2, t('errors.nameMin')),
      email: z.string().min(1, t('errors.required')).email(t('errors.invalidEmail')),
      password: z.string().min(6, t('errors.passwordMin')),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('errors.passwordMismatch'),
      path: ['confirmPassword'],
    });

  type RegisterFormData = z.infer<typeof registerSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const result = await registerMutation.mutateAsync({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      });
      toast.success(result.message);
      router.push(result.redirect || '/onboarding');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast.error(message);
    }
  };

  return (
    <div className='animate-fade-in w-full max-w-md'>
      <div className='mb-8 text-center'>
        <Link href='/' className='inline-flex items-center gap-2 text-2xl font-bold'>
          <ChefHat className='text-primary h-8 w-8' />
          <span className='text-primary'>{t('common.appName')}</span>
        </Link>
      </div>

      <Card className='border-border/50'>
        <CardHeader className='pb-4 text-center'>
          <CardTitle className='text-2xl'>{t('auth.register.title')}</CardTitle>
          <CardDescription>{t('auth.register.subtitle')}</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='fullName'>{t('auth.register.fullName')}</Label>
              <div className='relative'>
                <User className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                <Input
                  id='fullName'
                  type='text'
                  placeholder={t('auth.register.fullNamePlaceholder')}
                  className='pl-10'
                  {...register('fullName')}
                />
              </div>
              {errors.fullName && (
                <p className='text-destructive text-sm'>{errors.fullName.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='email'>{t('auth.register.email')}</Label>
              <div className='relative'>
                <Mail className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                <Input
                  id='email'
                  type='email'
                  placeholder={t('auth.register.emailPlaceholder')}
                  className='pl-10'
                  {...register('email')}
                />
              </div>
              {errors.email && <p className='text-destructive text-sm'>{errors.email.message}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='password'>{t('auth.register.password')}</Label>
              <div className='relative'>
                <Lock className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                <Input
                  id='password'
                  type='password'
                  placeholder={t('auth.register.passwordPlaceholder')}
                  className='pl-10'
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className='text-destructive text-sm'>{errors.password.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='confirmPassword'>{t('auth.register.confirmPassword')}</Label>
              <div className='relative'>
                <Lock className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
                <Input
                  id='confirmPassword'
                  type='password'
                  placeholder={t('auth.register.passwordPlaceholder')}
                  className='pl-10'
                  {...register('confirmPassword')}
                />
              </div>
              {errors.confirmPassword && (
                <p className='text-destructive text-sm'>{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type='submit'
              className='touch-target w-full'
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                <>
                  {t('auth.register.createAccount')}
                  <ArrowRight className='ml-2 h-4 w-4' />
                </>
              )}
            </Button>
          </form>

          <p className='text-muted-foreground mt-6 text-center text-sm'>
            {t('auth.register.hasAccount')}{' '}
            <Link href='/login' className='text-primary font-medium hover:underline'>
              {t('auth.register.signIn')}
            </Link>
          </p>
        </CardContent>
      </Card>

      <p className='text-muted-foreground mt-4 px-8 text-center text-xs'>
        {t('auth.register.terms')}{' '}
        <Link href='/terms' className='hover:text-foreground underline'>
          {t('auth.register.termsLink')}
        </Link>{' '}
        {t('auth.register.and')}{' '}
        <Link href='/privacy' className='hover:text-foreground underline'>
          {t('auth.register.privacyLink')}
        </Link>
      </p>
    </div>
  );
}
