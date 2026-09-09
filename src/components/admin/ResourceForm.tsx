'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { AdminField, Option, ResourceConfig } from '@/lib/admin/resources';
import { SITE_PAGES } from '@/lib/admin/resources';
import { validateForm, type FieldErrors } from '@/lib/admin/validate';
import { useUnsavedGuard } from '@/lib/admin/unsavedGuard';
import { apiUrl } from '@/lib/api/client';
import { ImageField } from './fields/ImageField';
import { TagsField } from './fields/TagsField';
import { StringListField } from './fields/StringListField';
import { RepeaterField } from './fields/RepeaterField';
import { RelationField } from './fields/RelationField';

/**
 * Renders whatever `config.fields` describes and assembles the request body.
 * See `buildBody` for the encoding rules.
 */

type Row = Record<string, unknown>;

/** Read a dotted path out of a document: get(doc, 'hero.ctaLabel'). */
const get = (obj: unknown, path: string): unknown =>
  path.split('.').reduce<unknown>((acc, key) => (acc == null ? acc : (acc as Row)[key]), obj);

/**
 * Existing value for a field, as the string its control edits — which is also the value
 * that goes on the wire, so `buildBody` stays a straight copy.
 */
const initialValue = (field: AdminField, doc: Row | null): string => {
  if (!doc) return field.type === 'repeater' || field.type === 'stringList' ? '[]' : '';
  // `from` is the stored path when it differs from the submitted name (`heroImageAlt` → `heroImage.alt`).
  const raw = get(doc, field.from ?? field.name);

  switch (field.type) {
    case 'repeater': {
      const rows = Array.isArray(raw) ? (raw as Row[]) : [];
      // `from` handles a cell stored elsewhere than it is submitted (`image.alt` → `alt`).
      const hoisted = rows.map((row) => {
        const next: Row = { ...row };
        for (const sub of field.item ?? []) {
          if (sub.from) next[sub.name] = get(row, sub.from) ?? '';
        }
        return next;
      });
      return JSON.stringify(hoisted);
    }
    case 'stringList':
      return JSON.stringify(Array.isArray(raw) ? raw : []);
    case 'tags':
      return Array.isArray(raw) ? raw.join(',') : '';
    case 'boolean':
      return raw ? 'true' : 'false';
    case 'relation': {
      if (Array.isArray(raw)) {
        return raw.map((r) => (typeof r === 'string' ? r : (r as Row)?._id)).filter(Boolean).join(',');
      }
      if (raw && typeof raw === 'object') return String((raw as Row)._id ?? '');
      return raw ? String(raw) : '';
    }
    default:
      return raw === undefined || raw === null ? '' : String(raw);
  }
};

/** Stored image URLs for a slot, for the preview. */
const currentImages = (field: AdminField, doc: Row | null): string[] => {
  if (!doc) return [];
  const named = get(doc, field.name);

  // Multi-file slots store an array of {url, publicId}.
  if (Array.isArray(named)) {
    return named.map((item) => (typeof item === 'string' ? item : String((item as Row)?.url ?? ''))).filter(Boolean);
  }
  // Named slots are {url, publicId}; legacy/flat fields are a bare URL string.
  if (named && typeof named === 'object' && 'url' in (named as Row)) {
    return [String((named as Row).url ?? '')].filter(Boolean);
  }
  if (typeof named === 'string' && named) return [named];

  // Slots whose stored path differs from the upload field name.
  if (field.name === 'file') return [String(doc.url ?? '')].filter(Boolean);
  if (field.name === 'heroVideo') return [String(get(doc, 'hero.video') ?? '')].filter(Boolean);
  if (field.name === 'heroPoster') return [String(get(doc, 'hero.poster') ?? '')].filter(Boolean);
  if (field.name === 'whyUsImage') return [String(get(doc, 'whyUs.image.url') ?? '')].filter(Boolean);
  if (field.name === 'branchesTileImage') return [String(get(doc, 'heroTiles.branches.image.url') ?? '')].filter(Boolean);
  if (field.name === 'galleryTileImage') return [String(get(doc, 'heroTiles.gallery.image.url') ?? '')].filter(Boolean);
  return [];
};

