import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes
  const isPublicRoute = pathname === '/login' || pathname === '/signup' || pathname === '/favicon.ico';
  const isApiAuthRoute = pathname.startsWith('/api/auth');

  // If it's an API route (other than auth), we expect a Bearer token in headers 
  // (handled by the API routes themselves via getAuthUser)
  if (pathname.startsWith('/api') && !isApiAuthRoute) {
    return NextResponse.next();
  }

  // For page routes
  if (!token && !isPublicRoute && !pathname.startsWith('/_next') && !pathname.includes('.')) {
    // Redirect to login if no token and not on public route
    // Note: Since I'm using localStorage for tokens, middleware won't see them initially.
    // I should ideally use cookies for middleware protection.
    // For now, I'll rely on the client-side protection in layout.tsx as primary,
    // but I'll add this here in case the user wants to switch to cookies later.
    // However, without cookies, this middleware will redirect everyone to /login.
    
    // So I will skip the middleware redirect if I'm using localStorage-only auth.
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (api routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
