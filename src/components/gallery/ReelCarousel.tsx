'use client';

import { useState } from 'react';
import type { Reel } from '@/data/gallery';
import { useCarousel } from '@/hooks/useCarousel';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

/**
 * Vertical work reels.
 *
 * These are YouTube Shorts. The source loads the full YouTube iframe API up front for
 * all nine slides; here each slide is a facade — the thumbnail plus a play button — and
 * the iframe is only created for the reel the visitor actually starts. That removes
 * YouTube's ~600 KB of script from every visit to this page.
 *
 * Uses the shared carousel hook, so this drops Swiper (~40 KB) from the bundle.
 */
export function ReelCarousel({ reels }: { reels: Reel[] }) {
  const [playing, setPlaying] = useState<string | null>(null);
  const c = useCarousel({ count: reels.length, perView: 1, autoplay: 0, loop: true });

  return (
    <div ref={c.containerRef} className="relative mx-auto max-w-[var(--container-narrow)]">
      <div className="overflow-hidden rounded-[var(--radius-xl)]" {...c.swipeHandlers}>
        <ul
          className="flex transition-transform duration-500 ease-[var(--ease-out-expo)]"
          style={{ transform: c.trackTransform(true) }}
        >
          {reels.map((reel, i) => (
            <li key={reel.id} className="w-full shrink-0 px-2 sm:w-1/2 lg:w-1/3">
              <div className="relative mx-auto aspect-[9/16] w-full max-w-[300px] overflow-hidden rounded-[var(--radius-lg)] bg-surface">
                {playing === reel.id ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${reel.id}?autoplay=1&rel=0&playsinline=1`}
                    title={reel.title}
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 size-full border-0"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setPlaying(reel.id)}
                    aria-label={`تشغيل: ${reel.title}`}
                    tabIndex={i >= c.index && i < c.index + 3 ? 0 : -1}
                    className="group absolute inset-0 size-full"
                  >
                    {/* Thumbnail comes from YouTube's CDN — a plain <img>, since it is
                        an external host and next/image would need a remote pattern. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://img.youtube.com/vi/${reel.id}/hqdefault.jpg`}
                      alt=""
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-[linear-gradient(to_top,rgb(0_0_0/0.9),transparent_55%)]"
                    />
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="flex size-14 items-center justify-center rounded-full border border-white/50 bg-black/50 text-white backdrop-blur-[4px] transition-all duration-300 group-hover:scale-110 group-hover:border-primary group-hover:bg-primary">
                        <Icon name="playCircle" size={28} filled />
                      </span>
                    </span>
                    <span className="absolute inset-x-0 bottom-0 p-4 text-start">
                      <span className="block text-base font-black text-white">{reel.title}</span>
                      <span className="mt-1 block text-sm text-fg-muted">{reel.description}</span>
                    </span>
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <Nav side="prev" onClick={c.prev} />
      <Nav side="next" onClick={c.next} />

      <div className="mt-5 flex justify-center gap-2">
        {reels.map((reel, i) => (
          <button
            key={reel.id}
            type="button"
            aria-label={`الفيديو ${i + 1}`}
            aria-current={i === c.index}
            onClick={() => c.goTo(i)}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              i === c.index ? 'w-5 bg-primary' : 'w-1.5 bg-white/40'
            )}
          />
        ))}
      </div>
    </div>
  );
}

function Nav({ side, onClick }: { side: 'prev' | 'next'; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === 'prev' ? 'السابق' : 'التالي'}
      className="absolute top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white backdrop-blur-[4px] transition-all duration-300 hover:border-primary hover:bg-primary"
      style={side === 'prev' ? { insetInlineStart: '-4px' } : { insetInlineEnd: '-4px' }}
    >
      <Icon name={side === 'prev' ? 'chevronStart' : 'chevronEnd'} size={18} className="rtl-flip" />
    </button>
  );
}
