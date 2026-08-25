'use client';

import { useState } from 'react';

/**
 * Free-form keywords as removable chips.
 * Wire format is a comma-joined string, split by the server's `listish` coercion.
 */
export function TagsField({
  id,
  value,
  onChange,
  placeholder,
  invalid,
}: {
  id: string;
  /** Comma-joined string, exactly as it goes on the wire. */
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  invalid?: boolean;
}) {
  const [draft, setDraft] = useState('');
  const items = value ? value.split(',').map((s) => s.trim()).filter(Boolean) : [];

  const commit = (raw: string) => {
    // Split the draft too, so a pasted list becomes several chips.
    const added = raw.split(/[,،]/).map((s) => s.trim()).filter(Boolean);
    if (!added.length) return;
    const next = [...items];
    for (const item of added) if (!next.includes(item)) next.push(item);
    onChange(next.join(','));
    setDraft('');
  };

  const removeAt = (index: number) => {
    onChange(items.filter((_, i) => i !== index).join(','));
  };

  return (
    <div
      className={`rounded-[var(--radius-sm)] border bg-ink p-2 ${invalid ? 'border-primary' : 'border-line'}`}
    >
      {items.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-1.5">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="flex items-center gap-1.5 rounded-full bg-glass px-2.5 py-1 text-sm text-fg"
            >
              <span>{item}</span>
              <button
                type="button"
                onClick={() => removeAt(index)}
                aria-label={`حذف ${item}`}
                className="text-fg-dim transition-colors hover:text-primary"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          id={id}
          type="text"
          value={draft}
          placeholder={placeholder ?? 'اكتب ثم اضغط Enter'}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              // Enter adds a chip; it must not submit the form.
              e.preventDefault();
              commit(draft);
            } else if (e.key === 'Backspace' && !draft && items.length) {
              removeAt(items.length - 1);
            }
          }}
          // Commit on blur, or a typed-but-unconfirmed value is lost on save.
          onBlur={() => commit(draft)}
          className="min-w-0 flex-1 bg-transparent px-1 py-1 text-fg outline-none"
        />
        <button
          type="button"
          onClick={() => commit(draft)}
          disabled={!draft.trim()}
          className="rounded-[var(--radius-sm)] border border-line px-3 py-1 text-sm text-fg-muted disabled:opacity-40"
        >
          إضافة
        </button>
      </div>
    </div>
  );
}
