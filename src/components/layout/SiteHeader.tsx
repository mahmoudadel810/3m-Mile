'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { mainNav } from '@/data/nav';
import { site } from '@/data/site';
import type { SiteLogo, SocialLink } from '@/data/settings';
import { bookingLinkFor } from '@/lib/whatsapp';
import { useScrolled } from '@/hooks/useScrolled';
import { Icon } from '@/components/ui/Icon';
import { MobileDrawer } from './MobileDrawer';
import { cn } from '@/lib/cn';

/**
 * Fixed glass header.
 *
 * Values are the source site's, exactly: rgba(0,0,0,.45) -> .5 background, 5px -> 20px
 * backdrop blur, 8px -> 12px padding, all over 0.3s, triggered at scrollY > 50.
 *
 * Logo is height-bound (40px -> 32px), not width-bound: the logo slot only guarantees a
 * landscape shape, so bounding the height keeps any asset from growing the header.
 *
 * The real element is measured and published as --header-height, so the body's offset
 * stays correct when the logo shrinks or the viewport changes.
 */
export function SiteHeader({
  logo,
  social,
  phone,
  whatsappNumber,
}: {
  logo: SiteLogo | null;
  social: SocialLink[];
  phone: string;
  whatsappNumber: string;
}) {
  const scrolled = useScrolled(50);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const publish = () =>
      document.documentElement.style.setProperty(
        '--header-height',
        `${Math.round(el.getBoundingClientRect().height)}px`
      );
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const isActive = (href: string) =>
    href !== '#' && (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          'fixed top-0 left-0 z-[9999] w-full transition-all duration-300',
          scrolled
            ? 'border-b border-line-soft py-3 shadow-[var(--shadow-header)] backdrop-blur-[var(--header-blur-scrolled)]'
            : 'py-2 backdrop-blur-[var(--header-blur)]'
        )}
        style={{
          backgroundColor: scrolled ? 'var(--header-bg-scrolled)' : 'var(--header-bg)',
        }}
      >
        <div className="mx-auto flex max-w-[var(--container-wide)] flex-row-reverse items-center justify-between px-4 lg:px-5">
          {/* Logo — visually at the inline-start edge because the row is reversed.
              The artwork is CMS-managed (settings → logo); until an admin uploads
              one, the site name renders as styled text instead of a broken image. */}
          <Link href="/" aria-label={site.nameLatin}>
            {logo ? (
              <Image
                src={logo.src}
                alt={logo.alt}
                width={logo.width ?? 260}
                height={logo.height ?? 94}
                priority
                className={cn(
                  'block w-auto max-w-[200px] transition-[height] duration-300',
                  scrolled ? 'h-[32px]' : 'h-[40px]'
                )}
              />
            ) : (
              <span
                className={cn(
                  'block font-black text-white transition-all duration-300',
                  scrolled ? 'text-xl' : 'text-2xl'
                )}
              >
                {site.name}
              </span>
            )}
          </Link>

          {/* Desktop navigation */}
          <nav aria-label="القائمة الرئيسية" className="hidden lg:block">
            <ul className="flex items-center gap-6">
              {mainNav.map((item) => (
                <li key={item.label} className={cn(item.children && 'group relative')}>
                  {item.children ? (
                    <>
                      <span className="flex cursor-default items-center gap-1.5 py-2.5 text-base font-semibold transition-colors group-hover:text-primary">
                        {item.label}
                        <Icon
                          name="chevronDown"
                          size={12}
                          className="transition-transform duration-300 group-hover:rotate-180"
                        />
                      </span>
                      <ul
                        className={cn(
                          'invisible absolute top-full z-[100] min-w-[180px] translate-y-2.5 opacity-0',
                          'rounded-b-[var(--radius-sm)] border-t-2 border-primary bg-black/85 py-2.5',
                          'shadow-[0_10px_30px_rgb(0_0_0/0.2)] backdrop-blur-[10px]',
                          'transition-all duration-300',
                          'group-hover:visible group-hover:translate-y-0 group-hover:opacity-100'
                        )}
                        style={{ insetInlineEnd: 0 }}
                      >
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className="block px-5 py-2 text-sm transition-all duration-300 hover:bg-primary/10 hover:pe-6"
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
                      aria-current={isActive(item.href) ? 'page' : undefined}
                      className={cn(
                        'block py-2.5 text-base font-semibold transition-colors hover:text-primary',
                        isActive(item.href) && 'text-primary'
                      )}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Desktop booking CTA */}
          <a
            href={bookingLinkFor(whatsappNumber)}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-[var(--radius-sm)] bg-primary px-[18px] py-2 font-bold text-white transition-colors duration-300 hover:bg-white hover:text-primary lg:inline-flex"
          >
            <Icon name="calendar" size={16} />
            <span>حجز موعد</span>
          </a>

          {/* Mobile: pulsing CTA + hamburger */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <a
              href={bookingLinkFor(whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              data-loop-animation
              className="animate-[pulse-scale_2s_infinite] rounded-[4px] bg-primary px-3 py-1.5 text-sm font-bold text-white"
            >
              حجز موعد
            </a>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="فتح القائمة"
              aria-expanded={menuOpen}
              aria-controls="mobile-drawer"
              className="p-0"
            >
              <Icon name="menu" size={34} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </header>

      <MobileDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        social={social}
        phone={phone}
        whatsappNumber={whatsappNumber}
      />
    </>
  );
}
