'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { mainNav } from '@/data/nav';
import { site } from '@/data/site';
import type { SocialLink } from '@/data/settings';
import { bookingLink, telLink } from '@/lib/whatsapp';
import { useDismissable } from '@/hooks/useDismissable';
import { Icon, BrandIcon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

/**
 * 270px drawer sliding in from the inline-end edge.
 *
 * Geometry, easing and behaviour are the source site's: `right: -280px -> 0` over
 * 0.4s cubic-bezier(.77,.2,.05,1), a blurred scrim, tap-to-expand submenus, and the
 * drawer closing on any leaf-link tap. Expressed with logical properties so the
 * transform is direction-correct rather than hard-coded to RTL.
 *
 * Added: focus trap, Escape, focus return, and `aria-expanded` — none of which the
 * source has.
 */
export function MobileDrawer({
  open,
  onClose,
  social,
}: {
  open: boolean;
  onClose: () => void;
  social: SocialLink[];
}) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string | null>(null);
  const ref = useDismissable(open, onClose);

  const isActive = (href: string) =>
    href !== '#' && (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <>
      {/* Scrim */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-[9998] cursor-pointer bg-[var(--overlay-menu)] backdrop-blur-[10px]',
          'transition-opacity duration-300 lg:hidden',
          open ? 'visible opacity-100' : 'invisible opacity-0'
        )}
      />

      <div
        ref={ref}
        id="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="القائمة"
        className={cn(
          'fixed z-[10000] w-[270px] lg:hidden',
          'h-[100dvh] overflow-y-auto bg-surface-3 pt-15 pb-25',
          'shadow-[-5px_0_15px_rgb(0_0_0/0.5)]',
          'transition-transform duration-[400ms] ease-[var(--ease-drawer)]',
          // Anchored to the inline-start edge — which is the physical right in RTL,
          // matching the source's `right: -280px -> 0`. The closed transform has to
          // push it toward that same physical edge, so the sign flips per direction.
          open ? 'translate-x-0' : 'rtl:translate-x-full ltr:-translate-x-full'
        )}
        style={{ insetInlineStart: 0, insetBlock: 0 }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق القائمة"
          className="absolute top-5 z-[10001] p-2.5 text-2xl text-white"
          style={{ insetInlineEnd: '1.25rem' }}
        >
          <Icon name="close" size={24} />
        </button>

        <ul className="flex flex-col text-end">
          {mainNav.map((item) => {
            const hasChildren = !!item.children?.length;
            const isOpen = expanded === item.label;

            return (
              <li key={item.label} className="w-full border-b border-white/8">
                {hasChildren ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : item.label)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between px-6 py-4 text-base font-bold transition-colors hover:bg-primary"
                    >
                      <span>{item.label}</span>
                      <Icon
                        name="chevronDown"
                        size={14}
                        className={cn('transition-transform duration-300', isOpen && 'rotate-180')}
                      />
                    </button>
                    <ul className={cn('bg-black/30', isOpen ? 'block' : 'hidden')}>
                      {item.children!.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={onClose}
                            className="block py-3 ps-5 pe-10 text-sm text-[#ccc] transition-colors hover:text-white before:text-primary before:content-['-_']"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                    className={cn(
                      'block px-6 py-4 text-base font-bold transition-all duration-300 hover:bg-primary hover:pe-9',
                      isActive(item.href) && 'text-primary'
                    )}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>

        <div className="mt-10 flex justify-center gap-5">
          {social
            .filter((s) => ['instagram', 'tiktok', 'snapchat', 'youtube'].includes(s.name))
            .map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="text-white transition-colors hover:text-primary"
              >
                <BrandIcon name={s.name} size={20} />
              </a>
            ))}
        </div>

        <p className="mt-6 text-center">
          <a href={telLink} className="text-lg font-bold text-primary" dir="ltr">
            {site.phone}
          </a>
        </p>

        <p className="mt-8 mb-5 text-center">
          <a
            href={bookingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-[var(--radius-pill)] bg-primary px-10 py-2.5 font-bold text-white shadow-[var(--shadow-cta)]"
          >
            حــجــز مــوعــد
          </a>
        </p>
      </div>
    </>
  );
}
