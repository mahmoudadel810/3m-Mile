'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Branch } from '@/data/branches';
import { useDismissable } from '@/hooks/useDismissable';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { KsaMap } from './KsaMap';
import { projectToMap } from '@/lib/geo';
import { findCity, type KsaCity } from '@/lib/ksaCities';

/**
 * Interactive branch map: one pin per city over the `KsaMap` outline, opening a card
 * that lists every branch in that city with a call button and a Google Maps link.
 *
 * Coordinates come from `lib/ksaCities.ts`, so all branches in a city share one pin.
 * A branch whose city is not in the table gets no pin and still appears in the cards.
 *
 * Pins use the physical `left` property, not `insetInlineStart`: the document is RTL,
 * and a logical inset would mirror every projected longitude.
 */
export function BranchPinMap({ branches }: { branches: Branch[] }) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const close = useCallback(() => setOpenKey(null), []);
  const ref = useDismissable(openKey !== null, close);

  // Group by city in arrival order; unknown cities are skipped.
  const pins = useMemo(() => {
    const byKey = new Map<string, { city: KsaCity; items: Branch[] }>();
    for (const b of branches) {
      const city = findCity(b.city);
      if (!city) continue;
      const entry = byKey.get(city.key);
      if (entry) entry.items.push(b);
      else byKey.set(city.key, { city, items: [b] });
    }
    return [...byKey.values()];
  }, [branches]);

  const active = pins.find((p) => p.city.key === openKey) ?? null;

  return (
    <div className="relative">
      <div className="relative mx-auto aspect-square w-full max-w-[620px] overflow-hidden rounded-[var(--radius-xl)] bg-glass">
        <KsaMap className="absolute inset-0 size-full" cities={pins.map((p) => p.city)} />

        {pins.map(({ city, items }) => {
          const { xPct, yPct } = projectToMap(city.lat, city.lng);
          return (
            <button
              key={city.key}
              type="button"
              onClick={() => setOpenKey(city.key)}
              aria-label={
                items.length === 1 && items[0]
                  ? `${items[0].name} — ${city.name}`
                  : `${city.name} — ${items.length} فروع`
              }
              className={cn(
                'absolute z-10 flex size-7 -translate-x-1/2 -translate-y-full items-center justify-center',
                'text-primary transition-transform duration-300 hover:scale-125 focus-visible:scale-125',
                openKey === city.key && 'scale-125'
              )}
              style={{ top: `${yPct}%`, left: `${xPct}%` }}
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 animate-ping rounded-full bg-primary/30"
                data-loop-animation
              />
              <Icon name="pin" size={26} className="relative drop-shadow-[0_2px_4px_rgb(0_0_0/0.6)]" />
              {items.length > 1 && (
                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-white text-[10px] font-black text-primary">
                  {items.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Popup */}
      {active && (
        <>
          <div
            onClick={close}
            aria-hidden="true"
            className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-[3px]"
          />
          <div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby="branch-popup-title"
            className="fixed left-1/2 top-1/2 z-[1000] w-[min(92vw,380px)] -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-xl)] border border-line bg-surface p-6 text-center shadow-[var(--shadow-deep)]"
          >
            <button
              type="button"
              onClick={close}
              aria-label="إغلاق"
              className="absolute top-3 text-fg-dim transition-colors hover:text-white"
              style={{ insetInlineEnd: '0.75rem' }}
            >
              <Icon name="close" size={20} />
            </button>

            <h3 id="branch-popup-title" className="text-xl font-black">
              {active.city.name}
              {active.items.length > 1 && (
                <span className="ms-2 text-sm font-bold text-fg-dim">
                  ({active.items.length} فروع)
                </span>
              )}
            </h3>

            <ul className="mt-4 grid max-h-[60vh] gap-4 overflow-y-auto">
              {active.items.map((b) => (
                <li key={b.id} className="border-t border-line pt-4 first:border-0 first:pt-0">
                  <p className="font-black">{b.name}</p>
                  <p className="mt-1 text-sm text-fg-muted">{b.address}</p>

                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    <a
                      href={`tel:${b.phone}`}
                      className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-line bg-transparent px-4 py-2 text-sm font-bold text-white transition-colors duration-300 hover:border-primary hover:bg-primary"
                    >
                      <Icon name="phone" size={15} />
                      اتصال
                    </a>
                    <a
                      href={b.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-primary px-4 py-2 text-sm font-bold text-white transition-colors duration-300 hover:bg-white hover:text-primary"
                    >
                      <Icon name="pin" size={15} />
                      الخريطة
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
