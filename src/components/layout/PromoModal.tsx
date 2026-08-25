'use client';

import { useEffect, useState, useCallback } from 'react';
import { CmsImage } from '@/components/ui/CmsImage';
import { usePathname } from 'next/navigation';
import type { Promo } from '@/data/promo';
import { waLink } from '@/lib/whatsapp';
import { useDismissable } from '@/hooks/useDismissable';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

/**
 * Timed promotional overlay.
 *
 * Timing and suppression rules are the source's: 5s on the homepage, 15s elsewhere,
 * never on the landing pages, thank-you page, branches or info routes.
 *
 * Fixed here: the source disables its own close button and offer link with
 * `tabindex="-1"` — a workaround for a console warning that makes the popup completely
 * unusable by keyboard. It also re-opens on every navigation. This version traps focus
 * properly and remembers dismissal for the session.
 */
const SUPPRESSED = ['landing-page', 'thank-you', 'branches', 'info', 'فروعنا'];
const STORAGE_KEY = 'cs-promo-dismissed';

export function PromoModal({ promo }: { promo: Promo | null }) {
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

    const delay = pathname === '/' ? 5000 : 15000;
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
          'relative max-h-[85vh] w-full max-w-[420px] transition-transform duration-300',
          open ? 'scale-100' : 'scale-95'
        )}
      >
        <button
          type="button"
          onClick={close}
          aria-label="إغلاق العرض"
          className="absolute -top-3 z-10 flex size-9 items-center justify-center rounded-full bg-white text-black shadow-[var(--shadow-card)] transition-colors hover:bg-primary hover:text-white"
          style={{ insetInlineEnd: '-0.75rem' }}
        >
          <Icon name="close" size={18} />
        </button>

        <a
          href={waLink(promo.whatsappText)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={close}
          className="block overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-deep)]"
        >
          <CmsImage
            src={promo.image}
            alt={promo.alt}
            width={promo.width}
            height={promo.height}
            className="h-auto w-full"
          />
        </a>
      </div>
    </div>
  );
}
