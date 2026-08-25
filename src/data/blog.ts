import { apiGet } from '@/lib/api/client';

/**
 * Blog-index copy — the banner above the article grid.
 *
 * API SEAM — editorial content rather than layout, so it is CMS-managed like the rest of
 * the page copy.
 */

export type BlogIntro = {
  heading: string;
  description: string;
  image: string;
  imageAlt: string;
};

type ApiBlogIntro = {
  heading?: string;
  description?: string;
  image?: string | null;
  imageAlt?: string;
};

/** @endpoint GET /api/v1/blog-intro */
export async function getBlogIntro(): Promise<BlogIntro> {
  const intro = await apiGet<ApiBlogIntro>('/blog-intro');
  return {
    heading: intro?.heading ?? '',
    description: intro?.description ?? '',
    image: intro?.image ?? '',
    imageAlt: intro?.imageAlt ?? '',
  };
}
