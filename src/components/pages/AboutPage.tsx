import Link from 'next/link';
import { getServices } from '@/data/services';
import { bookingLink } from '@/lib/whatsapp';
import { PageHero } from '@/components/layout/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { Icon } from '@/components/ui/Icon';

const intro =
  'مراكز 3M مايل المعتمدة، متخصصون في خدمات افلام حماية السيارات PPF، تلميع النانو سيراميك وتظليل العازل الحراري بأعلى جودة ومعايير عالمية. نعتز بكوننا الرواد في استخدام منتجات 3M المتخصصة في العناية بالسيارات حيث نلتزم بتقديم أفضل الخدمات لعملائنا في كل أنحاء المملكة السعودية. بخبرة فريقنا لأكثر من 15 عامًا واحترافيتنا الدائمة، نسعى للحفاظ على قيمة سيارتك حيث نهتم بأدق التفاصيل وأصغرها. باختيارك لخدماتنا لن تقلق بشأن صعوبات الطريق والحصى والسافي أو شمس المملكة الحارقة، سيحافظ دهان سيارتك على لمعته وجماله جديدًا كما هو.';

export async function AboutPage() {
  const services = await getServices();

  return (
    <main id="main">
      <PageHero title="3M مايل" crumbs={[{ label: 'من نحن' }]} />

      <section className="bg-ink py-8">
        <div className="mx-auto w-[95%] max-w-[var(--container-narrow)]">
          <Reveal>
            <p className="text-base leading-loose text-fg-muted">{intro}</p>
          </Reveal>
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
              احجز الآن
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
