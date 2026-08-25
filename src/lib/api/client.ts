/**
 * The single seam between this app and the Express API.
 *
 * Everything the site reads goes through here, which is what keeps the envelope,
 * pagination and error handling in one place instead of spread across page components.
 * See `docs/INTEGRATION-AUDIT.md` in the server repo for the full contract audit.
 *
 * THE BACKEND ENVELOPE
 *
 *   { success, message, responseAt, data }
 *
 * and for list endpoints `data` is itself `{ count, rows, total, data }` — `rows` and
 * `data` being the same array under two names. The frontend's types want neither shape,
 * so unwrapping happens here, once.
 *
 * FAILURE POLICY: reads never throw.
 *
 * The CMS launches with an empty database, so "no content" is the normal day-one state
 * rather than an error, and a marketing page must still render if the API is briefly
 * unreachable. Every accessor therefore supplies a safe fallback and a failed fetch
 * degrades to it, logged server-side. Writes (the admin dashboard) do the opposite —
 * see `postForm` — because an admin who clicks Save needs to know it failed.
 */

const BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1'
).replace(/\/$/, '');

/**
 * How long a public page may serve cached content before revalidating.
 *
 * The site was 285 fully static routes before the CMS; going fully dynamic would
 * regress that badly for a marketing site. ISR keeps pages static-fast and lets admin
 * edits appear without a redeploy.
 */
export const DEFAULT_REVALIDATE = 60;

export type Envelope<T> = { success: boolean; message: string; responseAt: string; data: T };

/** What the backend's `findAndCountAll` returns inside `data`. */
type BackendList<T> = { count: number; rows: T[]; total: number; data: T[] };

export type Paged<T> = { items: T[]; page: number; totalPages: number; total: number };

export const apiUrl = (path: string) => `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

type GetOptions = {
  /** Seconds; `false` opts out of caching entirely (used by the admin). */
  revalidate?: number | false;
  /** Bearer token, for admin reads that need one. */
  token?: string;
};

/**
 * GET one resource. Returns `null` on any failure — see the failure policy above.
 */
export async function apiGet<T>(path: string, options: GetOptions = {}): Promise<T | null> {
  const { revalidate = DEFAULT_REVALIDATE, token } = options;

  try {
    const res = await fetch(apiUrl(path), {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      ...(revalidate === false ? { cache: 'no-store' } : { next: { revalidate } }),
    });

    // 404 is a legitimate answer for "this slug does not exist", not an incident.
    if (res.status === 404) return null;

    if (!res.ok) {
      console.error(`[api] GET ${path} → ${res.status}`);
      return null;
    }

    const body = (await res.json()) as Envelope<T>;
    return body?.data ?? null;
  } catch (error) {
    // Backend down, DNS failure, connection refused. The page still renders.
    console.error(`[api] GET ${path} failed:`, (error as Error).message);
    return null;
  }
}

/** Narrow a backend list payload to a plain array, whatever it came back as. */
const rowsOf = <T>(data: BackendList<T> | T[] | null): T[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.rows ?? data.data ?? [];
};

/** GET a list endpoint, flattened to a plain array. */
export async function apiList<T>(path: string, options: GetOptions = {}): Promise<T[]> {
  const data = await apiGet<BackendList<T> | T[]>(path, options);
  return rowsOf(data);
}

/**
 * GET a list endpoint as a page.
 *
 * `totalPages` is derived here because the backend returns `total` but not a page
 * count — deriving it in one place beats every caller doing the same division.
 */
export async function apiPaged<T>(
  path: string,
  perPage: number,
  page = 1,
  options: GetOptions = {},
): Promise<Paged<T>> {
  const data = await apiGet<BackendList<T>>(path, options);
  const items = rowsOf(data);
  const total = data?.total ?? data?.count ?? items.length;

  return {
    items,
    page,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
    total,
  };
}

export type ApiResult<T> =
  | { ok: true; data: T }
  /**
   * `payload` is the backend's error envelope, untouched — `lib/admin/errors.ts` turns
   * it into a field-aware Arabic message. `error` is the fallback for callers that don't.
   */
  | { ok: false; error: string; status?: number; payload?: unknown; network?: boolean };

/**
 * Admin writes. Unlike reads, these surface failure to the caller: the dashboard has to
 * tell the admin their save did not land.
 *
 * `FormData` rather than JSON because most writes carry a file, and the backend's
 * multipart coercions (see shared.validator.js) expect the form encoding. The
 * Content-Type header is deliberately NOT set — the browser must add the multipart
 * boundary itself.
 */
export async function sendForm<T>(
  path: string,
  method: 'POST' | 'PUT',
  body: FormData,
  token: string,
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(apiUrl(path), {
      method,
      headers: { Authorization: `Bearer ${token}` },
      body,
    });

    const payload = await res.json().catch(() => null);

    if (!res.ok) {
      return { ok: false, error: genericMessage(res.status), status: res.status, payload };
    }
    return { ok: true, data: payload?.data as T };
  } catch (error) {
    console.error('[api] write failed:', (error as Error).message);
    return { ok: false, error: NETWORK_MESSAGE, network: true };
  }
}

/** Admin JSON write, for the resources that carry no file. */
export async function sendJson<T>(
  path: string,
  method: 'POST' | 'PUT' | 'DELETE',
  body: unknown,
  token: string,
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(apiUrl(path), {
      method,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json; charset=utf-8' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const payload = await res.json().catch(() => null);

    if (!res.ok) {
      return { ok: false, error: genericMessage(res.status), status: res.status, payload };
    }
    return { ok: true, data: payload?.data as T };
  } catch (error) {
    console.error('[api] write failed:', (error as Error).message);
    return { ok: false, error: NETWORK_MESSAGE, network: true };
  }
}

const NETWORK_MESSAGE = 'تعذّر الاتصال بالخادم. تأكد من اتصالك بالإنترنت ثم حاول مجدداً.';

/** Coarse Arabic fallback for a failed write. No status code — it means nothing to an admin. */
function genericMessage(status: number): string {
  if (status === 401) return 'انتهت جلستك. يرجى تسجيل الدخول من جديد.';
  if (status === 403) return 'لا تملك صلاحية تنفيذ هذا الإجراء.';
  if (status === 404) return 'العنصر المطلوب غير موجود أو تم حذفه.';
  if (status >= 500) return 'حدث خطأ في الخادم. حاول مرة أخرى بعد قليل.';
  return 'تعذّر إتمام العملية — راجع البيانات المُدخلة.';
}
