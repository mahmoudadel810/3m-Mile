'use client';

import type { Option } from '@/lib/admin/resources';

/**
 * Pick a related document by name: a select for one, checkboxes plus chips for many.
 * Wire format is one ObjectId, or several joined by commas.
 */
export function RelationField({
  id,
  value,
  options,
  multiple,
  loading,
  emptyHint,
  invalid,
  onChange,
}: {
  id: string;
  value: string;
  options: Option[];
  multiple?: boolean;
  loading: boolean;
  emptyHint: string;
  invalid?: boolean;
  onChange: (next: string) => void;
}) {
  const border = invalid ? 'border-primary' : 'border-line';

  if (loading) {
    return <p className="rounded-[var(--radius-sm)] border border-line px-3 py-2 text-sm text-fg-dim">جارٍ تحميل الخيارات…</p>;
  }

  if (!options.length) {
    return (
      <p className="rounded-[var(--radius-sm)] border border-dashed border-line px-3 py-2 text-sm text-fg-dim">
        {emptyHint}
      </p>
    );
  }

  if (!multiple) {
    return (
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={invalid}
        className={`w-full rounded-[var(--radius-sm)] border ${border} bg-ink px-3 py-2 text-fg outline-none focus:border-primary`}
      >
        <option value="">— بدون —</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    );
  }

  const selected = value ? value.split(',').filter(Boolean) : [];
  const toggle = (id_: string) => {
    const next = selected.includes(id_) ? selected.filter((s) => s !== id_) : [...selected, id_];
    onChange(next.join(','));
  };

  return (
    <div className={`rounded-[var(--radius-sm)] border ${border} bg-ink p-2`}>
      {selected.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-1.5 border-b border-line pb-2">
          {selected.map((sel) => {
            const option = options.find((o) => o.value === sel);
            return (
              <li key={sel} className="flex items-center gap-1.5 rounded-full bg-glass px-2.5 py-1 text-sm text-fg">
                <span>{option?.label ?? '—'}</span>
                <button
                  type="button"
                  onClick={() => toggle(sel)}
                  aria-label={`إزالة ${option?.label ?? ''}`}
                  className="text-fg-dim transition-colors hover:text-primary"
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <ul id={id} className="max-h-48 space-y-1 overflow-y-auto">
        {options.map((o) => (
          <li key={o.value}>
            <label className="flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-2 py-1 text-sm text-fg-muted hover:bg-glass">
              <input
                type="checkbox"
                checked={selected.includes(o.value)}
                onChange={() => toggle(o.value)}
                className="size-4 accent-[var(--color-primary)]"
              />
              <span>{o.label}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