export function ResourceForm({
  config,
  doc,
  token,
  busy,
  error,
  serverFieldErrors,
  onSubmit,
  onCancel,
}: {
  config: ResourceConfig;
  doc: Row | null;
  token: string;
  busy: boolean;
  error: string | null;
  /** Per-field messages the server sent back, already in Arabic. */
  serverFieldErrors: FieldErrors;
  onSubmit: (body: FormData | Record<string, string>) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  /** Staged uploads, by slot name. Indexed row slots (`trustImage0`) live here too. */
  const [files, setFiles] = useState<Record<string, File[]>>({});
  const [options, setOptions] = useState<Record<string, Option[]>>({});
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [rowErrors, setRowErrors] = useState<Record<string, Record<string, string>>>({});
  /** Slots holding a rejected pick, keyed like `files`. Save is disabled while any is true. */
  const [invalidUploads, setInvalidUploads] = useState<Record<string, boolean>>({});
  const formRef = useRef<HTMLFormElement>(null);
  /** What the form was loaded with, to tell edits apart from untouched fields. */
  const pristine = useRef<Record<string, string>>({});

  const isNew = !doc;

  useEffect(() => {
    const next: Record<string, string> = {};
    for (const field of config.fields) {
      // New items default to visible, or they save hidden and cannot be found.
      if (!doc && field.name === 'isActive') {
        next[field.name] = 'true';
        continue;
      }
      next[field.name] = initialValue(field, doc);
    }
    pristine.current = next;
    setValues(next);
    setFiles({});
    setErrors({});
    setRowErrors({});
    setInvalidUploads({});
  }, [config, doc]);

  // Dirty when values differ from the loaded snapshot or any upload is staged.
  const isDirty =
    Object.keys(pristine.current).some((k) => values[k] !== pristine.current[k]) ||
    Object.values(files).some((list) => list.length > 0);
  useUnsavedGuard(isDirty);

  /**
   * Choices for relation and link fields, loaded once per form. A `link` option's label
   * is the document title; its value is the derived path.
   */
  useEffect(() => {
    const needsOptions = config.fields.filter(
      (f) => f.type === 'relation' || f.type === 'link' || f.item?.some((s) => s.type === 'link'),
    );
    if (!needsOptions.length) return;

    let cancelled = false;
    setLoadingOptions(true);

    const fetchRows = async (endpoint: string, query?: string): Promise<Row[]> => {
      const prefix = query ? `${query}&` : '';
      const res = await fetch(apiUrl(`${endpoint}?${prefix}limit=100`), {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(String(res.status));
      const body = await res.json();
      return (body?.data?.rows ?? body?.data?.data ?? []) as Row[];
    };

    void (async () => {
      const loaded: Record<string, Option[]> = {};

      for (const field of needsOptions) {
        try {
          if (field.type === 'relation' && field.relation) {
            const rows = await fetchRows(field.relation.endpoint, field.relation.query);
            const labelKey = field.relation.labelKey;
            loaded[field.name] = rows.map((r) => ({
              value: String(r._id),
              label: String((labelKey && r[labelKey]) || r.name || r.title || r._id),
            }));
            continue;
          }

          // `link` — on the field itself or on any of its repeater sub-fields.
          const source = field.links ?? field.item?.find((s) => s.type === 'link')?.links;
          const list: Option[] = source?.pages ? [...SITE_PAGES] : [];
          if (source?.fromResource) {
            const { endpoint, prefix, labelKey, query } = source.fromResource;
            const rows = await fetchRows(endpoint, query);
            for (const row of rows) {
              if (!row.slug) continue;
              list.push({ value: `${prefix}${row.slug}`, label: String(row[labelKey] ?? row.slug) });
            }
          }
          loaded[field.name] = list;
        } catch {
          // A failed lookup falls back to the static pages, not a blocked form.
          const source = field.links ?? field.item?.find((s) => s.type === 'link')?.links;
          loaded[field.name] = source?.pages ? [...SITE_PAGES] : [];
        }
      }

      if (!cancelled) {
        setOptions(loaded);
        setLoadingOptions(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [config, token]);

  /**
   * Assemble the request body.
   *
   * Multipart only when a file is attached, JSON otherwise — routes without an upload
   * mount no multer and cannot parse multipart. Values stay strings either way, so the
   * server's coercions (`booleanish`, `listish`, `jsonish`) handle both.
   *
   * Always sent: booleans (else an unchecked box leaves the old `true`) and structured
   * arrays including `[]` (else deleting the last row is a no-op).
   * Skipped when empty: `slug`, which would re-derive the URL and break inbound links.
   */
  const buildBody = (): FormData | Record<string, string> => {
    const staged = Object.entries(files).filter(([, list]) => list.length > 0);
    const body: FormData | Record<string, string> = staged.length ? new FormData() : {};

    const put = (key: string, value: string) => {
      if (body instanceof FormData) body.append(key, value);
      else body[key] = value;
    };

    if (body instanceof FormData) {
      for (const [slot, list] of staged) for (const file of list) body.append(slot, file);
    }

    for (const field of config.fields) {
      const value = values[field.name] ?? '';

      // Media never travels in the body — the server reads it from the upload slots.
      if (field.type === 'image' || field.type === 'images') continue;

      if (field.type === 'boolean') {
        put(field.name, value === 'true' ? 'true' : 'false');
        continue;
      }

      if (field.type === 'repeater' || field.type === 'stringList') {
        put(field.name, value || '[]');
        continue;
      }

      if (field.type === 'percent') {
        // Stored as a CSS percentage string; the input holds the bare number.
        put(field.name, value ? `${value.replace('%', '').trim()}%` : '');
        continue;
      }

      if (!value) {
        // Omitted rather than sent empty — '' fails their schema and 400s the save:
        //   slug   re-derives the URL from the title
        //   number Number('') is a real 0
        //   select '' is not a member of the server's z.enum
        // Relations do send '', so a link can be removed; the services map it to null.
        if (field.name === 'slug' || field.type === 'number' || field.type === 'select') continue;

        put(field.name, '');
        continue;
      }

      put(field.name, value);
    }

    return body;
  };

  const set = (name: string, value: string) => {
    setValues((v) => ({ ...v, [name]: value }));
    // Clear the message as soon as the field is being edited.
    setErrors((e) => (e[name] ? { ...e, [name]: '' } : e));
  };

  const setSlotFiles = (name: string, list: File[]) => {
    setFiles((f) => ({ ...f, [name]: list }));
    setErrors((e) => (e[name] ? { ...e, [name]: '' } : e));
  };

  const setSlotValidity = (name: string, ok: boolean) =>
    setInvalidUploads((v) => (v[name] === !ok ? v : { ...v, [name]: !ok }));

  const hasInvalidUpload = Object.values(invalidUploads).some(Boolean);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();

    const result = validateForm({
      config,
      values,
      hasFile: (name) => (files[name]?.length ?? 0) > 0,
      isNew,
      doc,
    });

    const firstFailing = Object.entries(result.errors).find(([, message]) => message)?.[0];
    if (firstFailing) {
      setErrors(result.errors);
      setRowErrors(result.rowErrors);
      // Scroll to the first problem.
      const first = formRef.current?.querySelector<HTMLElement>(`[data-field="${firstFailing}"]`);
      first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      first?.querySelector<HTMLElement>('input, textarea, select')?.focus({ preventScroll: true });
      return;
    }

    setErrors({});
    setRowErrors({});
    onSubmit(buildBody());
  };

  // Server messages merged in, so an unanticipated failure still lands on its field.
  const shownErrors = useMemo(
    () => ({ ...serverFieldErrors, ...errors }),
    [serverFieldErrors, errors],
  );

  const errorCount = Object.values(shownErrors).filter(Boolean).length;

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="space-y-5">
      {errorCount > 0 && (
        <p role="alert" className="rounded-[var(--radius-sm)] border border-primary/50 bg-primary/10 p-3 text-sm font-bold text-primary">
          هناك {errorCount === 1 ? 'حقل واحد يحتاج' : `${errorCount} حقول تحتاج`} إلى مراجعة قبل الحفظ.
        </p>
      )}

      {config.fields.map((field) => {
        const message = shownErrors[field.name];
        return (
          <div key={field.name} data-field={field.name}>
            <label htmlFor={`f-${field.name}`} className="mb-1 block text-sm font-bold text-fg">
              {field.label}
              {field.required && <span className="text-primary" title="حقل مطلوب"> *</span>}
            </label>

            <FieldInput
              field={field}
              id={`f-${field.name}`}
              value={values[field.name] ?? ''}
              options={options[field.name] ?? field.options ?? []}
              loadingOptions={loadingOptions && !options[field.name]}
              existingImages={currentImages(field, doc)}
              files={files}
              rowErrors={rowErrors[field.name] ?? {}}
              invalid={Boolean(message)}
              onText={(v) => set(field.name, v)}
              onFiles={setSlotFiles}
              onValidity={setSlotValidity}
            />

            {message ? (
              <p role="alert" className="mt-1 text-xs font-bold text-primary">{message}</p>
            ) : (
              field.help && <p className="mt-1 text-xs text-fg-dim">{field.help}</p>
            )}
          </div>
        );
      })}

      {error && (
        <p role="alert" className="rounded-[var(--radius-sm)] border border-primary/50 bg-primary/15 p-3 text-sm text-primary">
          {error}
        </p>
      )}

      <div className="sticky bottom-0 flex gap-3 border-t border-line bg-ink py-4">
        <button
          type="submit"
          disabled={busy || hasInvalidUpload}
          title={hasInvalidUpload ? 'صحّح مقاس الملف المرفوض قبل الحفظ.' : undefined}
          className="rounded-[var(--radius-sm)] bg-primary px-5 py-2 font-bold text-white disabled:opacity-50"
        >
          {busy ? 'جارٍ الحفظ…' : 'حفظ'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-[var(--radius-sm)] border border-line px-5 py-2 text-fg-muted disabled:opacity-50"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}

const inputClass =
  'w-full rounded-[var(--radius-sm)] bg-ink px-3 py-2 text-fg outline-none border focus:border-primary';

function FieldInput({
  field,
  id,
  value,
  options,
  loadingOptions,
  existingImages,
  files,
  rowErrors,
  invalid,
  onText,
  onFiles,
  onValidity,
}: {
  field: AdminField;
  id: string;
  value: string;
  options: Option[];
  loadingOptions: boolean;
  existingImages: string[];
  files: Record<string, File[]>;
  rowErrors: Record<string, string>;
  invalid: boolean;
  onText: (v: string) => void;
  onFiles: (name: string, files: File[]) => void;
  /** Reports whether the slot named `name` currently holds a clean pick. */
  onValidity: (name: string, ok: boolean) => void;
}) {
  const border = invalid ? 'border-primary' : 'border-line';

  switch (field.type) {
    case 'textarea':
    case 'html':
      return (
        <textarea
          id={id}
          value={value}
          placeholder={field.placeholder}
          onChange={(e) => onText(e.target.value)}
          rows={field.type === 'html' ? 10 : 3}
          aria-invalid={invalid}
          className={`${inputClass} ${border}`}
        />
      );

    case 'boolean':
      return (
        <label className="flex items-center gap-2">
          <input
            id={id}
            type="checkbox"
            checked={value === 'true'}
            onChange={(e) => onText(e.target.checked ? 'true' : 'false')}
            className="size-4 accent-[var(--color-primary)]"
          />
          <span className="text-sm text-fg-muted">نعم</span>
        </label>
      );

    case 'number':
      return (
        <input
          id={id}
          type="number"
          value={value}
          min={field.min}
          max={field.max}
          placeholder={field.placeholder}
          onChange={(e) => onText(e.target.value)}
          aria-invalid={invalid}
          className={`${inputClass} ${border}`}
        />
      );

    case 'percent':
      return (
        <div className="flex items-center gap-2">
          <input
            id={id}
            type="number"
            min={0}
            max={100}
            step={0.5}
            // Stored as "58%"; the control edits the bare number.
            value={value.replace('%', '')}
            onChange={(e) => onText(e.target.value)}
            aria-invalid={invalid}
            className={`${inputClass} ${border} max-w-32`}
          />
          <span className="text-sm text-fg-muted">%</span>
        </div>
      );

    case 'select':
      return (
        <select
          id={id}
          value={value}
          onChange={(e) => onText(e.target.value)}
          aria-invalid={invalid}
          className={`${inputClass} ${border}`}
        >
          <option value="">— اختر —</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      );

    case 'link':
      return (
        <select
          id={id}
          value={value}
          onChange={(e) => onText(e.target.value)}
          aria-invalid={invalid}
          className={`${inputClass} ${border}`}
        >
          <option value="">— بدون رابط —</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
          {/* Keep a stored value that is not in the list selectable. */}
          {value && !options.some((o) => o.value === value) && (
            <option value={value}>{value}</option>
          )}
        </select>
      );

    case 'relation':
      return (
        <RelationField
          id={id}
          value={value}
          options={options}
          multiple={field.relation?.multiple}
          loading={loadingOptions}
          invalid={invalid}
          emptyHint="لا توجد خيارات متاحة بعد — أضفها من صفحتها أولاً."
          onChange={onText}
        />
      );

    case 'tags':
      return <TagsField id={id} value={value} onChange={onText} placeholder={field.placeholder} invalid={invalid} />;

    case 'stringList':
      return (
        <StringListField
          id={id}
          value={value}
          onChange={onText}
          maxItems={field.maxItems}
          itemMaxLength={field.itemMaxLength}
          placeholder={field.placeholder}
        />
      );

    case 'repeater':
      return (
        <RepeaterField
          field={field}
          value={value}
          onChange={onText}
          linkOptions={options}
          errors={rowErrors}
          rowFiles={rowFilesFor(field, files)}
          onRowFiles={(index, list) => onFiles(`${field.rowImage?.slotPrefix ?? field.name}${index}`, list)}
          onRowValidity={(index, ok) => onValidity(`${field.rowImage?.slotPrefix ?? field.name}${index}`, ok)}
        />
      );

    case 'image':
    case 'images':
      return (
        <ImageField
          field={field}
          id={id}
          existing={existingImages}
          files={files[field.name] ?? []}
          onFiles={(list) => onFiles(field.name, list)}
          onValidity={(ok) => onValidity(field.name, ok)}
          invalid={invalid}
        />
      );

    default:
      return (
        <>
          <input
            id={id}
            type="text"
            value={value}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            // `<datalist>` suggests without constraining the value.
            list={field.suggestions?.length ? `${id}-suggestions` : undefined}
            onChange={(e) => onText(e.target.value)}
            aria-invalid={invalid}
            className={`${inputClass} ${border}`}
          />
          {field.suggestions?.length ? (
            <datalist id={`${id}-suggestions`}>
              {field.suggestions.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          ) : null}
        </>
      );
  }
}

/** Staged files for an indexed row slot, re-keyed by row index for the repeater. */
function rowFilesFor(field: AdminField, files: Record<string, File[]>): Record<number, File[]> {
  if (!field.rowImage) return {};
  const byIndex: Record<number, File[]> = {};
  for (const [name, list] of Object.entries(files)) {
    if (!list.length || !name.startsWith(field.rowImage.slotPrefix)) continue;
    const index = Number(name.slice(field.rowImage.slotPrefix.length));
    if (Number.isInteger(index)) byIndex[index] = list;
  }
  return byIndex;
}
