import Link from 'next/link';
import { CmsImage } from '@/components/ui/CmsImage';
import { getServices } from '@/data/services';
import { getSiteSettings } from '@/data/settings';
import { getHomeSections } from '@/data/home';
import { waLink } from '@/lib/whatsapp';
import { PageHero } from '@/components/layout/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { Icon } from '@/components/ui/Icon';

/** Fallback for `about.description` when the CMS field is empty. */
const introFallback =
  'مراكز 3M مايل المعتمدة، متخصصون في خدمات افلام حماية السيارات PPF، تلميع النانو سيراميك وتظليل العازل الحراري بأعلى جودة ومعايير عالمية. نعتز بكوننا الرواد في استخدام منتجات 3M المتخصصة في العناية بالسيارات حيث نلتزم بتقديم أفضل الخدمات لعملائنا في كل أنحاء المملكة السعودية. بخبرة فريقنا لأكثر من 15 عامًا واحترافيتنا الدائمة، نسعى للحفاظ على قيمة سيارتك حيث نهتم بأدق التفاصيل وأصغرها. باختيارك لخدماتنا لن تقلق بشأن صعوبات الطريق والحصى والسافي أو شمس المملكة الحارقة، سيحافظ دهان سيارتك على لمعته وجماله جديدًا كما هو.';

export async function AboutPage() {
  const [services, settings, sections] = await Promise.all([
    getServices(),
    getSiteSettings(),
    getHomeSections(),
  ]);
  const { about } = settings;
  const ctaLabel = sections.ctaLabel || 'احجز الآن';
  const bookingLink = waLink('ابي حجز موعد', settings.whatsappNumber);

  return (
    <main id="main">
      <PageHero title="3M مايل" crumbs={[{ label: 'من نحن' }]} />

      <section className="bg-ink py-8">
        <div className="mx-auto w-[95%] max-w-[var(--container-narrow)]">
          <div
            className={
              about.image
                ? 'grid items-center gap-6 lg:grid-cols-2 lg:gap-10'
                : undefined
            }
          >
            <div>
              {/* Optional: PageHero already shows the site name. */}
              {about.title && (
                <Reveal>
                  <h2 data-testid="about-title" className="mb-4 text-3xl font-black">
                    {about.title}
                  </h2>
                </Reveal>
              )}
              <Reveal delay={60}>
                <p className="text-base leading-loose text-fg-muted">
                  {about.description || introFallback}
                </p>
              </Reveal>

              {about.features.length > 0 && (
                <ul className="mt-5 grid gap-2.5">
                  {about.features.map((feature, i) => (
                    <Reveal
                      as="li"
                      key={i}
                      delay={70 + i * 50}
                      className="flex items-start gap-2.5 text-base font-bold"
                    >
                      <span className="mt-[3px] flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                        <Icon name="check" size={11} strokeWidth={3.5} />
                      </span>
                      {feature}
                    </Reveal>
                  ))}
                </ul>
              )}
            </div>

            {about.image && (
              <Reveal delay={100} className="mx-auto w-full max-w-[470px]">
                <CmsImage
                  src={about.image}
                  alt={about.title || 'من نحن'}
                  width={940}
                  height={940}
                  className="aspect-square w-full rounded-[15px] object-cover"
                />
              </Reveal>
            )}
          </div>
        </div>
      </section>

      <section className="bg-ink pb-12">
        <div className="mx-auto w-[95%] max-w-[var(--container-narrow)]">
          <Reveal>
            <h2 className="mb-6 text-3xl font-black">خدماتنا</h2>
          </Reveal>

          {/* Same eight services as everywhere else — one array, four consumers. */}
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service, i) => (
              <Reveal as="li" key={service.slug} delay={(i % 4) * 60}>
                <Link
                  href={`/خدمات/${service.slug}`}
                  className="group flex h-full flex-col rounded-[var(--radius-xl)] border border-line bg-glass p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary"
                >
                  <span className="mb-3 flex size-11 items-center justify-center rounded-full bg-primary text-white transition-transform duration-300 group-hover:scale-110">
                    <Icon name="check" size={20} strokeWidth={2.5} />
                  </span>
                  <h3 className="text-lg font-black">{service.title}</h3>
                  <p className="mt-1.5 text-base leading-relaxed text-fg-muted">
                    {service.tagline}
                  </p>
                </Link>
              </Reveal>
            ))}
          </ul>

          <div className="mt-10 text-center">
            <a
              href={bookingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-[var(--radius-md)] bg-primary px-8 py-3 font-bold text-white transition-colors duration-300 hover:bg-white hover:text-primary"
            >
              {ctaLabel}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
