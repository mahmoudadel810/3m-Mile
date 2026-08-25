'use client';

import { useRef, useEffect, useState } from 'react';
import type { HomeContent } from '@/data/home';
import { waLink } from '@/lib/whatsapp';
import { Icon } from '@/components/ui/Icon';

/**
 * Homepage video banner.
 *
 * Geometry is the source's: max-width 1100px, 500px tall (520 at 1024–1440, 380 on
 * tablet, 155 on mobile), 10px radius, with a red CTA pinned to the lower inline-end
 * corner.
 *
 * Two fixes over the original:
 *  - the poster is regenerated from the video's own first frame, because the file the
 *    source preloads returns HTTP 410;
 *  - the video is a decorative autoplaying loop with no control of any kind, so a pause
 *    toggle is added and playback stops outright under reduced motion.
 */
export function VideoHero({ hero }: { hero: HomeContent['hero'] }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      v.pause();
      setPaused(true);
    }
  }, []);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
      setPaused(false);
    } else {
      v.pause();
      setPaused(true);
    }
  };

  return (
    <section className="px-2 pt-2 md:px-0 md:pt-0">
      <div className="relative mx-auto h-[155px] w-full max-w-[var(--container-narrow)] overflow-hidden rounded-[12px] md:h-[380px] md:rounded-[10px] lg:h-[500px]">
        <video
          ref={videoRef}
          className="size-full object-cover"
          poster={hero.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-label="فيديو ترويجي لأعمال مايل"
        >
          <source src={hero.video} type="video/webm" />
        </video>

        <a
          href={waLink(hero.ctaText)}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-2.5 z-10 inline-block rounded-[20px] bg-primary px-2.5 py-1 text-[10px] font-semibold text-white transition-colors duration-300 hover:bg-white hover:text-primary md:bottom-[30px] md:rounded-[8px] md:px-[26px] md:py-3 md:text-xl lg:bottom-[75px] lg:px-[30px] lg:py-3.5 lg:text-[23px]"
          style={{ insetInlineEnd: '5%' }}
        >
          {hero.ctaLabel}
        </a>

        <button
          type="button"
          onClick={toggle}
          aria-label={paused ? 'تشغيل الفيديو' : 'إيقاف الفيديو'}
          className="absolute bottom-2 z-10 flex size-8 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white opacity-70 backdrop-blur-[4px] transition-opacity hover:opacity-100 md:bottom-4 md:size-10"
          style={{ insetInlineStart: '1rem' }}
        >
          <Icon name={paused ? 'playCircle' : 'close'} size={16} filled={paused} />
        </button>
      </div>
    </section>
  );
}
