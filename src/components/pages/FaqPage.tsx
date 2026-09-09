import { getFaq } from '@/data/faq';
import { PageHero } from '@/components/layout/PageHero';
import { Accordion } from '@/components/ui/Accordion';
import { Reveal } from '@/components/ui/Reveal';
import { jsonLdHtml } from '@/lib/safe';

/**
 * FAQ. The answers are rendered into the HTML and also emitted as FAQPage structured
 * data — the source has the same ten questions but publishes no schema for them, so
 * they cannot win a rich result today.
 */
export async function FaqPage() {
  const faq = await getFaq();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }}
      />

      <PageHero title="الأسئلة الشائعة" crumbs={[{ label: 'الأسئلة الشائعة' }]} />

      <section className="bg-ink py-8">
        <div className="mx-auto w-[95%] max-w-[var(--container-narrow)]">
          <Reveal>
            <Accordion items={faq} />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
