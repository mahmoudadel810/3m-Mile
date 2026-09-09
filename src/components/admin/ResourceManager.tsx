'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fieldLabels, findResource, type AdminField } from '@/lib/admin/resources';
import { MEDIA_SPECS, checkAspect } from '@/lib/admin/mediaSpec';
import { apiUrl, sendForm, sendJson } from '@/lib/api/client';
import { clearSession, getToken, refreshSession } from '@/lib/admin/auth';
import { confirmDiscardChanges } from '@/lib/admin/unsavedGuard';
import {
  NETWORK_ERROR_MESSAGE,
  translateApiError,
  type TranslatedError,
} from '@/lib/admin/errors';
import { Pagination } from '@/components/blog/Pagination';
import { ResourceForm } from './ResourceForm';

const PAGE_SIZE = 50;
/** Search has no server param: fetch one page at the API's `?limit=` ceiling and filter client-side. */
const SEARCH_LIMIT = 200;

/**
 * List + create + edit + delete for any entity in `resources.ts`.
 *
 * Handles both API shapes: a COLLECTION (list, POST, PUT /:id, DELETE /:id) and a
 * SINGLETON (one document, PUT only — nothing to add or remove).
 *
 * TAKES THE RESOURCE KEY, NOT THE CONFIG OBJECT
 *
 * The config carries `pattern.test` RegExps (see SLUG_FIELD), and a RegExp cannot cross
 * the server/client boundary — React refuses to serialize it and the whole screen dies
 * with "Only plain objects ... can be passed to Client Components". Looking the config
 * up here instead costs nothing, because `resources.ts` is already in the client bundle
 * (AdminShell and ResourceForm import it directly), and it keeps every future
 * non-serializable value in a config from breaking the dashboard the same way.
 */

type Row = Record<string, unknown>;

const EMPTY_ERROR: TranslatedError = { message: '', fields: {} };

/** Read per request, not at render, so a refreshed token is picked up immediately. */
const currentToken = () => getToken() ?? '';

