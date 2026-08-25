'use client';

import { CmsImage } from '@/components/ui/CmsImage';
import type { HomeContent } from '@/data/home';
import { site } from '@/data/site';
import { useCarousel } from '@/hooks/useCarousel';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

/**
 * Google review carousel — 3.5s autoplay, swipeable, two cards per view above 768px.
 *
 * These are screenshots of the Google review UI, so there is no review text to mark up —
 * the alt text can only describe what each image is. An accepted trade-off.
 */
export function ReviewCarousel({ reviews }: { reviews: HomeContent['reviews'] }) {
  const perView = 2;
  const c = useCarousel({ count: reviews.images.length, perView, autoplay: 3500 });

  return (
    <section className="border-t border-line-soft bg-ink px-5 py-5 text-center">
      <div className="mb-8">
        <h2 className="mb-2.5 text-4xl leading-tight font-black">{reviews.heading}</h2>

        <p className="mb-[5px] inline-flex items-center gap-2.5 rounded-[var(--radius-pill)] border border-line bg-white/5 px-5 py-2">
          <span className="text-[1.3rem] font-black">{site.stats.rating}</span>
          <span className="tracking-[2px] text-star" aria-hidden="true">
            ★★★★★
          </span>
          <span className="border-e border-[#444] pe-2.5 me-2.5 text-[0.85rem] text-fg-muted">
            أكثر من {site.stats.reviewCount} تقييم
          </span>
        </p>

        <p className="mx-auto mt-4 max-w-[var(--container-narrow)] text-base leading-relaxed text-fg-muted">
          {reviews.description}
        </p>
      </div>

      <div ref={c.containerRef} className="relative mx-auto max-w-[var(--container)]">
        <div
          className="overflow-hidden rounded-[var(--radius-2xl)] border border-line-soft bg-[linear-gradient(180deg,#141414_0%,#000_100%)] shadow-[var(--shadow-deep)]"
          {...c.swipeHandlers}
        >
          <div
            className="flex transition-transform duration-500 ease-[var(--ease-out-expo)]"
            style={{ transform: c.trackTransform(true) }}
          >
            {reviews.images.map((img, i) => (
              <div
                key={img.src}
                className="flex h-[380px] w-full shrink-0 items-center justify-center p-4 select-none md:h-[500px] md:w-1/2 md:p-6"
                aria-hidden={i < c.index || i >= c.index + perView}
              >
                <CmsImage
                  src={img.src}
                  alt={img.alt}
                  width={340}
                  height={347}
                  loading="lazy"
                  className="max-h-full w-auto max-w-[340px] rounded-[var(--radius-lg)] object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        <Nav side="prev" onClick={() => { c.prev(); c.resetTimer(); }} />
        <Nav side="next" onClick={() => { c.next(); c.resetTimer(); }} />

        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: c.maxIndex + 1 }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`المجموعة ${i + 1}`}
              aria-current={i === c.index}
              onClick={() => { c.goTo(i); c.resetTimer(); }}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === c.index ? 'w-5 bg-primary' : 'w-1.5 bg-white/40'
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function Nav({ side, onClick }: { side: 'prev' | 'next'; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === 'prev' ? 'التقييمات السابقة' : 'التقييمات التالية'}
      className="absolute top-1/2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white shadow-[var(--shadow-card)] transition-transform duration-300 hover:scale-110"
      style={side === 'prev' ? { insetInlineStart: '-8px' } : { insetInlineEnd: '-8px' }}
    >
      <Icon name={side === 'prev' ? 'chevronStart' : 'chevronEnd'} size={20} className="rtl-flip" />
    </button>
  );
}
