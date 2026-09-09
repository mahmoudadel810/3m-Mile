import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { subRoutes, findSubRoute, decodeSlug, SERVICES_SEGMENT } from '@/data/routes';
import { getSubRouteMetadata } from '@/data/route-metadata';
import { getService, getServiceSlugs } from '@/data/services';
import { getServiceContent } from '@/data/service-content';
import { getSiteSettings } from '@/data/settings';
import { ServiceDetailPage } from '@/components/pages/ServiceDetailPage';
import { PhotoGalleryPage } from '@/components/pages/PhotoGalleryPage';
import { OffersPage } from '@/components/pages/OffersPage';

/** Dispatcher for two-segment routes: the services, the photo gallery, the offers page. */

/**
 * `true` because services are CMS content. A service added after the last build has no
 * entry in `generateStaticParams`, and with `dynamicParams = false` it would 404 until
 * someone redeployed — which is exactly what the CMS exists to avoid. Unknown slugs
 * still 404 properly, via the `notFound()` below.
 */
export const dynamicParams = true;

export async function generateStaticParams() {
  const serviceSlugs = await getServiceSlugs();

  return [
    ...subRoutes.map((r) => ({ slug: r.slug, sub: r.sub! })),
    ...serviceSlugs.map((sub) => ({ slug: SERVICES_SEGMENT, sub })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; sub: string }>;
}): Promise<Metadata> {
  const { slug, sub } = await params;
  return getSubRouteMetadata(slug, sub);
}

export default async function SubRoute({
  params,
}: {
  params: Promise<{ slug: string; sub: string }>;
}) {
  const { slug, sub } = await params;
  const route = findSubRoute(slug, sub);
  if (!route) notFound();

  if (route.page === 'photo-gallery') return <PhotoGalleryPage />;
  if (route.page === 'offers') return <OffersPage />;

  const [service, settings] = await Promise.all([getService(decodeSlug(sub)), getSiteSettings()]);
  const content = service ? await getServiceContent(service.slug) : undefined;
  if (!service || !content) notFound();
  return (
    <ServiceDetailPage
      service={service}
      content={content}
      whatsappNumber={settings.whatsappNumber}
    />
  );
}
