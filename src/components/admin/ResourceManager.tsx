'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fieldLabels, findResource } from '@/lib/admin/resources';
import { apiUrl, sendForm, sendJson } from '@/lib/api/client';
import { clearSession, getToken } from '@/lib/admin/auth';
import {
  NETWORK_ERROR_MESSAGE,
  translateApiError,
  type TranslatedError,
} from '@/lib/admin/errors';
import { ResourceForm } from './ResourceForm';

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

export function ResourceManager({ resourceKey }: { resourceKey: string }) {
  // Non-null in practice: the page 404s on an unknown key before rendering this.
  const config = findResource(resourceKey)!;
  const isSingleton = config.kind === 'singleton';
  const labels = useMemo(() => fieldLabels(config), [config]);

  const [rows, setRows] = useState<Row[]>([]);
  const [doc, setDoc] = useState<Row | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState<TranslatedError>(EMPTY_ERROR);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<Row | null>(null);
  const [query, setQuery] = useState('');

  const token = getToken() ?? '';
  const router = useRouter();

  // The access token lives 15 minutes; once it expires only a fresh login helps.
  const expireSession = useCallback(() => {
    clearSession();
    router.replace('/admin/login');
  }, [router]);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      // No isActive filter: the admin list shows hidden rows so they can be restored.
      const listQuery = config.listQuery ? `?${config.listQuery}` : '?limit=100';
      const readPath = config.readEndpoint ?? config.endpoint;
      const res = await fetch(apiUrl(`${readPath}${isSingleton ? '' : listQuery}`), {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (res.status === 401) {
        expireSession();
        return;
      }
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        setLoadError(translateApiError(payload, res.status, labels).message);
        return;
      }

      const body = await res.json();
      if (isSingleton) setDoc((body?.data ?? null) as Row | null);
      else setRows((body?.data?.rows ?? body?.data?.data ?? []) as Row[]);
    } catch (error) {
      console.error(`[admin] load ${config.endpoint} failed:`, (error as Error).message);
      setLoadError(NETWORK_ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
  }, [config, isSingleton, token, expireSession, labels]);

  useEffect(() => {
    void load();
  }, [load]);

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

    setEditing(null);
    setCreating(false);
    setNotice(
      isSingleton || editing
        ? 'تم حفظ التعديلات. قد يستغرق ظهورها على الموقع دقيقة.'
        : 'تمت الإضافة بنجاح. قد يستغرق ظهورها على الموقع دقيقة.',
    );
    await load();
  };

  const remove = async (row: Row) => {
    setDeleting(true);
    const result = await sendJson(`${config.endpoint}/${String(row._id)}`, 'DELETE', undefined, token);
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
    await load();
  };

  // ---------------------------------------------------------------- render

  const columns = config.listColumns ?? [{ name: 'title', label: 'العنوان' }];

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
        <button onClick={() => void load()} className="mt-3 rounded-[var(--radius-sm)] border border-line px-4 py-1.5 text-sm">
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
              {rows.length > 0 ? `${rows.length} عنصراً` : 'لا توجد عناصر'}
            </p>
            <button
              onClick={() => { setCreating(true); setFormError(EMPTY_ERROR); }}
              className="rounded-[var(--radius-sm)] bg-primary px-4 py-2 font-bold text-white"
            >
              + إضافة جديد
            </button>
          </div>

          {config.searchable && rows.length > 5 && (
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث في القائمة…"
              aria-label="بحث"
              className="w-full max-w-sm rounded-[var(--radius-sm)] border border-line bg-ink px-3 py-2 text-fg outline-none focus:border-primary"
            />
          )}

          {rows.length === 0 ? (
            // Empty is the normal state on a fresh install, not a failure.
            <div className="rounded-[var(--radius-md)] border border-dashed border-line p-10 text-center">
              <p className="text-fg-muted">{config.emptyHint ?? 'لا توجد عناصر بعد.'}</p>
              <button
                onClick={() => { setCreating(true); setFormError(EMPTY_ERROR); }}
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
                            onClick={() => { setEditing(row); setFormError(EMPTY_ERROR); }}
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
            token={token}
            busy={saving}
            error={formError.message || null}
            serverFieldErrors={formError.fields}
            onSubmit={(body) => void save(body)}
            onCancel={() => { setCreating(false); setEditing(null); setFormError(EMPTY_ERROR); }}
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
