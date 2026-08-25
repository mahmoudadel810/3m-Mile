import type { Metadata, Viewport } from 'next';
import { Cairo } from 'next/font/google';
import { site } from '@/data/site';
import { getPromo } from '@/data/promo';
import { getSiteLogo, getSocialLinks } from '@/data/settings';
import { SiteChrome } from '@/components/layout/SiteChrome';
import './globals.css';

/**
 * Cairo is the entire type system on the source site — Arabic and Latin both.
 * next/font self-hosts it, which removes the Google Fonts round-trip the live site
 * still pays. The source also loads Alexandria and Arial for a handful of stray
 * elements; those are dropped deliberately.
 */
const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-cairo',
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `3M مايل Mile | مركز متخصص في حماية السيارات`,
    template: `%s | 3M مايل`,
  },
  description: site.description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: site.locale,
    siteName: site.nameFull,
    title: `3M مايل Mile | مركز متخصص في حماية السيارات`,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [promo, logo, social] = await Promise.all([getPromo(), getSiteLogo(), getSocialLinks()]);

  return (
    <html lang={site.lang} dir={site.dir} className={cairo.variable}>
      <body>
        {/* Header/footer/floating actions/promo — suppressed under /admin. */}
        <SiteChrome promo={promo} logo={logo} social={social}>{children}</SiteChrome>
      </body>
    </html>
  );
}
