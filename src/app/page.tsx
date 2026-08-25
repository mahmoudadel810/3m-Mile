import type { Metadata } from 'next';
import { VideoHero } from '@/components/home/VideoHero';
import { HeroGrid } from '@/components/home/HeroGrid';
import { TrustStrip } from '@/components/home/TrustStrip';
import { WhyUs } from '@/components/home/WhyUs';
import { StatsRow } from '@/components/home/StatsRow';
import { ReviewCarousel } from '@/components/home/ReviewCarousel';
import { PartnerStrip } from '@/components/home/PartnerStrip';
import { LatestPosts } from '@/components/home/LatestPosts';
import { WhatsAppForm } from '@/components/forms/WhatsAppForm';
import { Reveal } from '@/components/ui/Reveal';
import { site } from '@/data/site';
import { getHomeContent } from '@/data/home';
import { getHeroSliderServices, getServiceOptions } from '@/data/services';
import { getLatestPosts } from '@/lib/posts';

export const metadata: Metadata = {
  title: '3M مايل Mile | مركز متخصص في حماية السيارات',
  description: site.description,
  alternates: { canonical: '/' },
};

export default async function HomePage() {
  // One await per resource the backend will own. `getHomeContent` is a single document
  // (GET /api/home); the other three are separate collections.
  const [home, sliderServices, serviceOptions, posts] = await Promise.all([
    getHomeContent(),
    getHeroSliderServices(),
    getServiceOptions(),
    getLatestPosts(6),
  ]);
  const { contactBlock } = home;

  return (
    <main id="main">
      {/*
        The visible page opens with the video banner, so the H1 is visually hidden —
        exactly as on the source site (.cs-pro-h1-hidden). It still carries the page's
        primary keyword for search and is the first thing a screen reader announces.
      */}
      <h1 className="sr-only">{site.tagline}</h1>

      <VideoHero hero={home.hero} />
      <HeroGrid services={sliderServices} tiles={home.heroTiles} />
      <TrustStrip trust={home.trust} />
      <WhyUs whyUs={home.whyUs} />
      <StatsRow stats={home.stats} />
      <ReviewCarousel reviews={home.reviews} />
      <PartnerStrip partners={home.partners} />
      <LatestPosts posts={posts} />

      <section className="border-t border-line-soft bg-ink px-4 py-10">
        <div className="mx-auto max-w-[var(--container-narrow)]">
          <Reveal>
            <h2 className="text-2xl font-bold text-primary">{contactBlock.heading}</h2>
            <p className="mt-1 mb-6 text-fg-muted">{contactBlock.subheading}</p>
          </Reveal>
          <Reveal delay={80}>
            <WhatsAppForm serviceOptions={serviceOptions} title={contactBlock.formTitle} />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
