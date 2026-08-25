'use client';

import { useState, useCallback } from 'react';
import type { Branch } from '@/data/branches';
import { useDismissable } from '@/hooks/useDismissable';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

/**
 * Interactive branch map: percentage-positioned pins over a static map image, each
 * opening a card with the branch's address, a call button and a Google Maps link.
 *
 * The source version is already the most accessible widget on the site — its pins
 * respond to Enter and Space and it closes on Escape. Kept, with the pins promoted from
 * `div[tabindex]` to real buttons and the popup given a focus trap.
 *
 * Pin coordinates are percentages of this specific image, so they live beside it in
 * data/branches.ts and must be re-tuned if the map artwork changes.
 */
export function BranchPinMap({ branches }: { branches: Branch[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const close = useCallback(() => setOpenId(null), []);
  const ref = useDismissable(openId !== null, close);

  const active = branches.find((b) => b.id === openId) ?? null;

  return (
    <div className="relative">
      <div className="relative mx-auto aspect-square w-full max-w-[620px] rounded-[var(--radius-xl)] bg-glass">
        {/*
          The map artwork was a static file and is gone. Pins are positioned as
          percentages of this box, so they still land where the admin placed them;
          restoring the backdrop means adding a CMS image slot for it.
        */}

        {/*
          Only branches the admin has actually positioned are plotted. A branch with no
          pin still appears in the list below the map — it just has no marker, rather
          than one stacked at the top-left corner.
        */}
        {branches.filter((b): b is Branch & { pin: NonNullable<Branch['pin']> } => Boolean(b.pin)).map((branch) => (
          <button
            key={branch.id}
            type="button"
            onClick={() => setOpenId(branch.id)}
            aria-label={`${branch.name} — ${branch.address}`}
            className={cn(
              'absolute z-10 flex size-7 -translate-x-1/2 -translate-y-full items-center justify-center',
              'text-primary transition-transform duration-300 hover:scale-125 focus-visible:scale-125',
              openId === branch.id && 'scale-125'
            )}
            style={{ top: branch.pin.top, insetInlineStart: branch.pin.start }}
          >
            <span
              aria-hidden="true"
              className="absolute inset-0 animate-ping rounded-full bg-primary/30"
              data-loop-animation
            />
            <Icon name="pin" size={26} className="relative drop-shadow-[0_2px_4px_rgb(0_0_0/0.6)]" />
          </button>
        ))}
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
              {active.name}
            </h3>
            <p className="mt-2 text-base text-fg-muted">{active.address}</p>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <a
                href={`tel:${active.phone}`}
                className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-line bg-transparent px-5 py-2.5 font-bold text-white transition-colors duration-300 hover:border-primary hover:bg-primary"
              >
                <Icon name="phone" size={16} />
                اتصال
              </a>
              <a
                href={active.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-primary px-5 py-2.5 font-bold text-white transition-colors duration-300 hover:bg-white hover:text-primary"
              >
                <Icon name="pin" size={16} />
                الخريطة
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
