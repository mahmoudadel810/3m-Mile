import { apiGet } from '@/lib/api/client';
import { site } from '@/data/site';
import type { BrandName } from '@/components/ui/Icon';

/**
 * Site settings from the CMS.
 *
 * API SEAM — the dashboard's site-settings screen writes the settings singleton, and
 * this is the public site's read side.
 */

export type SiteLogo = {
  src: string;
  alt: string;
  width: number | undefined;
  height: number | undefined;
};

export type SocialLink = { name: BrandName; label: string; href: string };

type ApiSettings = {
  logo?: {
    url?: string | null;
    alt?: string;
    width?: number | null;
    height?: number | null;
  };
  socialLinks?: Partial<Record<string, string>>;
  siteName?: string;
  siteNameFull?: string;
  tagline?: string;
  description?: string;
  contactPhone?: string;
  whatsappNumber?: string;
  contactEmail?: string;
  workingHours?: string;
  rating?: { score?: string; reviewCount?: number };
  aboutTitle?: string;
  aboutDescription?: string;
  aboutImage?: string | null;
  aboutFeatures?: string[];
  pageCopy?: {
    servicesIntro?: string;
    branchesHeading?: string;
    branchesSub?: string;
    shopIntro?: string;
    photoGalleryCta?: string;
  };
};

export type SiteSettings = {
  siteName: string;
  /** Full brand string, used for `openGraph.siteName`. */
  siteNameFull: string;
  tagline: string;
  /** SEO meta description, with the `site.ts` fallback. */
  description: string;
  /** The CMS `description` as stored (`''` when unset); `SiteFooter` supplies its own fallback. */
  footerDescription: string;
  contactPhone: string;
  whatsappNumber: string;
  contactEmail: string;
  workingHours: string;
  rating: { score: string; reviewCount: number };
  about: { title: string; description: string; image: string; features: string[] };
};

/**
 * «نصوص الصفحات»: per-page intro/heading copy. Empty string when absent; each consumer
 * applies its own literal fallback with `||`, since older documents have no `pageCopy`.
 */
export type PageCopy = {
  servicesIntro: string;
  branchesHeading: string;
  branchesSub: string;
  shopIntro: string;
  photoGalleryCta: string;
};

/**
 * Backend key -> the brand glyph and the accessible label. `twitter` is the stored key;
 * the platform is X, which is what the icon and the label say.
 */
const SOCIALS: { key: string; name: BrandName; label: string }[] = [
  { key: 'facebook', name: 'facebook', label: 'Facebook' },
  { key: 'instagram', name: 'instagram', label: 'Instagram' },
  { key: 'snapchat', name: 'snapchat', label: 'Snapchat' },
  { key: 'tiktok', name: 'tiktok', label: 'TikTok' },
  { key: 'youtube', name: 'youtube', label: 'YouTube' },
  { key: 'twitter', name: 'x', label: 'X' },
];

/**
 * @endpoint GET /api/v1/settings
 * Returns null until an admin uploads a logo — the header then falls back to the
 * site name as styled text rather than a broken image.
 */
export async function getSiteLogo(): Promise<SiteLogo | null> {
  const settings = await apiGet<ApiSettings>('/settings');
  const url = settings?.logo?.url;
  if (!url) return null;

  return {
    src: url,
    alt: settings.logo?.alt || site.name,
    width: settings.logo?.width ?? undefined,
    height: settings.logo?.height ?? undefined,
  };
}

/**
 * @endpoint GET /api/v1/settings
 * Social profiles, in a fixed display order. A field the admin has left blank is omitted
 * rather than rendered as a dead link, so retiring an account means clearing the field.
 */
export async function getSocialLinks(): Promise<SocialLink[]> {
  const settings = await apiGet<ApiSettings>('/settings');
  const links = settings?.socialLinks ?? {};

  return SOCIALS.flatMap(({ key, name, label }) => {
    const href = links[key]?.trim();
    return href ? [{ name, label, href }] : [];
  });
}

/**
 * @endpoint GET /api/v1/settings
 *
 * Identity/contact/rating fields fall back to `site.ts` here. `about.*` and
 * `footerDescription` have no `site.ts` equivalent and return `''`; `AboutPage` and
 * `SiteFooter` supply their own fallbacks.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const s = await apiGet<ApiSettings>('/settings');

  return {
    siteName: s?.siteName || site.name,
    siteNameFull: s?.siteNameFull || site.nameFull,
    tagline: s?.tagline || site.tagline,
    description: s?.description || site.description,
    footerDescription: s?.description ?? '',
    contactPhone: s?.contactPhone || site.phone,
    whatsappNumber: s?.whatsappNumber || site.whatsapp,
    contactEmail: s?.contactEmail || site.email,
    workingHours: s?.workingHours || site.hours,
    rating: {
      score: s?.rating?.score || site.stats.rating,
      reviewCount: s?.rating?.reviewCount || site.stats.reviewCount,
    },
    about: {
      // No `site.name` fallback: PageHero already shows it, so an unset title renders nothing.
      title: s?.aboutTitle ?? '',
      description: s?.aboutDescription ?? '',
      image: s?.aboutImage ?? '',
      features: s?.aboutFeatures ?? [],
    },
  };
}

/** @endpoint GET /api/v1/settings */
export async function getPageCopy(): Promise<PageCopy> {
  const s = await apiGet<ApiSettings>('/settings');

  return {
    servicesIntro: s?.pageCopy?.servicesIntro ?? '',
    branchesHeading: s?.pageCopy?.branchesHeading ?? '',
    branchesSub: s?.pageCopy?.branchesSub ?? '',
    shopIntro: s?.pageCopy?.shopIntro ?? '',
    photoGalleryCta: s?.pageCopy?.photoGalleryCta ?? '',
  };
}
