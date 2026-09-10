import { CmsImage } from '@/components/ui/CmsImage';
import { getOffers, getOffersPage } from '@/data/offers';
import { getHomeContent } from '@/data/home';
import { getServiceOptions } from '@/data/services';
import { getBranches } from '@/data/branches';
import { getSiteSettings } from '@/data/settings';
import { waLink } from '@/lib/whatsapp';
import { PageHero } from '@/components/layout/PageHero';
import { TrustStrip } from '@/components/home/TrustStrip';
import { WhatsAppForm } from '@/components/forms/WhatsAppForm';
import { Reveal } from '@/components/ui/Reveal';

/**
 * Seasonal offers landing page.
 *
 * Reuses TrustStrip and WhatsAppForm from the homepage rather than duplicating their
 * markup, so the two pages cannot drift apart. The booking form here adds the branch
 * picker.
 */
export async function OffersPage() {
  const [offers, offersPage, home, serviceOptions, branches, settings] = await Promise.all([
    getOffers(),
    getOffersPage(),
    getHomeContent(),
    getServiceOptions(),
    getBranches(),
    getSiteSettings(),
  ]);

  return (
    <main id="main">
      <PageHero
        title="عروض حماية السيارات"
        crumbs={[{ label: 'العروض' }]}
      />

      <section className="bg-ink py-6">
        <div className="mx-auto w-[95%] max-w-[var(--container-narrow)]">
          <Reveal>
            <div className="relative aspect-[22/9] w-full overflow-hidden rounded-[var(--radius-xl)]">
              <CmsImage
                src={offersPage.banner}
                alt={offersPage.bannerAlt}
                fill
                priority
                sizes="(max-width: 1100px) 95vw, 1100px"
                className="object-cover"
              />
            </div>
          </Reveal>

          <Reveal>
            <p className="mt-6 text-base leading-loose text-fg-muted">{offersPage.intro}</p>
          </Reveal>
        </div>
      </section>

      {offers.length > 0 && (
        <section className="bg-ink pb-8">
          <div className="mx-auto w-[95%] max-w-[var(--container-narrow)]">
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {offers.map((offer, i) => (
                <Reveal as="li" key={offer.id} delay={(i % 3) * 70}>
                  <article className="group relative h-full overflow-hidden rounded-[var(--radius-xl)] border border-line bg-glass transition-colors duration-300 hover:border-primary">
                    {offer.badge && (
                      <span className="absolute top-3 z-10 rounded-[var(--radius-pill)] bg-whatsapp px-3 py-1 text-xs font-black text-white"
                        style={{ insetInlineStart: '0.75rem' }}
                      >
                        {offer.badge}
                      </span>
                    )}

                    <a
                      href={waLink(offer.whatsappText, settings.whatsappNumber)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={offer.title}
                      className="block overflow-hidden"
                    >
                      <CmsImage
                        src={offer.image}
                        alt={offer.alt}
                        width={800}
                        height={1000}
                        loading={i === 0 ? 'eager' : 'lazy'}
                        sizes="(max-width: 639px) 95vw, (max-width: 991px) 47vw, 33vw"
                        className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </a>

                    <div className="p-4 text-center">
                      <h2 className="sr-only">{offer.title}</h2>
                      <a
                        href={waLink(offer.whatsappText, settings.whatsappNumber)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block w-full rounded-[var(--radius-md)] bg-primary px-6 py-2.5 font-bold text-white transition-colors duration-300 hover:bg-white hover:text-primary"
                      >
                        {home.sections.ctaLabel || 'احجز الآن'}
                      </a>
                    </div>
                  </article>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      <TrustStrip trust={home.trust} />

      <section className="bg-ink px-4 py-10">
        <div className="mx-auto max-w-[var(--container-narrow)]">
          {(offersPage.formHeading || offersPage.formSubheading) && (
            <Reveal>
              {offersPage.formHeading && (
                <h2 className={offersPage.formSubheading ? 'text-3xl font-black' : 'mb-6 text-3xl font-black'}>
                  {offersPage.formHeading}
                </h2>
              )}
              {offersPage.formSubheading && (
                <p className="mt-1 mb-6 text-base text-fg-muted">{offersPage.formSubheading}</p>
              )}
            </Reveal>
          )}
          <Reveal delay={80}>
            <WhatsAppForm
              serviceOptions={serviceOptions}
              branches={branches}
              withBranch
              withMessage={false}
              submitLabel="تأكيد الطلب وحجز الموعد"
              whatsappNumber={settings.whatsappNumber}
            />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
