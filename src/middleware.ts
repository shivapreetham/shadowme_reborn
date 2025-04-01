import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Default middleware for next-auth
export { default } from 'next-auth/middleware';

// Update matcher to include new routes
export const config = {
  matcher: [
    '/dashboard', 
    '/sign-in', 
    '/sign-up', 
    '/', 
    '/verify/:path*', 
    '/:path*',
    '/conversation/:path*',
    '/users',
    '/conversations',
    '/attendance/:path*',
    '/videoChat/:path*',
  ],
};

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const url = request.nextUrl;

  // Redirect to dashboard if the user is already authenticated
  if (
    token &&
    (url.pathname === '/sign-in' ||
      url.pathname.startsWith('/sign-up') ||
      url.pathname.startsWith('/verify'))
  ) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // Redirect unauthenticated users trying to access protected routes
  if (!token && (url.pathname.startsWith('/dashboard')  || url.pathname.startsWith('/profile') || url.pathname.startsWith('/users') || url.pathname.startsWith('/conversations') || url.pathname.startsWith('/videoChat') || url.pathname.startsWith('/olx') || url.pathname.startsWith('/attendance') )) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  return NextResponse.next();
}
