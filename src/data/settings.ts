import { apiGet } from '@/lib/api/client';
import { site } from '@/data/site';
import type { BrandName } from '@/components/ui/Icon';

/**
 * Site settings from the CMS.
 *
 * API SEAM — the dashboard's site-settings screen writes the settings singleton, and
 * this is the public site's read side. The logo and the social links are consumed; the
 * remaining fields (name, phone, hours) still render from `src/data/site.ts` — a known
 * gap, disclosed on the settings screen itself.
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
