import { getReels, getVideoGalleryIntro } from '@/data/gallery';
import { getHomeSections } from '@/data/home';
import { getSiteSettings } from '@/data/settings';
import { bookingLinkFor } from '@/lib/whatsapp';
import { PageHero } from '@/components/layout/PageHero';
import { ReelCarousel } from '@/components/gallery/ReelCarousel';
import { Reveal } from '@/components/ui/Reveal';

export async function VideoGalleryPage() {
  const [reels, videoGalleryIntro, sections, settings] = await Promise.all([
    getReels(),
    getVideoGalleryIntro(),
    getHomeSections(),
    getSiteSettings(),
  ]);
  const bookingLink = bookingLinkFor(settings.whatsappNumber);

  return (
    <main id="main">
      <PageHero
        title="معرض الفيديو"
        crumbs={[{ label: 'سابقة أعمالنا' }, { label: 'معرض الفيديو' }]}
      />

      <section className="bg-ink py-8">
        <div className="mx-auto w-[95%] max-w-[var(--container-narrow)] text-center">
          <Reveal>
            <h2 className="mb-3 text-3xl font-black md:text-4xl">{videoGalleryIntro.heading}</h2>
            <p className="mx-auto mb-8 max-w-[70ch] text-base leading-loose text-fg-muted">
              {videoGalleryIntro.description}
            </p>
          </Reveal>

          {reels.length > 0 && <ReelCarousel reels={reels} />}

          <Reveal>
            <a
              href={bookingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-block rounded-[var(--radius-md)] bg-primary px-8 py-3 font-bold text-white transition-colors duration-300 hover:bg-white hover:text-primary"
            >
              {sections.ctaLabel || 'احجز الآن'}
            </a>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
