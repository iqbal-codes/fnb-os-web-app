'use client';

import { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  // Use lazy initialization to avoid setState in effect
  const [isInstalled, setIsInstalled] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(display-mode: standalone)').matches : false,
  );

  useEffect(() => {
    // Already installed check handled by lazy init
    if (isInstalled) return;

    // Check if dismissed recently (within 3 days)
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      const threeDays = 3 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < threeDays) {
        return;
      }
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after a delay
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if app was installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, [isInstalled]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className='animate-fade-in fixed right-4 bottom-20 left-4 z-50 md:right-4 md:left-auto md:max-w-sm'>
      <Card className='border-primary/20 bg-background/95 shadow-xl backdrop-blur'>
        <CardContent className='p-4'>
          <div className='flex items-start gap-3'>
            <div className='bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl'>
              <Smartphone className='text-primary h-6 w-6' />
            </div>
            <div className='min-w-0 flex-1'>
              <h3 className='text-sm font-semibold'>Install SajiPlan</h3>
              <p className='text-muted-foreground mt-0.5 text-xs'>
                Akses cepat dari home screen, bekerja offline
              </p>
              <div className='mt-3 flex gap-2'>
                <Button size='sm' onClick={handleInstall} className='flex-1'>
                  <Download className='mr-1 h-4 w-4' />
                  Install
                </Button>
                <Button size='sm' variant='ghost' onClick={handleDismiss}>
                  <X className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Small banner for iOS Safari (doesn't support beforeinstallprompt)
 */
export function IOSInstallBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Only show on iOS Safari
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

    if (isIOS && isSafari && !isStandalone) {
      const dismissed = localStorage.getItem('ios-install-dismissed');
      if (!dismissed) {
        setTimeout(() => setShow(true), 5000);
      }
    }
  }, []);

  if (!show) return null;

  return (
    <div className='animate-fade-in fixed right-4 bottom-20 left-4 z-50'>
      <Card className='shadow-xl'>
        <CardContent className='p-4'>
          <div className='flex items-start gap-3'>
            <div className='text-2xl'>📲</div>
            <div className='flex-1'>
              <p className='text-sm font-medium'>Install SajiPlan</p>
              <p className='text-muted-foreground mt-1 text-xs'>
                Tap{' '}
                <span className='inline-flex items-center'>
                  <svg className='h-4 w-4' viewBox='0 0 24 24' fill='currentColor'>
                    <path d='M12 2l3 3h-2v6h-2V5H9l3-3zm-7 9v10h14V11h2v12H3V11h2z' />
                  </svg>
                </span>{' '}
                lalu &quot;Add to Home Screen&quot;
              </p>
            </div>
            <Button
              size='icon'
              variant='ghost'
              className='h-6 w-6'
              onClick={() => {
                setShow(false);
                localStorage.setItem('ios-install-dismissed', 'true');
              }}
            >
              <X className='h-4 w-4' />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
