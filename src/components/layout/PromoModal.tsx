'use client';

import { useEffect, useState, useCallback } from 'react';
import { CmsImage } from '@/components/ui/CmsImage';
import { usePathname } from 'next/navigation';
import type { Promo } from '@/data/promo';
import { waLink } from '@/lib/whatsapp';
import { useDismissable } from '@/hooks/useDismissable';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { resolveDelay } from '@/lib/promo/resolveDelay';

/**
 * Timed promotional overlay.
 *
 * Suppression rules are the source's: never on the landing pages, thank-you page,
 * branches or info routes. The delay is one CMS value for the whole site
 * (`Promo.delayMs`, default 3s via `resolveDelay`).
 *
 * The close button and offer link are keyboard-reachable, focus is trapped while open,
 * and dismissal is remembered for the session.
 */
const SUPPRESSED = ['landing-page', 'thank-you', 'branches', 'info', 'فروعنا'];
const STORAGE_KEY = 'cs-promo-dismissed';

export function PromoModal({ promo, whatsappNumber }: { promo: Promo | null; whatsappNumber: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const close = useCallback(() => {
    setOpen(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* private mode — falling back to per-navigation behaviour is fine */
    }
  }, []);

  const ref = useDismissable(open, close);

  useEffect(() => {
    if (!promo) return;
    if (SUPPRESSED.some((s) => pathname.includes(s))) return;
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
    } catch {
      /* ignore */
    }

    const delay = resolveDelay(promo.delayMs);
    const t = setTimeout(() => setOpen(true), delay);
    return () => clearTimeout(t);
  }, [pathname, promo]);

  if (!promo) return null;

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && close()}
      aria-hidden={!open}
      className={cn(
        'fixed inset-0 z-[100000] flex items-center justify-center bg-black/80 p-5 backdrop-blur-[4px]',
        'transition-opacity duration-300',
        open ? 'visible opacity-100' : 'pointer-events-none invisible opacity-0'
      )}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={promo.alt}
        className={cn(
          // Width matches the source; height is capped on the image so the rounded <a> is not clipped.
          'relative w-full max-w-[880px] transition-transform duration-300',
          open ? 'scale-100' : 'scale-95'
        )}
      >
        {/* Physical `right`, not `end`: the page is RTL and the button belongs top-right. */}
        <button
          type="button"
          onClick={close}
          aria-label="إغلاق العرض"
          className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-[4px] transition-colors hover:bg-primary"
        >
          <Icon name="close" size={18} />
        </button>

        <a
          href={waLink(promo.whatsappText, whatsappNumber)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={close}
          className="block overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-deep)]"
        >
          {/* `contain` plus a viewport height cap: letterbox on short screens, never crop. */}
          <CmsImage
            src={promo.image}
            alt={promo.alt}
            width={promo.width}
            height={promo.height}
            fit="contain"
            sizes="(max-width: 920px) 100vw, 880px"
            className="block h-auto max-h-[85vh] w-full"
          />
        </a>
      </div>
    </div>
  );
}
