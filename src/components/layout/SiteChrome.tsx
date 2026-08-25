'use client';

import { usePathname } from 'next/navigation';
import type { Promo } from '@/data/promo';
import type { SiteLogo, SocialLink } from '@/data/settings';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';
import { FloatingActions } from './FloatingActions';
import { PromoModal } from './PromoModal';

/**
 * The public site's furniture: header, footer, floating WhatsApp actions, promo modal.
 *
 * Suppressed entirely under /admin. The dashboard lives inside the same Next app (so it
 * inherits the fonts, RTL direction and design tokens — which is the point), but it must
 * not inherit the *site chrome*: an admin editing content had the public navigation, a
 * "book now" WhatsApp button and, worst of all, the promotional popup opening on top of
 * their form.
 *
 * Implemented as a pathname check rather than a `(site)` route group because a route
 * group would mean physically moving every public page file for a purely cosmetic
 * boundary. All four components below are already client components, so this adds no
 * new client-side cost.
 */
export function SiteChrome({
  promo,
  logo,
  social,
  children,
}: {
  promo: Promo | null;
  logo: SiteLogo | null;
  social: SocialLink[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return <>{children}</>;
  }

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:z-[100001] focus:rounded-[var(--radius-sm)] focus:bg-primary focus:px-4 focus:py-2 focus:font-bold focus:text-white"
        style={{ insetInlineStart: '0.5rem' }}
      >
        تخطَّ إلى المحتوى
      </a>
      <SiteHeader logo={logo} social={social} />
      {children}
      <SiteFooter social={social} />
      <FloatingActions />
      <PromoModal promo={promo} />
    </>
  );
}
