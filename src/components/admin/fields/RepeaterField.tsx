'use client';

import type { AdminField, Option, RepeaterField as RowField } from '@/lib/admin/resources';
import { ICON_OPTIONS } from '@/lib/admin/resources';
import { StringListField, RowButton } from './StringListField';
import { ImageField } from './ImageField';

/**
 * Repeatable structured rows — introPoints, benefits, tiers, stats, gallery actions.
 * Row shape comes from `field.item`; the value serialises to a JSON array.
 *
 * `field.rowImage` gives a row its own upload, bound to an indexed slot
 * (`trustImage0..2` on the homepage).
 */

type Row = Record<string, unknown>;

const parse = (value: string): Row[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as Row[]).map((r) => (r && typeof r === 'object' ? r : {})) : [];
  } catch {
    return [];
  }
};

/** Read a dotted path out of a row: at(row, 'image.url'). */
const at = (obj: unknown, path: string): unknown =>
  path.split('.').reduce<unknown>((acc, key) => (acc == null ? acc : (acc as Row)[key]), obj);

const blankRow = (item: RowField[]): Row => {
  const row: Row = {};
  for (const field of item) {
    row[field.name] = field.type === 'number' ? 0 : field.type === 'stringList' ? [] : '';
  }
  return row;
};

export function RepeaterField({
  field,
  value,
  onChange,
  rowFiles,
  onRowFiles,
  linkOptions,
  errors,
}: {
  field: AdminField;
  /** JSON array of objects, exactly as it goes on the wire. */
  value: string;
  onChange: (next: string) => void;
  /** Staged uploads per row index, for `rowImage` repeaters. */
  rowFiles: Record<number, File[]>;
  onRowFiles: (index: number, files: File[]) => void;
  /** Resolved choices for any `link` sub-field. */
  linkOptions: Option[];
  /** Per-row, per-subfield messages: `${index}.${subName}`. */
  errors: Record<string, string>;
}) {
  const item = field.item ?? [];
  const rows = parse(value);
  const commit = (next: Row[]) => onChange(JSON.stringify(next));

  const setCell = (index: number, name: string, cell: unknown) =>
    commit(rows.map((row, i) => (i === index ? { ...row, [name]: cell } : row)));

  /*
    Row images are bound to their index on both sides — the upload slot is
    `trustImage{index}` and the server pairs it with `existing.trust[index].image`.
    Reordering would leave the pictures behind, so it is disabled; removal drops every
    staged file, since the rows after the removed one all shift.
  */
  const indexBound = Boolean(field.rowImage);

  const removeAt = (index: number) => {
    commit(rows.filter((_, i) => i !== index));
    if (indexBound) {
      for (const key of Object.keys(rowFiles)) onRowFiles(Number(key), []);
    } else {
      onRowFiles(index, []);
    }
  };

  const move = (index: number, by: number) => {
    const target = index + by;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    const moved = next[index];
    const displaced = next[target];
    if (!moved || !displaced) return;
    next[index] = displaced;
    next[target] = moved;
    commit(next);
  };

  const atLimit = field.maxItems !== undefined && rows.length >= field.maxItems;

  return (
    <div className="space-y-3">
      {rows.length === 0 && (
        <p className="rounded-[var(--radius-sm)] border border-dashed border-line px-3 py-4 text-center text-sm text-fg-dim">
          لا توجد عناصر بعد — اضغط «إضافة» لبدء أول عنصر.
        </p>
      )}

      {indexBound && rows.length > 1 && (
        <p className="text-xs text-fg-dim">
          ترتيب هذه العناصر ثابت لأن كل عنصر مرتبط بصورته. لتبديل عنصرين، بدّل نصوصهما
          وأعد رفع الصورتين.
        </p>
      )}

      {rows.map((row, index) => (
        <fieldset key={index} className="rounded-[var(--radius-sm)] border border-line p-3">
          <legend className="flex w-full items-center justify-between gap-2 px-1">
            <span className="text-xs font-bold text-fg-dim">العنصر {index + 1}</span>
            <span className="flex gap-1.5">
              {/* Hidden, not disabled, when the row owns an image — see `indexBound`. */}
              {!indexBound && (
                <>
                  <RowButton onClick={() => move(index, -1)} disabled={index === 0} label="تحريك لأعلى">↑</RowButton>
                  <RowButton onClick={() => move(index, 1)} disabled={index === rows.length - 1} label="تحريك لأسفل">↓</RowButton>
                </>
              )}
              <RowButton onClick={() => removeAt(index)} label="حذف العنصر" danger>×</RowButton>
            </span>
          </legend>

          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {item.map((sub) => {
              const cellId = `f-${field.name}-${index}-${sub.name}`;
              const cellError = errors[`${index}.${sub.name}`];
              return (
                <div key={sub.name} className={sub.span === 2 ? 'sm:col-span-2' : undefined}>
                  <label htmlFor={cellId} className="mb-1 block text-xs font-bold text-fg-muted">
                    {sub.label}
                    {sub.required && <span className="text-primary"> *</span>}
                  </label>
                  <RowInput
                    sub={sub}
                    id={cellId}
                    value={row[sub.name]}
                    linkOptions={linkOptions}
                    invalid={Boolean(cellError)}
                    onChange={(next) => setCell(index, sub.name, next)}
                  />
                  {cellError && <p role="alert" className="mt-1 text-xs font-bold text-primary">{cellError}</p>}
                  {sub.help && !cellError && <p className="mt-1 text-xs text-fg-dim">{sub.help}</p>}
                </div>
              );
            })}

            {field.rowImage && (
              <div className="sm:col-span-2">
                <label
                  htmlFor={`f-${field.rowImage.slotPrefix}${index}`}
                  className="mb-1 block text-xs font-bold text-fg-muted"
                >
                  {field.rowImage.label}
                </label>
                <ImageField
                  field={{
                    ...field,
                    // Slot name is the wire contract: row 0 → trustImage0.
                    name: `${field.rowImage.slotPrefix}${index}`,
                    type: 'image',
                    aspect: field.rowImage.aspect,
                    maxSizeMB: 10,
                    replaceWarning: undefined,
                    help: undefined,
                  }}
                  id={`f-${field.rowImage.slotPrefix}${index}`}
                  existing={[String(at(row, field.rowImage.valuePath) ?? '')].filter(Boolean)}
                  files={rowFiles[index] ?? []}
                  onFiles={(files) => onRowFiles(index, files)}
                />
              </div>
            )}
          </div>
        </fieldset>
      ))}

      <button
        type="button"
        onClick={() => commit([...rows, blankRow(item)])}
        disabled={atLimit}
        className="rounded-[var(--radius-sm)] border border-line px-4 py-1.5 text-sm font-bold text-fg-muted transition-colors hover:border-primary disabled:opacity-40"
      >
        + إضافة
      </button>
      {atLimit && <p className="text-xs text-fg-dim">الحد الأقصى {field.maxItems} عناصر.</p>}
    </div>
  );
}

