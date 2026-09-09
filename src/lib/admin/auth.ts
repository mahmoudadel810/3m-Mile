'use client';

/**
 * Admin session handling.
 *
 * The token lives in a cookie rather than localStorage for one reason: `middleware.ts`
 * runs on the edge, before any React code, and can only see cookies. That is what lets
 * an unauthenticated visit to /admin/services redirect to the login page instead of
 * flashing an empty dashboard first.
 *
 * Trade-off: the cookie is readable by JavaScript, since the browser attaches it as a
 * Bearer header. An httpOnly cookie would need every admin write proxied through Next.
 * The refresh token in localStorage is exposed the same way; a password change revokes
 * both server-side.
 */

import { apiUrl } from '@/lib/api/client';

const TOKEN_COOKIE = '3mmile_admin_token';
const USER_KEY = '3mmile_admin_user';
// localStorage, not a cookie: only this app's JS reads it.
const REFRESH_KEY = '3mmile_admin_refresh';

export type AdminUser = { _id: string; fullName?: string; email: string };

const writeTokenCookie = (token: string) => {
  // `SameSite=Lax` blocks the cookie on cross-site POSTs; `Secure` is added in
  // production, where the dashboard is served over HTTPS.
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  // Session cookie (no Max-Age): closing the browser ends the admin session, which
  // matches a short-lived access token better than a persisted one.
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)}; Path=/; SameSite=Lax${secure}`;
};

export const setSession = (token: string, user: AdminUser, refreshToken?: string) => {
  writeTokenCookie(token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  // Omitted when only the access token is rotated.
  if (refreshToken) window.localStorage.setItem(REFRESH_KEY, refreshToken);
};

export const clearSession = () => {
  document.cookie = `${TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  window.localStorage.removeItem(USER_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
};

export const getRefreshToken = (): string | null =>
  typeof window === 'undefined' ? null : window.localStorage.getItem(REFRESH_KEY);

/**
 * Exchange the stored refresh token for a new access token. Returns `null` when there
 * is no refresh token or the backend rejects it; the caller then falls back to login.
 */
export async function refreshSession(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  const res = await fetch(apiUrl('/auth/refresh'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  }).catch(() => null);

  const data = res?.ok ? ((await res.json().catch(() => null))?.data ?? null) : null;
  if (!data?.accessToken) return null;

  // Write the cookie even without a stored user, or every request would refresh again.
  const user = getUser();
  if (user) setSession(data.accessToken, user);
  else writeTokenCookie(data.accessToken);
  return data.accessToken as string;
}

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
