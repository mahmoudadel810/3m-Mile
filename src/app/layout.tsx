import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import { site } from "@/data/site";
import { getPromo } from "@/data/promo";
import { getSiteLogo, getSocialLinks, getSiteSettings } from "@/data/settings";
import { getServices } from "@/data/services";
import { SiteChrome } from "@/components/layout/SiteChrome";
import Script from "next/script";
// @ts-expect-error Next.js handles this global stylesheet import.
import "./globals.css";

/**
 * Cairo is the entire type system — Arabic and Latin both, so mixed strings render in
 * one family. next/font self-hosts it, which removes the Google Fonts round-trip
 * entirely. No second family is loaded anywhere.
 */
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
  variable: "--font-cairo",
});

/**
 * Site name and description come from the CMS (with `site.ts` fallbacks), so this is
 * `generateMetadata` rather than a static export. `openGraph.siteName` uses the full
 * brand string (`siteNameFull`), not the short `siteName`.
 */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    metadataBase: new URL(site.url),
    title: {
      default: `3M مايل Mile | مركز متخصص في حماية السيارات`,
      template: `%s | ${settings.siteName}`,
    },
    description: settings.description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: site.locale,
      siteName: settings.siteNameFull,
      title: `3M مايل Mile | مركز متخصص في حماية السيارات`,
      description: settings.description,
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [promo, logo, social, settings, services] = await Promise.all([
    getPromo(),
    getSiteLogo(),
    getSocialLinks(),
    getSiteSettings(),
    getServices(),
  ]);
  // first 3 by `order` (getServices() is already sorted server-side); never
  // padded if fewer exist.
  const footerServices = services
    .slice(0, 3)
    .map((s) => ({ slug: s.slug, title: s.title }));

  return (
    <html lang={site.lang} dir={site.dir} className={cairo.variable}>
      <body>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17959780610"
          strategy="afterInteractive"
        />
        <Script id="google-ads-gtag" strategy="afterInteractive">
          {`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'AW-17959780610');
    `}
        </Script>
        {/* Header/footer/floating actions/promo — suppressed under /admin. */}
        <SiteChrome
          promo={promo}
          logo={logo}
          social={social}
          phone={settings.contactPhone}
          whatsappNumber={settings.whatsappNumber}
          footerDescription={settings.footerDescription}
          footerEmail={settings.contactEmail}
          footerServices={footerServices}
        >
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