export function ResourceManager({ resourceKey }: { resourceKey: string }) {
  // Non-null in practice: the page 404s on an unknown key before rendering this.
  const config = findResource(resourceKey)!;
  const isSingleton = config.kind === 'singleton';
  const labels = useMemo(() => fieldLabels(config), [config]);

  const [rows, setRows] = useState<Row[]>([]);
  const [doc, setDoc] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState<TranslatedError>(EMPTY_ERROR);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<Row | null>(null);
  const [query, setQuery] = useState('');

  const router = useRouter();

  // The access token lives 15 minutes; once it expires only a fresh login helps.
  const expireSession = useCallback(() => {
    clearSession();
    router.replace('/admin/login');
  }, [router]);

  // `searchTerm` is a parameter so `load` does not depend on the `query` state.
  const load = useCallback(async (targetPage = 1, searchTerm = '') => {
    setLoading(true);
    setLoadError(null);
    try {
      const isSearching = searchTerm.trim().length > 0;
      const limit = isSearching ? SEARCH_LIMIT : PAGE_SIZE;
      const effectivePage = isSearching ? 1 : targetPage;

      // No isActive filter: the admin list shows hidden rows so they can be restored.
      const listQuery = config.listQuery
        ? `?${config.listQuery}&page=${effectivePage}&limit=${limit}`
        : `?page=${effectivePage}&limit=${limit}`;
      const readPath = config.readEndpoint ?? config.endpoint;
      const url = apiUrl(`${readPath}${isSingleton ? '' : listQuery}`);
      const fetchWith = (t: string) =>
        fetch(url, { headers: { Authorization: `Bearer ${t}` }, cache: 'no-store' });

      let res = await fetchWith(currentToken());
      if (res.status === 401) {
        // Try one silent refresh before bouncing to login.
        const fresh = await refreshSession();
        if (!fresh) {
          expireSession();
          return;
        }
        res = await fetchWith(fresh);
        if (res.status === 401) {
          expireSession();
          return;
        }
      }
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        setLoadError(translateApiError(payload, res.status, labels).message);
        return;
      }

      const body = await res.json();
      if (isSingleton) {
        setDoc((body?.data ?? null) as Row | null);
      } else {
        const pageRows = (body?.data?.rows ?? body?.data?.data ?? []) as Row[];
        setRows(pageRows);
        setTotal(body?.data?.total ?? body?.data?.count ?? pageRows.length);
        setPage(effectivePage);
      }
    } catch (error) {
      console.error(`[admin] load ${config.endpoint} failed:`, (error as Error).message);
      setLoadError(NETWORK_ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
  }, [config, isSingleton, expireSession, labels]);

  useEffect(() => {
    void load();
  }, [load]);

  // Debounced search re-fetch; skips the first render, which the mount effect covers.
  const searchMounted = useRef(false);
  useEffect(() => {
    if (!searchMounted.current) {
      searchMounted.current = true;
      return;
    }
    const timer = setTimeout(() => void load(1, query), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `load` omitted on purpose; only the search box should trigger this
  }, [query]);

  // Auto-dismiss, so the banner reads as an event rather than page furniture.
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 6000);
    return () => clearTimeout(timer);
  }, [notice]);

  const save = async (body: FormData | Record<string, string>) => {
    setSaving(true);
    setFormError(EMPTY_ERROR);

    const path = isSingleton
      ? config.endpoint
      : editing
        ? `${config.endpoint}/${String(editing._id)}`
        : config.endpoint;
    const method = isSingleton || editing ? 'PUT' : 'POST';

    // The form picks its encoding; see ResourceForm.buildBody.
    const token = currentToken();
    const result =
      body instanceof FormData
        ? await sendForm<Row>(path, method, body, token)
        : await sendJson<Row>(path, method, body, token);
    setSaving(false);

    if (!result.ok) {
      if (result.status === 401) {
        expireSession();
        return;
      }
      // Codes and Zod messages become Arabic prose, per field.
      setFormError(
        result.network
          ? { message: NETWORK_ERROR_MESSAGE, fields: {} }
          : translateApiError(result.payload, result.status, labels),
      );
      return;
    }

    const wasEditing = Boolean(editing);
    setEditing(null);
    setCreating(false);
    setNotice(
      isSingleton || wasEditing
        ? 'تم حفظ التعديلات. قد يستغرق ظهورها على الموقع دقيقة.'
        : 'تمت الإضافة بنجاح. قد يستغرق ظهورها على الموقع دقيقة.',
    );
    // Stay on the current page after an edit; new rows sort first, so creating goes to page 1.
    await load(wasEditing ? page : 1);
  };

  const remove = async (row: Row) => {
    setDeleting(true);
    const result = await sendJson(`${config.endpoint}/${String(row._id)}`, 'DELETE', undefined, currentToken());
    setDeleting(false);
    setConfirming(null);

    if (!result.ok) {
      if (result.status === 401) {
        expireSession();
        return;
      }
      setLoadError(
        result.network
          ? NETWORK_ERROR_MESSAGE
          : translateApiError(result.payload, result.status, labels).message,
      );
      return;
    }
    setNotice('تم الحذف.');
    // Page 1, since the current page may now be out of range.
    await load(1);
  };

  // ---------------------------------------------------------------- render

  const columns = config.listColumns ?? [{ name: 'title', label: 'العنوان' }];

  // ⚠ column only for collections with an image field that has a `spec`.
  const badgeableFields = useMemo(
    () => config.fields.filter((f) => (f.type === 'image' || f.type === 'images') && f.spec),
    [config],
  );
  const showBadgeColumn = !isSingleton && badgeableFields.length > 0;

  const visibleRows = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) =>
      columns.some((c) => String(row[c.name] ?? '').toLowerCase().includes(term)),
    );
  }, [rows, query, columns]);

  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true">
        <p className="text-center text-sm text-fg-muted">جارٍ التحميل…</p>
        {/* Skeleton rows, so the layout does not jump on arrival. */}
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-12 animate-pulse rounded-[var(--radius-sm)] bg-glass" />
        ))}
      </div>
    );
  }

  if (loadError && !rows.length && !doc) {
    return (
      <div role="alert" className="rounded-[var(--radius-md)] border border-primary/40 bg-primary/10 p-5">
        <p className="font-bold text-primary">تعذّر تحميل هذه الصفحة</p>
        <p className="mt-1 text-sm text-fg-muted">{loadError}</p>
        <button onClick={() => void load(page)} className="mt-3 rounded-[var(--radius-sm)] border border-line px-4 py-1.5 text-sm">
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const showForm = isSingleton || creating || Boolean(editing);

  return (
    <div className="space-y-6">
      {config.notice && (
        <p role="note" className="rounded-[var(--radius-sm)] border border-primary/40 bg-primary/10 p-3 text-sm text-fg-muted">
          {config.notice}
        </p>
      )}

      {notice && (
        <p role="status" className="rounded-[var(--radius-sm)] border border-line bg-glass p-3 text-sm font-bold text-fg">
          ✓ {notice}
        </p>
      )}

      {/* Failure while content is already on screen. */}
      {loadError && (rows.length > 0 || doc) && (
        <p role="alert" className="rounded-[var(--radius-sm)] border border-primary/50 bg-primary/10 p-3 text-sm text-primary">
          {loadError}
        </p>
      )}

      {!isSingleton && !showForm && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* The title is the <h1> on the page; this is just the count. */}
            <p className="text-sm text-fg-muted">
              {total > 0 ? `${total} عنصراً` : 'لا توجد عناصر'}
            </p>
            <button
              onClick={() => { if (!confirmDiscardChanges()) return; setCreating(true); setFormError(EMPTY_ERROR); }}
              className="rounded-[var(--radius-sm)] bg-primary px-4 py-2 font-bold text-white"
            >
              + إضافة جديد
            </button>
          </div>

          {config.searchable && rows.length > 5 && (
            <div className="max-w-sm">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث في القائمة…"
                aria-label="بحث"
                className="w-full rounded-[var(--radius-sm)] border border-line bg-ink px-3 py-2 text-fg outline-none focus:border-primary"
              />
              {query.trim().length > 0 && total > SEARCH_LIMIT && (
                <p className="mt-1 text-xs text-fg-muted">
                  البحث يشمل أول 200 عنصر فقط — استخدم الصفحات للوصول إلى البقية.
                </p>
              )}
            </div>
          )}

          {rows.length === 0 ? (
            // Empty is the normal state on a fresh install, not a failure.
            <div className="rounded-[var(--radius-md)] border border-dashed border-line p-10 text-center">
              <p className="text-fg-muted">{config.emptyHint ?? 'لا توجد عناصر بعد.'}</p>
              <button
                onClick={() => { if (!confirmDiscardChanges()) return; setCreating(true); setFormError(EMPTY_ERROR); }}
                className="mt-4 rounded-[var(--radius-sm)] bg-primary px-4 py-2 text-sm font-bold text-white"
              >
                + إضافة أول عنصر
              </button>
            </div>
          ) : visibleRows.length === 0 ? (
            <div className="rounded-[var(--radius-md)] border border-dashed border-line p-8 text-center">
              <p className="text-fg-muted">لا توجد نتائج مطابقة لـ «{query}».</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-[var(--radius-md)] border border-line">
              <table className="w-full min-w-[36rem] text-right text-sm">
                <thead className="bg-glass text-fg-muted">
                  <tr>
                    {columns.map((c) => (
                      <th key={c.name} className="p-3 font-bold">{c.label}</th>
                    ))}
                    {showBadgeColumn && <th className="p-3 font-bold">⚠</th>}
                    <th className="p-3 font-bold">الحالة</th>
                    <th className="p-3"><span className="sr-only">إجراءات</span></th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRows.map((row) => (
                    <tr key={String(row._id)} className="border-t border-line">
                      {columns.map((c) => (
                        <td key={c.name} className="p-3 text-fg">{cellText(row, c.name)}</td>
                      ))}
                      {showBadgeColumn && (
                        <td className="p-3 text-fg">
                          <MismatchCount row={row} fields={badgeableFields} />
                        </td>
                      )}
                      <td className="p-3">
                        {row.isActive === false || row.isPublished === false ? (
                          <span className="text-fg-dim">مخفي</span>
                        ) : (
                          <span className="text-primary">ظاهر</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => { if (!confirmDiscardChanges()) return; setEditing(row); setFormError(EMPTY_ERROR); }}
                            className="rounded-[var(--radius-sm)] border border-line px-3 py-1"
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => setConfirming(row)}
                            className="rounded-[var(--radius-sm)] border border-primary/50 px-3 py-1 text-primary"
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Search results are not paged. */}
          {!query && (
            <Pagination
              page={page}
              totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
              onChange={(p) => void load(p)}
            />
          )}
        </>
      )}

      {showForm && (
        <div className="rounded-[var(--radius-md)] border border-line p-5">
          <h2 className="mb-5 text-xl font-bold text-fg">
            {isSingleton
              ? config.label
              : editing
                ? `تعديل: ${String(editing.title ?? editing.name ?? editing.question ?? '')}`
                : `إضافة ${config.label}`}
          </h2>
          <ResourceForm
            config={config}
            doc={isSingleton ? doc : editing}
            token={currentToken()}
            busy={saving}
            error={formError.message || null}
            serverFieldErrors={formError.fields}
            onSubmit={(body) => void save(body)}
            onCancel={() => { if (!confirmDiscardChanges()) return; setCreating(false); setEditing(null); setFormError(EMPTY_ERROR); }}
          />
        </div>
      )}

      {confirming && (
        <ConfirmDialog
          label={String(confirming.title ?? confirming.name ?? confirming.question ?? confirming.alt ?? 'هذا العنصر')}
          busy={deleting}
          onCancel={() => setConfirming(null)}
          onConfirm={() => void remove(confirming)}
        />
      )}
    </div>
  );
}

/** URLs stored in one image/images field of a list row. */
function rowImageUrls(row: Row, field: AdminField): string[] {
  const value = row[field.name];
  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === 'string' ? item : String((item as Row)?.url ?? ''))).filter(Boolean);
  }
  if (value && typeof value === 'object' && 'url' in (value as Row)) {
    return [String((value as Row).url ?? '')].filter(Boolean);
  }
  if (typeof value === 'string' && value) return [value];
  return [];
}

