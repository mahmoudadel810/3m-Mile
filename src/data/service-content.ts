import { apiGet } from '@/lib/api/client';
import { mapService, type ApiService } from '@/lib/api/dto';

/**
 * Per-service page copy.
 *
 * One template (components/services/ServiceDetail.tsx) and this is the copy that fills it.
 *
 * API SEAM — the copy lives on the Service document, edited alongside that service's images.
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
