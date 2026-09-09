import { apiGet, apiList } from '@/lib/api/client';
import { mapPhoto, mapReel, type ApiGalleryItem } from '@/lib/api/dto';

/**
 * Portfolio galleries.
 *
 * API SEAM — both galleries are `GalleryItem` documents, distinguished by `type`.
 *
 * A video reel is either a YouTube Short (`externalId`) or an uploaded file (`url`).
 *
 * The photo gallery is NOT a lightbox gallery, despite appearances: each image links to
 * a related service page. It is an internal-linking device, so `href` is admin-managed
 * content on each item rather than a frontend constant. Preserved as-is; still flagged
 * to the client as a UX question, since visitors reasonably expect a work gallery to
 * enlarge.
 */

export type Reel =
  | { kind: 'youtube'; id: string; title: string; description: string }
  | { kind: 'file'; id: string; src: string; poster: string; title: string; description: string };

export type PhotoItem = { src: string; alt: string; href: string };

export type VideoGalleryIntro = { heading: string; description: string };

type ApiGalleryIntro = {
  video?: { heading?: string; description?: string };
  photo?: { heading?: string; description?: string };
};

/** @endpoint GET /api/v1/gallery?type=video */
export async function getReels(): Promise<Reel[]> {
  const rows = await apiList<ApiGalleryItem>('/gallery?type=video&isActive=true&limit=100');
  // An item with neither source has nothing to play.
  return rows.filter((g) => g.externalId || g.url).map(mapReel);
}

/** @endpoint GET /api/v1/gallery-intro */
export async function getVideoGalleryIntro(): Promise<VideoGalleryIntro> {
  const intro = await apiGet<ApiGalleryIntro>('/gallery-intro');
  return {
    heading: intro?.video?.heading ?? '',
    description: intro?.video?.description ?? '',
  };
}

/** @endpoint GET /api/v1/gallery?type=image */
export async function getPhotos(): Promise<PhotoItem[]> {
  const rows = await apiList<ApiGalleryItem>('/gallery?type=image&isActive=true&limit=100');
  // An item with no uploaded file has nothing to show.
  return rows.filter((g) => g.url).map(mapPhoto);
}
