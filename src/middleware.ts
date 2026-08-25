import { NextResponse, type NextRequest } from 'next/server';

/**
 * Gate the admin dashboard.
 *
 * This is a ROUTING guard, not the security boundary. It only checks that a session
 * cookie exists — it does not verify the JWT, because the signing secret lives on the
 * Express server and must not be duplicated into the frontend.
 *
 * The real authorisation happens where it belongs: every write endpoint on the API runs
 * `isAuthorized` + `restrictTo`, so a forged cookie buys nothing but a dashboard shell
 * whose every request comes back 401. What this middleware actually prevents is the
 * unauthenticated-user-sees-a-broken-dashboard experience.
 */
const TOKEN_COOKIE = '3mmile_admin_token';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(TOKEN_COOKIE)?.value);

  // The login page itself must stay reachable while signed out.
  if (pathname.startsWith('/admin/login')) {
    if (hasSession) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  if (!hasSession) {
    const login = new URL('/admin/login', request.url);
    // Bounce back to the page they actually wanted once signed in.
    login.searchParams.set('from', pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  // Scoped to /admin only — the public site must never pay this cost.
  matcher: ['/admin/:path*'],
};
