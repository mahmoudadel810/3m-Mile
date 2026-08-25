/**
 * Backend document shapes, and the mappers that turn them into the frontend's types.
 *
 * This file is the entire translation layer. The rule it enforces:
 *
 *   the backend owns TRANSPORT naming  — paths, `_id`, the response envelope
 *   the frontend owns LAYOUT-BEARING shape — named image slots, `Paged<T>`, `{q,a}`
 *
 * Renaming backend fields to match the frontend would break other consumers; renaming
 * frontend fields to match the backend would mean editing components, which the brief
 * forbids unless integration strictly requires it. Mapping once, here, does neither.
 *
 * Mismatches resolved below (see docs/INTEGRATION-AUDIT.md §5):
 *   _id → id            content → contentHTML     publishedAt → date
 *   coverImage → featured                        {question,answer} → {q,a}
 */

export type ApiImageSlot = {
  url: string | null;
  publicId?: string | null;
  alt?: string;
  width?: number | null;
  height?: number | null;
};

export type ApiCategory = {
  _id: string;
  name: string;
  slug: string;
  type?: 'product' | 'service' | 'blog';
  description?: string;
  order?: number;
  /** Only present when the list was requested with `withCounts=true`. */
  count?: number;
};

export type ApiBlogPost = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  coverImage?: { url?: string | null; alt?: string; width?: number | null; height?: number | null };
  categories?: (ApiCategory | string)[];
  tags?: string[];
  publishedAt?: string | null;
  createdAt?: string;
};

export type ApiProduct = {
  _id: string;
  name: string;
  slug: string;
  excerpt?: string;
  shortDescription?: string;
  description?: string;
  images?: { url?: string | null; publicId?: string | null }[];
  category?: ApiCategory | string | null;
};

export type ApiService = {
  _id: string;
  title: string;
  slug: string;
  heading?: string;
  tagline?: string;
  shortDescription?: string;
  description?: string;
  features?: string[];
  enquiry?: string;
  heroImage?: ApiImageSlot;
  wideImage?: ApiImageSlot;
  gridImage?: ApiImageSlot;
  collage?: ApiImageSlot[];
  introHeading?: string;
  introBody?: string;
  introPoints?: { title: string; body: string }[];
  primaryCta?: string;
  benefitsHeading?: string;
  benefits?: { title: string; body: string }[];
  secondaryCta?: string;
  order?: number;
};

export type ApiBranch = {
  _id: string;
  name: string;
  city?: string;
  address?: string;
  phone?: string;
  mapUrl?: string;
  pin?: { top?: string; start?: string };
};

export type ApiGalleryItem = {
  _id: string;
  title?: string;
  type: 'image' | 'video';
  url?: string | null;
  thumbnailUrl?: string | null;
  description?: string;
  alt?: string;
  href?: string;
  externalId?: string;
};

export type ApiFaq = { _id: string; question: string; answer: string };

export type ApiPartner = { _id: string; name: string; logo?: string | null };

export type ApiReview = { _id: string; image?: string | null; alt?: string };

export type ApiPackage = {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  image?: string | null;
};