const cellClass =
  'w-full rounded-[var(--radius-sm)] border bg-ink px-3 py-1.5 text-fg outline-none focus:border-primary';

function RowInput({
  sub,
  id,
  value,
  linkOptions,
  invalid,
  onChange,
}: {
  sub: RowField;
  id: string;
  value: unknown;
  linkOptions: Option[];
  invalid: boolean;
  onChange: (next: unknown) => void;
}) {
  const border = invalid ? 'border-primary' : 'border-line';
  const text = value === undefined || value === null ? '' : String(value);

  switch (sub.type) {
    case 'textarea':
      return (
        <textarea
          id={id}
          rows={2}
          value={text}
          placeholder={sub.placeholder}
          maxLength={sub.maxLength}
          onChange={(e) => onChange(e.target.value)}
          className={`${cellClass} ${border}`}
        />
      );

    case 'number':
      return (
        <input
          id={id}
          type="number"
          value={text}
          placeholder={sub.placeholder}
          // Keep empty as '' so the validator sees "not filled in", not a real 0.
          onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          className={`${cellClass} ${border}`}
        />
      );

    case 'select':
      return (
        <select id={id} value={text} onChange={(e) => onChange(e.target.value)} className={`${cellClass} ${border}`}>
          <option value="">— اختر —</option>
          {(sub.options ?? []).map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      );

    case 'icon':
      return (
        <select id={id} value={text} onChange={(e) => onChange(e.target.value)} className={`${cellClass} ${border}`}>
          <option value="">— بدون أيقونة —</option>
          {ICON_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      );

    case 'link':
      return (
        <select id={id} value={text} onChange={(e) => onChange(e.target.value)} className={`${cellClass} ${border}`}>
          <option value="">— اختر الصفحة —</option>
          {linkOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      );

    case 'stringList':
      return (
        <StringListField
          id={id}
          value={JSON.stringify(Array.isArray(value) ? value : [])}
          onChange={(next) => onChange(JSON.parse(next))}
          addLabel="إضافة بند"
        />
      );

    default:
      return (
        <input
          id={id}
          type="text"
          value={text}
          placeholder={sub.placeholder}
          maxLength={sub.maxLength}
          onChange={(e) => onChange(e.target.value)}
          className={`${cellClass} ${border}`}
        />
      );
  }
}
