import { apiGet, apiList } from '@/lib/api/client';
import { mapService, type ApiService } from '@/lib/api/dto';

/**
 * The services — one record each, consumed by three different surfaces: the homepage
 * hero grid slider, the services index, and each detail page.
 *
 * API SEAM — these were eight hard-coded records; they are now CMS documents. The shape
 * is unchanged so no component changed with them.
 *
 * WHY THE IMAGE FIELDS ARE STILL PLAIN STRINGS
 *
 * Each is a URL, exactly as before, because components pass them straight to an image
 * (`src={service.heroImage}`). The backend stores each slot as `{url, publicId, alt}`;
 * flattening to the URL here keeps every call site untouched. Empty string means "the
 * admin has not uploaded this yet" — `CmsImage` renders a placeholder of the same size
 * rather than throwing.
 *
 * The four slots are NAMED on the backend too, not positions in a gallery array. The
 * detail page has four differently-shaped containers, so "index 2" is not a meaningful
 * identity for the wide banner — see service.model.js.
 */

export type Service = {
  slug: string;
  /** Short label used on cards and in menus. */
  title: string;
  /** Full H1 as it appears on the detail page. */
  heading: string;
  /** Two-line teaser used on the About page and the services index. */
  tagline: string;
  /** Square hero on the detail page. */
  heroImage: string;
  /** Wide supporting image. */
  wideImage: string;
  /** Portrait tile used by the homepage hero slider. */
  gridImage: string;
  /** The three benefit images on the detail page. */
  collage: [string, string, string];
  /** Prefilled WhatsApp enquiry text. */
  enquiry: string;
};

/**
 * Always three entries, padded with empty strings.
 *
 * The detail page reads `collage[0..2]` unconditionally. Padding here means a
 * half-filled collage renders three placeholders in a stable grid instead of collapsing
 * the row — the layout must not depend on how much the admin has uploaded.
 */
const padCollage = (urls: (string | null)[]): [string, string, string] => [
  urls[0] ?? '',
  urls[1] ?? '',
  urls[2] ?? '',
];

const toService = (api: ApiService): Service => {
  const m = mapService(api);
  return {
    slug: m.slug,
    title: m.title,
    heading: m.heading,
    tagline: m.tagline,
    heroImage: m.heroImage?.url ?? '',
    wideImage: m.wideImage?.url ?? '',
    gridImage: m.gridImage?.url ?? '',
    collage: padCollage(m.collage.map((c) => c?.url ?? '')),
    enquiry: m.enquiry,
  };
};

/** Only active services reach the public site. */
const ACTIVE = 'isActive=true';

/** @endpoint GET /api/v1/services */
export async function getServices(): Promise<Service[]> {
  const rows = await apiList<ApiService>(`/services?${ACTIVE}&limit=100`);
  return rows.map(toService);
}

/** @endpoint GET /api/v1/services/slug/{slug} */
export async function getService(slug: string): Promise<Service | undefined> {
  const service = await apiGet<ApiService>(`/services/slug/${encodeURIComponent(slug)}`);
  return service ? toService(service) : undefined;
}

/**
 * Services shown in the homepage hero slider.
 *
 * Featured-first, then the rest, so the admin controls the slider by flagging services
 * rather than by reordering the whole catalogue.
 */
export async function getHeroSliderServices(): Promise<Service[]> {
  const featured = await apiList<ApiService>(`/services?${ACTIVE}&isFeatured=true&limit=20`);
  if (featured.length) return featured.map(toService);
  // Nothing flagged yet — fall back to the full list so the slider is never empty on a
  // fresh install.
  return getServices();
}

/** Service names offered in the WhatsApp enquiry form's dropdown. */
export async function getServiceOptions(): Promise<string[]> {
  const services = await getServices();
  return services.map((s) => s.title);
}

/**
 * Every service slug, for `generateStaticParams`.
 *
 * Lives here rather than in `data/routes.ts` because that file is deliberately
 * synchronous — route *structure* is frontend-owned, while which services exist is
 * content the admin controls.
 */
export async function getServiceSlugs(): Promise<string[]> {
  const rows = await apiList<ApiService>(`/services?${ACTIVE}&limit=100`);
  return rows.map((s) => s.slug);
}
