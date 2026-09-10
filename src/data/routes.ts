/**
 * Route registry — structure only.
 *
 * WHY THIS EXISTS — Next.js will not serve a route whose *directory* name is non-ASCII.
 * The pages build correctly and appear in the prerender manifest with their Arabic keys,
 * but incoming requests never match them and every one returns 404. Verified on both the
 * dev server and a production `next start`, with and without `trailingSlash`, and with
 * the redirects config removed.
 *
 * Arabic slugs passed as *params* under an ASCII dynamic segment work perfectly
 * (`/probe/فروعنا` -> 200). So the app router uses `[slug]` and `[slug]/[sub]`, and this
 * file maps each Arabic path to its page component.
 *
 * Visitors' URLs are unaffected — this is purely how the routes are declared internally.
 *
 * DELIBERATELY SYNCHRONOUS. `generateStaticParams` reads this at build time, so it must
 * not depend on the async data layer; page *content* is fetched separately by the page
 * components, and page *metadata* by `data/route-metadata.ts`. Route structure is
 * frontend-owned — a backend swap should not be able to change which URLs exist.
 */

export type RouteDef = {
  /** First path segment, as it appears in the URL. */
  slug: string;
  /** Second path segment, for two-level routes. */
  sub?: string;
  /** Key used by the dispatcher to pick a component. */
  page: string;
};

/** Top-level Arabic routes. */
export const topRoutes: RouteDef[] = [
  { slug: 'من-نحن', page: 'about' },
  { slug: 'خدمات', page: 'services' },
  { slug: 'فروعنا', page: 'branches' },
  { slug: 'تواصل-معنا', page: 'contact' },
  { slug: 'معرض-الفيديو', page: 'video-gallery' },
  { slug: 'الأسئلة-الشائعة', page: 'faq' },
  { slug: 'سياسة-الضمان', page: 'warranty' },
  { slug: 'المدونة', page: 'blog' },
];

/** First segment of every service detail URL. */
export const SERVICES_SEGMENT = 'خدمات';

/**
 * Two-level routes with a fixed second segment. Service detail pages are CMS content and
 * are matched structurally by `findSubRoute` instead.
 */
export const subRoutes: RouteDef[] = [
  { slug: 'معرض-الفيديو', sub: 'معرض-الصور', page: 'photo-gallery' },
  { slug: 'Packages', sub: 'عروض-حماية-السيارات', page: 'offers' },
];

export const decodeSlug = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

export const findTopRoute = (slug: string) => topRoutes.find((r) => r.slug === decodeSlug(slug));

export const findSubRoute = (slug: string, sub: string): RouteDef | undefined => {
  const top = decodeSlug(slug);
  const second = decodeSlug(sub);

  const fixed = subRoutes.find((r) => r.slug === top && r.sub === second);
  if (fixed) return fixed;

  // Any second segment under /خدمات/ is a service detail page. Whether that service
  // actually exists is decided by the data layer, which 404s if it does not.
  if (top === SERVICES_SEGMENT) return { slug: top, sub: second, page: 'service-detail' };

  return undefined;
};

/**
 * Legacy URLs that may still be linked externally, redirected so nothing 404s.
 *
 * These live here rather than in `next.config.ts` because non-ASCII `redirects()`
 * sources fail to match, the same reason non-ASCII route directories do. Handled as
 * params instead, which works.
 */
export const legacyRedirects: Record<string, string> = {
  'أفلام-حماية-ppf': '/خدمات/أفلام-حماية-ppf',
  'تنجيد-السيارات': '/خدمات/تنجيد-السياره-بالكامل',
  'تنجيد-السياره-بالكامل': '/خدمات/تنجيد-السياره-بالكامل',
  'حماية-الزجاج-الامامي': '/خدمات/فيلم-حماية-الزجاج-الامامي',
  'فيلم-حماية-الزجاج-الامامي': '/خدمات/فيلم-حماية-الزجاج-الامامي',
  'تغيير-لون-السيارة': '/خدمات/تغيير-لون-السيارة',
  'خدمات-العناية-بالسيارات-من-الداخل': '/خدمات/عناية-بالسيارة',
  '1-خدمات-عناية-بالسيارة-من-الداخل': '/خدمات/عناية-بالسيارة',
  'معرض-الصور': '/معرض-الفيديو/معرض-الصور',
  'slider-5-2-2-2-2-2': '/',
  'slider-5-2-2-2-2': '/',
};

export const findLegacyRedirect = (slug: string) => legacyRedirects[decodeSlug(slug)];

/**
 * Literal top-level directories under `src/app`, plus the framework's own reserved paths.
 *
 * Blog posts live at the site root (`/{slug}/`), so they share this namespace — and a
 * literal segment always beats its dynamic sibling. A post slugged `shop` would emit
 * happily from `generateStaticParams`, build green, and then be permanently shadowed by
 * `/shop`. That is the same silent-failure shape as the two routing bugs already found,
 * so `assertNoReservedSlugs` fails the build instead.
 */
export const RESERVED_TOP_SEGMENTS = [
  // The CMS dashboard. Critical now that post slugs are admin-supplied: a post slugged
  // "admin" would build green and then permanently shadow /admin, locking the client
  // out of their own dashboard. Exactly the silent-shadowing shape described above.
  'admin',
  'shop',
  'product',
  'product-category',
  'category',
  '_next',
  'api',
  'media',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
];

/** Throws at build time if any post slug would be shadowed by a literal route. */
export function assertNoReservedSlugs(slugs: string[]): void {
  const reserved = new Set(RESERVED_TOP_SEGMENTS);
  const clashes = slugs.filter((s) => reserved.has(decodeSlug(s)));
  if (clashes.length) {
    throw new Error(
      `Post slug(s) shadowed by a literal route: ${clashes.join(', ')}. ` +
        `Rename the post or move the conflicting route out of the site root.`
    );
  }
}
