import { getBranches } from '@/data/branches';
import { getServiceOptions } from '@/data/services';
import { getSiteSettings } from '@/data/settings';
import { PageHero } from '@/components/layout/PageHero';
import { BranchPinMap } from '@/components/branches/BranchPinMap';
import { WhatsAppForm } from '@/components/forms/WhatsAppForm';
import { Reveal } from '@/components/ui/Reveal';
import { Icon, type IconName } from '@/components/ui/Icon';

export async function ContactPage() {
  const [branches, serviceOptions, settings] = await Promise.all([
    getBranches(),
    getServiceOptions(),
    getSiteSettings(),
  ]);

  const cards: { icon: IconName; title: string; value: string; href?: string; ltr?: boolean }[] = [
    { icon: 'phone', title: 'الجوال', value: settings.contactPhone, href: `tel:${settings.contactPhone}`, ltr: true },
    { icon: 'mail', title: 'البريد الإلكتروني', value: settings.contactEmail, href: `mailto:${settings.contactEmail}`, ltr: true },
    { icon: 'clock', title: 'مواعيد العمل', value: settings.workingHours },
  ];

  return (
    <main id="main">
      <PageHero title="تواصل معنا" crumbs={[{ label: 'تواصل معنا' }]} />

      <section className="bg-ink py-8">
        <div className="mx-auto w-[95%] max-w-[var(--container-narrow)]">
          <ul className="grid gap-4 sm:grid-cols-3">
            {cards.map((card, i) => (
              <Reveal
                as="li"
                key={card.title}
                delay={i * 60}
                className="flex items-center gap-4 rounded-[var(--radius-xl)] border border-line bg-glass p-5 transition-colors duration-300 hover:border-primary"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                  <Icon name={card.icon} size={22} />
                </span>
                <span>
                  <span className="block text-lg font-black">{card.title}</span>
                  {card.href ? (
                    <a
                      href={card.href}
                      dir={card.ltr ? 'ltr' : undefined}
                      className="mt-0.5 block text-base text-fg-muted transition-colors hover:text-primary"
                    >
                      {card.value}
                    </a>
                  ) : (
                    <span className="mt-0.5 block text-base text-fg-muted">{card.value}</span>
                  )}
                </span>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-ink pb-8">
        <div className="mx-auto w-[95%] max-w-[var(--container-narrow)]">
          <Reveal>
            <h2 className="mb-5 text-3xl font-black">فروعنا على الخريطة</h2>
          </Reveal>
          {/* Same pin map component and branch data as the branches page. */}
          <BranchPinMap branches={branches} />
        </div>
      </section>

      <section className="bg-ink pb-12">
        <div className="mx-auto w-[95%] max-w-[var(--container-narrow)]">
          <Reveal>
            <h2 className="text-3xl font-black">تواصل مع فريقنا</h2>
            <p className="mt-1 mb-6 text-base text-fg-muted">
              لديك استفسار أو تحتاج لمساعدة؟ املأ البيانات وسيقوم فريقنا بالرد عليك فوراً.
            </p>
          </Reveal>
          <Reveal delay={80}>
            <WhatsAppForm
              serviceOptions={serviceOptions}
              submitLabel="إرسال الاستفسار عبر واتساب"
              whatsappNumber={settings.whatsappNumber}
            />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
