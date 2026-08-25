'use client';

import { useState } from 'react';
import type { WarrantyGroup } from '@/data/warranty';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

/**
 * Warranty browser: service group across the top, cover tier down the side.
 *
 * The source builds this entirely in JavaScript from an inline `TERMS_DB`, so nothing is
 * in the served HTML. Here every group and tier is rendered server-side; the tabs only
 * control which panel is visible, and the hidden ones stay in the DOM.
 */
export function WarrantyTabs({ groups }: { groups: WarrantyGroup[] }) {
  const [groupIndex, setGroupIndex] = useState(0);
  const [tierIndex, setTierIndex] = useState(0);

  /*
    Warranty groups are CMS content, so "none yet" is a real state — and it is the state
    a fresh install is in. `groups[0]!` threw during prerender and failed the build.
    Rendering a short notice keeps the page and its heading intact.
  */
  const group = groups[groupIndex];
  const tier = group ? (group.tiers[tierIndex] ?? group.tiers[0]) : undefined;

  const selectGroup = (i: number) => {
    setGroupIndex(i);
    setTierIndex(0);
  };

  if (!group || !tier) {
    return (
      <p className="rounded-[var(--radius-md)] border border-dashed border-line p-8 text-center text-fg-muted">
        سيتم إضافة تفاصيل الضمان قريباً.
      </p>
    );
  }

  return (
    <div>
      {/* Service groups */}
      <div role="tablist" aria-label="نوع الخدمة" className="mb-6 flex flex-wrap gap-2">
        {groups.map((g, i) => (
          <button
            key={g.id}
            role="tab"
            id={`wt-tab-${g.id}`}
            aria-selected={i === groupIndex}
            aria-controls={`wt-panel-${g.id}`}
            tabIndex={i === groupIndex ? 0 : -1}
            onClick={() => selectGroup(i)}
            className={cn(
              'rounded-[var(--radius-pill)] border px-5 py-2.5 text-base font-bold transition-colors duration-300',
              i === groupIndex
                ? 'border-primary bg-primary text-white'
                : 'border-line bg-glass text-fg-muted hover:border-primary hover:text-white'
            )}
          >
            {g.title}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`wt-panel-${group.id}`}
        aria-labelledby={`wt-tab-${group.id}`}
        className="grid gap-6 lg:grid-cols-[260px_1fr]"
      >
        {/* Tiers */}
        <ul className="grid gap-2 self-start">
          {group.tiers.map((t, i) => (
            <li key={t.title}>
              <button
                type="button"
                onClick={() => setTierIndex(i)}
                aria-current={i === tierIndex}
                className={cn(
                  'flex w-full items-center justify-between gap-3 rounded-[var(--radius-md)] border px-4 py-3 text-start font-bold transition-colors duration-300',
                  i === tierIndex
                    ? 'border-primary bg-primary/10 text-white'
                    : 'border-line bg-glass text-fg-muted hover:border-white/25 hover:text-white'
                )}
              >
                <span className="text-sm md:text-base">{t.title}</span>
                <span className="shrink-0 text-xs text-primary">{t.warranty}</span>
              </button>
            </li>
          ))}
        </ul>

        {/* Detail */}
        <div className="rounded-[var(--radius-xl)] border border-line bg-glass p-5 md:p-7">
          <div className="mb-5 grid gap-3 sm:grid-cols-2">
            <Stat label="فترة الضمان" value={tier.warranty} />
            <Stat label="الصيانة" value={tier.maintenance} />
          </div>

          <h2 className="mb-1 text-lg font-black md:text-xl">الشروط والأحكام</h2>
          <p className="mb-4 text-base leading-relaxed text-fg-muted">{group.intro}</p>

          <ul className="grid gap-3">
            {tier.terms.map((term) => (
              <li key={term} className="flex items-start gap-3 text-base leading-loose">
                <span className="mt-2 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                  <Icon name="check" size={9} strokeWidth={4} />
                </span>
                <span className="text-fg-muted">{term}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <p className="rounded-[var(--radius-md)] border border-line-soft bg-black/40 px-4 py-3">
      <span className="block text-xs font-bold text-fg-dim">{label}</span>
      <span className="mt-1 block text-base font-bold text-white">{value}</span>
    </p>
  );
}
