'use client';

/**
 * Ordered list of single-line strings — "why us" points, warranty terms.
 * Wire format is a JSON array, parsed by the server's `jsonish` coercion.
 */

const parse = (value: string): string[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map((v) => (typeof v === 'string' ? v : String(v ?? ''))) : [];
  } catch {
    // Keep an unparseable value visible rather than blanking the field.
    return [value];
  }
};

export function StringListField({
  id,
  value,
  onChange,
  maxItems,
  addLabel = 'إضافة عنصر',
  placeholder,
}: {
  id: string;
  /** JSON array of strings, exactly as it goes on the wire. */
  value: string;
  onChange: (next: string) => void;
  maxItems?: number;
  addLabel?: string;
  placeholder?: string;
}) {
  const items = parse(value);
  const commit = (next: string[]) => onChange(JSON.stringify(next));

  const setAt = (index: number, text: string) => commit(items.map((v, i) => (i === index ? text : v)));
  const removeAt = (index: number) => commit(items.filter((_, i) => i !== index));
  const move = (index: number, by: number) => {
    const target = index + by;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const moved = next[index];
    const displaced = next[target];
    if (moved === undefined || displaced === undefined) return;
    next[index] = displaced;
    next[target] = moved;
    commit(next);
  };

  const atLimit = maxItems !== undefined && items.length >= maxItems;

  return (
    <div className="space-y-2">
      {items.length === 0 && (
        <p className="rounded-[var(--radius-sm)] border border-dashed border-line px-3 py-2 text-xs text-fg-dim">
          لا توجد عناصر بعد.
        </p>
      )}

      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            <span className="w-5 shrink-0 text-center text-xs text-fg-dim">{index + 1}</span>
            <input
              id={index === 0 ? id : undefined}
              type="text"
              value={item}
              placeholder={placeholder}
              onChange={(e) => setAt(index, e.target.value)}
              className="min-w-0 flex-1 rounded-[var(--radius-sm)] border border-line bg-ink px-3 py-1.5 text-fg outline-none focus:border-primary"
            />
            <RowButton onClick={() => move(index, -1)} disabled={index === 0} label="تحريك لأعلى">↑</RowButton>
            <RowButton onClick={() => move(index, 1)} disabled={index === items.length - 1} label="تحريك لأسفل">↓</RowButton>
            <RowButton onClick={() => removeAt(index)} label="حذف العنصر" danger>×</RowButton>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => commit([...items, ''])}
        disabled={atLimit}
        className="rounded-[var(--radius-sm)] border border-line px-3 py-1.5 text-sm text-fg-muted transition-colors hover:border-primary disabled:opacity-40"
      >
        + {addLabel}
      </button>
      {atLimit && <p className="text-xs text-fg-dim">الحد الأقصى {maxItems} عناصر.</p>}
    </div>
  );
}

function RowButton({
  onClick,
  disabled,
  label,
  danger,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`size-8 shrink-0 rounded-[var(--radius-sm)] border text-sm disabled:opacity-30 ${
        danger ? 'border-primary/50 text-primary' : 'border-line text-fg-muted'
      }`}
    >
      {children}
    </button>
  );
}

export { RowButton };