export type ApiWarrantyGroup = {
  _id: string;
  title: string;
  slug: string;
  intro?: string;
  tiers?: { title: string; warranty?: string; maintenance?: string; terms?: string[] }[];
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * A CMS image, normalised for rendering.
 *
 * Returns null rather than an object with a null url, so call sites branch once on
 * "is there an image" instead of twice. Width/height are passed through only when the
 * backend knows them — they let a container reserve its aspect box, and are never
 * allowed to set the container's size. See `CmsImage`.
 */
export type UiImage = { url: string; alt: string; width: number | null; height: number | null };

export const toImage = (
  slot: ApiImageSlot | { url?: string | null; alt?: string; width?: number | null; height?: number | null } | null | undefined,
  fallbackAlt = '',
): UiImage | null => {
  if (!slot?.url) return null;
  return {
    url: slot.url,
    alt: slot.alt || fallbackAlt,
    width: slot.width ?? null,
    height: slot.height ?? null,
  };
};

/** A plain `{url}` image, for the models that store a bare string. */
export const toImageFromUrl = (url: string | null | undefined, alt = ''): UiImage | null =>
  url ? { url, alt, width: null, height: null } : null;

/** Category references may arrive populated or as bare ObjectIds. */
const categorySlugs = (categories: (ApiCategory | string)[] | undefined): string[] =>
  (categories ?? [])
    .map((c) => (typeof c === 'string' ? null : c?.slug))
    .filter((s): s is string => Boolean(s));

/** Strip tags for contexts that need plain text (meta descriptions, card teasers). */
export const stripHtml = (html: string): string =>
  html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

export const mapCategory = (c: ApiCategory) => ({
  id: c._id,
  slug: c.slug,
  name: c.name,
  // Absent unless the caller asked for counts; 0 renders as "(0)" which is truthful.
  count: c.count ?? 0,
  description: c.description ?? '',
});

export const mapPostSummary = (p: ApiBlogPost) => ({
  id: p._id,
  slug: p.slug,
  title: p.title,
  // `publishedAt` is null for a draft; fall back to createdAt so the card never renders
  // "Invalid Date".
  date: p.publishedAt || p.createdAt || '',
  excerpt: p.excerpt ?? '',
  categories: categorySlugs(p.categories),
  featured: toImage(p.coverImage, p.title),
});

export const mapPost = (p: ApiBlogPost) => ({
  ...mapPostSummary(p),
  contentHTML: p.content ?? '',
});

export const mapProductSummary = (p: ApiProduct) => ({
  id: p._id,
  slug: p.slug,
  title: p.name,
  excerpt: p.excerpt ?? '',
  categories: categorySlugs(p.category ? [p.category] : []),
  featured: toImageFromUrl(p.images?.[0]?.url, p.name),
});

export const mapProduct = (p: ApiProduct) => ({
  ...mapProductSummary(p),
  contentHTML: p.description ?? '',
  shortDescriptionHTML: p.shortDescription || null,
  gallery: (p.images ?? [])
    .map((img) => toImageFromUrl(img.url, p.name))
    .filter((img): img is UiImage => Boolean(img)),
});

export const mapService = (s: ApiService) => ({
  slug: s.slug,
  title: s.title,
  heading: s.heading || s.title,
  tagline: s.tagline ?? '',
  shortDescription: s.shortDescription ?? '',
  description: s.description ?? '',
  features: s.features ?? [],
  enquiry: s.enquiry || s.title,
  heroImage: toImage(s.heroImage, s.title),
  wideImage: toImage(s.wideImage, s.title),
  gridImage: toImage(s.gridImage, s.title),
  collage: (s.collage ?? []).map((c) => toImage(c, s.title)),
  content: {
    introHeading: s.introHeading ?? '',
    introBody: s.introBody ?? '',
    introPoints: s.introPoints ?? [],
    primaryCta: s.primaryCta ?? '',
    benefitsHeading: s.benefitsHeading ?? '',
    benefits: s.benefits ?? [],
    secondaryCta: s.secondaryCta ?? '',
  },
});

export const mapBranch = (b: ApiBranch) => ({
  id: b._id,
  name: b.name,
  city: b.city ?? '',
  address: b.address ?? '',
  phone: b.phone ?? '',
  mapUrl: b.mapUrl ?? '',
  // The map overlay needs both halves; a branch with no pin is simply not plotted.
  pin: b.pin?.top && b.pin?.start ? { top: b.pin.top, start: b.pin.start } : null,
});

/** `{question, answer}` on the wire, `{q, a}` in the accordion component. */
export const mapFaq = (f: ApiFaq) => ({ q: f.question, a: f.answer });

export const mapPartner = (p: ApiPartner) => ({ name: p.name, src: p.logo ?? '' });

export const mapReview = (r: ApiReview) => ({ src: r.image ?? '', alt: r.alt ?? '' });

/** Video gallery items are YouTube Shorts, identified by `externalId`. */
export const mapReel = (g: ApiGalleryItem) => ({
  id: g.externalId || g._id,
  title: g.title ?? '',
  description: g.description ?? '',
});

/**
 * Photo gallery items link onward to a service page — the gallery is an internal-linking
 * device on this site, not a lightbox.
 */
export const mapPhoto = (g: ApiGalleryItem) => ({
  src: g.url ?? '',
  alt: g.alt || g.title || '',
  href: g.href || '',
});

export const mapOffer = (p: ApiPackage) => ({
  id: p._id,
  title: p.title,
  image: p.image ?? '',
  alt: p.title,
  whatsappText: p.description || p.title,
});

export const mapWarrantyGroup = (g: ApiWarrantyGroup) => ({
  id: g.slug || g._id,
  title: g.title,
  intro: g.intro ?? '',
  tiers: (g.tiers ?? []).map((t) => ({
    title: t.title,
    warranty: t.warranty ?? '',
    maintenance: t.maintenance ?? '',
    terms: t.terms ?? [],
  })),
});
