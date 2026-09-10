import { CmsImage } from '@/components/ui/CmsImage';
import Link from 'next/link';
import { getServices } from '@/data/services';
import { getHomeSections } from '@/data/home';
import { getPageCopy, getSiteSettings } from '@/data/settings';
import { waLink } from '@/lib/whatsapp';
import { PageHero } from '@/components/layout/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { Icon } from '@/components/ui/Icon';

/**
 * Services index — the hub linking to all eight detail pages.
 *
 * One grid over the same `services` array the homepage and detail pages use, rather than
 * hand-built rows — so adding a ninth service is a data edit, not a layout edit.
 */
export async function ServicesPage() {
  const [services, sections, pageCopy, settings] = await Promise.all([
    getServices(),
    getHomeSections(),
    getPageCopy(),
    getSiteSettings(),
  ]);

  return (
    <main id="main">
      <PageHero title="خدماتنا" crumbs={[{ label: 'خدماتنا' }]} />

      <section className="bg-ink py-8">
        <div className="mx-auto w-[95%] max-w-[var(--container-narrow)]">
          <Reveal>
            <p className="mb-8 max-w-[70ch] text-base leading-loose text-fg-muted">
              {pageCopy.servicesIntro ||
                'نعتني بسيارتك من داخليتها لهيكلها الخارجي ونقدم كل خدمات حماية السيارات باستخدام أحدث التقنيات وأفضل المنتجات الأصلية، اختر الخدمة التي تحتاجها:'}
            </p>
          </Reveal>

          <ul className="grid gap-5 sm:grid-cols-2">
            {services.map((service, i) => (
              <Reveal as="li" key={service.slug} delay={(i % 2) * 70}>
                <article className="group h-full overflow-hidden rounded-[var(--radius-xl)] border border-line bg-glass transition-colors duration-300 hover:border-primary">
                  <Link href={`/خدمات/${service.slug}`} className="block">
                    <span className="relative block aspect-[16/10] overflow-hidden">
                      <CmsImage
                        src={service.wideImage}
                        alt={service.title}
                        fill
                        sizes="(max-width: 639px) 95vw, 45vw"
                        loading={i < 2 ? 'eager' : 'lazy'}
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 bg-[linear-gradient(to_top,rgb(0_0_0/0.85),transparent_55%)]"
                      />
                    </span>
                  </Link>

                  <div className="p-5">
                    <h2 className="text-xl font-black">
                      <Link href={`/خدمات/${service.slug}`} className="transition-colors hover:text-primary">
                        {service.title}
                      </Link>
                    </h2>
                    <p className="mt-2 text-base leading-relaxed text-fg-muted">
                      {service.tagline}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <a
                        href={waLink(service.enquiry, settings.whatsappNumber)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block rounded-[var(--radius-md)] bg-primary px-5 py-2 font-bold text-white transition-colors duration-300 hover:bg-white hover:text-primary"
                      >
                        {sections.ctaLabel || 'احجز الآن'}
                      </a>
                      <Link
                        href={`/خدمات/${service.slug}`}
                        className="inline-flex items-center gap-1.5 font-bold text-fg-muted transition-colors hover:text-primary"
                      >
                        تفاصيل الخدمة
                        <Icon name="chevronEnd" size={14} className="rtl-flip" />
                      </Link>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
