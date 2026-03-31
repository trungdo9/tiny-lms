import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/login', '/register', '/auth', '/api/health'];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // Get supabase auth token from cookie
  const supabaseToken = request.cookies.get('sb-access-token')?.value;
  const supabaseRefreshToken = request.cookies.get('sb-refresh-token')?.value;

  if (!supabaseToken && !supabaseRefreshToken) {
    // Not authenticated — redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify token and get role via API
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${apiUrl}/users/me`, {
      headers: {
        Authorization: `Bearer ${supabaseToken || supabaseRefreshToken}`,
      },
      // Don't wait for full page load — quick auth check
      cache: 'no-store',
    });

    if (!res.ok) {
      // Token invalid/expired — redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('returnTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const user = await res.json();
    const role = user?.role || 'student';

    // Role-based access control
    if (pathname.startsWith('/admin') && role !== 'admin') {
      // Not admin — redirect based on role
      const redirectUrl = role === 'instructor' ? '/instructor/courses' : '/dashboard';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    if (pathname.startsWith('/instructor') && role !== 'instructor' && role !== 'admin') {
      // Not instructor or admin — redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  } catch {
    // Network/server error — don't block, let the page handle it
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - Static assets (images, fonts, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2)).*)',
  ],
};
