import { apiGet, apiList } from '@/lib/api/client';
import { topRoutes } from '@/data/routes';
import type { IconName } from '@/components/ui/Icon';
import {
  mapPartner,
  mapReview,
  type ApiPartner,
  type ApiReview,
  type ApiImageSlot,
} from '@/lib/api/dto';

/**
 * Homepage content.
 *
 * API SEAM — the homepage is one CMS document, so `getHomeContent()` is one accessor
 * returning one object rather than eight. The page destructures it and passes each block
 * down as props, exactly as before.
 *
 * Two blocks are NOT part of that document, because they are lists the admin adds and
 * removes items from rather than fields they edit: partner logos (`Partner`) and review
 * screenshots (`Review`). They are fetched alongside and merged here, so the component
 * contract is unchanged.
 *
 * Every field has an empty-but-valid default. The CMS ships empty, so "the admin has
 * not filled this in yet" is the normal first-run state and must render, not crash.
 */

type Tile = { label: string; href: string; image: string; alt: string };

/** Where the branches tile points. Derived from the route table, not typed twice. */
const BRANCHES_PATH = `/${topRoutes.find((r) => r.page === 'branches')?.slug ?? 'فروعنا'}`;

export type HomeContent = {
  hero: {
    video: string;
    poster: string;
    width: number | null;
    height: number | null;
    ctaLabel: string;
    ctaText: string;
  };
  trust: { head: string; sub: string; image?: string; icon?: string }[];
  whyUs: {
    heading: string;
    description: string;
    image: string;
    imageAlt: string;
    points: string[];
    ctaLabel: string;
  };
  stats: { value: number; suffix: string; title: string }[];
  reviews: { heading: string; description: string; images: { src: string; alt: string }[] };
  partners: { name: string; src: string }[];
  heroTiles: {
    branches: Tile;
    gallery: { label: string; image: string; alt: string; actions: { label: string; href: string; icon: IconName }[] };
    servicesLabel: string;
  };
  contactBlock: { heading: string; subheading: string; formTitle: string };
};

/** Backend shape of the HomeContent singleton. */
type ApiHome = {
  hero?: {
    video?: string | null;
    poster?: string | null;
    width?: number | null;
    height?: number | null;
    ctaLabel?: string;
    ctaText?: string;
  };
  heroTiles?: {
    servicesLabel?: string;
    branches?: { label?: string; href?: string; image?: ApiImageSlot };
    gallery?: {
      label?: string;
      image?: ApiImageSlot;
      actions?: { label?: string; href?: string; icon?: string }[];
    };
  };
  trust?: { head?: string; sub?: string; icon?: string; image?: ApiImageSlot }[];
  whyUs?: {
    heading?: string;
    description?: string;
    image?: ApiImageSlot;
    points?: string[];
    ctaLabel?: string;
  };
  stats?: { value?: number; suffix?: string; title?: string }[];
  reviewsIntro?: { heading?: string; description?: string };
  contactBlock?: { heading?: string; subheading?: string; formTitle?: string };
};

/** @endpoint GET /api/v1/home */
export async function getHomeContent(): Promise<HomeContent> {
  // Three requests in parallel — one document plus the two collections it references.
  const [home, partners, reviews] = await Promise.all([
    apiGet<ApiHome>('/home'),
    apiList<ApiPartner>('/partners?limit=100'),
    apiList<ApiReview>('/reviews?isActive=true&limit=100'),
  ]);

  const h = home ?? {};

  return {
    hero: {
      video: h.hero?.video ?? '',
      poster: h.hero?.poster ?? '',
      width: h.hero?.width ?? null,
      height: h.hero?.height ?? null,
      ctaLabel: h.hero?.ctaLabel ?? '',
      ctaText: h.hero?.ctaText ?? '',
    },

    trust: (h.trust ?? []).map((t) => ({
      head: t.head ?? '',
      sub: t.sub ?? '',
      image: t.image?.url ?? undefined,
      icon: t.icon || undefined,
    })),

    whyUs: {
      heading: h.whyUs?.heading ?? '',
      description: h.whyUs?.description ?? '',
      image: h.whyUs?.image?.url ?? '',
      imageAlt: h.whyUs?.image?.alt ?? '',
      points: h.whyUs?.points ?? [],
      ctaLabel: h.whyUs?.ctaLabel ?? '',
    },

    stats: (h.stats ?? []).map((s) => ({
      value: s.value ?? 0,
      suffix: s.suffix ?? '',
      title: s.title ?? '',
    })),

    reviews: {
      heading: h.reviewsIntro?.heading ?? '',
      description: h.reviewsIntro?.description ?? '',
      images: reviews.map(mapReview),
    },

    partners: partners.map(mapPartner),

    heroTiles: {
      servicesLabel: h.heroTiles?.servicesLabel ?? '',
      branches: {
        label: h.heroTiles?.branches?.label ?? '',
        // Not editable in the dashboard — a stored value still wins if one exists.
        href: h.heroTiles?.branches?.href || BRANCHES_PATH,
        image: h.heroTiles?.branches?.image?.url ?? '',
        alt: h.heroTiles?.branches?.image?.alt ?? '',
      },
      gallery: {
        label: h.heroTiles?.gallery?.label ?? '',
        image: h.heroTiles?.gallery?.image?.url ?? '',
        alt: h.heroTiles?.gallery?.image?.alt ?? '',
        actions: (h.heroTiles?.gallery?.actions ?? []).map((a) => ({
          label: a.label ?? '',
          href: a.href ?? '',
          icon: (a.icon || 'images') as IconName,
        })),
      },
    },

    contactBlock: {
      heading: h.contactBlock?.heading ?? '',
      subheading: h.contactBlock?.subheading ?? '',
      formTitle: h.contactBlock?.formTitle ?? '',
    },
  };
}
