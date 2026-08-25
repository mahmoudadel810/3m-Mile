import { apiGet } from '@/lib/api/client';
import { mapService, type ApiService } from '@/lib/api/dto';

/**
 * Per-service page copy.
 *
 * The source site renders each service page as a separate Elementor document with the
 * same widget layout and different text. Here the layout is one template
 * (components/services/ServiceDetail.tsx) and this is the copy that fills it.
 *
 * API SEAM — this was a hand-maintained record keyed by slug; the copy now lives on the
 * Service document itself, because it is per-service content the admin edits alongside
 * that service's images. The type and the accessor signature are unchanged, so
 * `app/[slug]/[sub]/page.tsx` did not change with it.
 */

export type ServiceContent = {
  /** Opening headline above the intro paragraph. */
  introHeading: string;
  introBody: string;
  /** Two credibility points beside the hero image. */
  introPoints: { title: string; body: string }[];
  primaryCta: string;
  /** Centred headline introducing the benefits block. */
  benefitsHeading: string;
  benefits: { title: string; body: string }[];
  secondaryCta: string;
};

/**
 * @endpoint GET /api/v1/services/slug/{slug}
 *
 * Returns undefined only when the service itself is missing. A service that exists but
 * whose copy the admin has not filled in yet returns empty strings — the page still
 * renders its structure rather than 404-ing, which matters while the CMS is being
 * populated.
 */
export async function getServiceContent(slug: string): Promise<ServiceContent | undefined> {
  const service = await apiGet<ApiService>(`/services/slug/${encodeURIComponent(slug)}`);
  if (!service) return undefined;
  return mapService(service).content;
}
