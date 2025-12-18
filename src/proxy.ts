import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Create the i18n middleware
const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  // Skip API and auth callback routes from i18n processing
  if (request.nextUrl.pathname.startsWith('/api') || request.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.next();
  }

  // Apply i18n middleware first
  const response = intlMiddleware(request);

  // Create Supabase client for session management
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session if needed
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // Match all pathnames except:
  // - API routes
  // - Static files
  // - _next
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
