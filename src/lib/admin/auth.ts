'use client';

/**
 * Admin session handling.
 *
 * The token lives in a cookie rather than localStorage for one reason: `middleware.ts`
 * runs on the edge, before any React code, and can only see cookies. That is what lets
 * an unauthenticated visit to /admin/services redirect to the login page instead of
 * flashing an empty dashboard first.
 *
 * TRADE-OFF, stated plainly: the cookie is readable by JavaScript, because the browser
 * has to attach the token as an `Authorization: Bearer` header on every admin request.
 * An httpOnly cookie would be safer against XSS but would require proxying every admin
 * write through a Next route handler — a second backend, which the brief rules out.
 * The exposure is bounded by the backend's 15-minute access-token lifetime.
 */

const TOKEN_COOKIE = '3mmile_admin_token';
const USER_KEY = '3mmile_admin_user';

export type AdminUser = { _id: string; fullName?: string; email: string };

export const setSession = (token: string, user: AdminUser) => {
  // `SameSite=Lax` blocks the cookie on cross-site POSTs; `Secure` is added in
  // production, where the dashboard is served over HTTPS.
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  // Session cookie (no Max-Age): closing the browser ends the admin session, which
  // matches a short-lived access token better than a persisted one.
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)}; Path=/; SameSite=Lax${secure}`;
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearSession = () => {
  document.cookie = `${TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  window.localStorage.removeItem(USER_KEY);
};

export const getToken = (): string | null => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${TOKEN_COOKIE}=([^;]*)`));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
};

export const getUser = (): AdminUser | null => {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
};

export const TOKEN_COOKIE_NAME = TOKEN_COOKIE;
