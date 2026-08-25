import type { Service } from '@/data/services';
import type { ServiceContent } from '@/data/service-content';
import { PageHero } from '@/components/layout/PageHero';
import { ServiceDetail } from '@/components/services/ServiceDetail';

/**
 * Page shell for a single service. One template, eight routes — the differences all live
 * in data/services.ts and data/service-content.ts.
 */
export function ServiceDetailPage({
  service,
  content,
}: {
  service: Service;
  content: ServiceContent;
}) {
  return (
    <main id="main">
      <PageHero
        title={service.heading}
        crumbs={[{ label: 'خدماتنا', href: '/خدمات' }, { label: service.title }]}
      />
      <ServiceDetail service={service} content={content} />
    </main>
  );
}