/** How many of a row's stored images fail their slot's aspect check, probed with `Image()`. */
function MismatchCount({ row, fields }: { row: Row; fields: AdminField[] }) {
  const items = useMemo(
    () =>
      fields.flatMap((field) =>
        rowImageUrls(row, field).map((url) => ({ url, spec: MEDIA_SPECS[field.spec!] })),
      ),
    [row, fields],
  );
  const key = items.map((i) => i.url).join('|');
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!items.length) {
      setCount(0);
      return;
    }
    let alive = true;
    setCount(null);
    Promise.all(
      items.map(
        (item) =>
          new Promise<boolean>((resolve) => {
            const img = new Image();
            img.onload = () => resolve(!checkAspect(img.naturalWidth, img.naturalHeight, item.spec).ok);
            img.onerror = () => resolve(false);
            img.src = item.url;
          }),
      ),
    ).then((results) => {
      if (alive) setCount(results.filter(Boolean).length);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- re-run only when the URL set changes
  }, [key]);

  if (count === null) return <span className="text-fg-dim">…</span>;
  if (count === 0) return <span className="text-fg-dim">—</span>;
  return <span className="font-bold text-primary">⚠ {count}</span>;
}

/** A list cell; objects render as a dash rather than [object Object]. */
function cellText(row: Row, name: string): string {
  const value = row[name];
  if (value === undefined || value === null || value === '') return '—';
  if (name === 'type') {
    const TYPES: Record<string, string> = {
      image: 'صورة', video: 'فيديو', service: 'خدمات', product: 'منتجات', blog: 'مقالات',
    };
    return TYPES[String(value)] ?? String(value);
  }
  if (typeof value === 'object') return '—';
  return String(value);
}

/** Deletion is soft on the server, but it still removes content from the live site. */
function ConfirmDialog({
  label,
  busy,
  onConfirm,
  onCancel,
}: {
  label: string;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  // Escape closes the dialog.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
    >
      <div className="w-full max-w-md rounded-[var(--radius-md)] border border-line bg-ink p-6">
        <h3 id="confirm-title" className="text-lg font-bold text-fg">تأكيد الحذف</h3>
        <p className="mt-2 text-sm text-fg-muted">
          سيُحذف «{label}» ولن يظهر على الموقع. هل تريد المتابعة؟
        </p>
        <div className="mt-5 flex gap-3">
          <button
            onClick={onConfirm}
            disabled={busy}
            className="rounded-[var(--radius-sm)] bg-primary px-4 py-2 font-bold text-white disabled:opacity-50"
          >
            {busy ? 'جارٍ الحذف…' : 'حذف'}
          </button>
          <button
            onClick={onCancel}
            disabled={busy}
            className="rounded-[var(--radius-sm)] border border-line px-4 py-2 text-fg-muted disabled:opacity-50"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
