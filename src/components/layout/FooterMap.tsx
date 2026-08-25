'use client';

import { useState } from 'react';
import { site } from '@/data/site';
import { Icon } from '@/components/ui/Icon';

/**
 * Google MyMaps card with all 12 branches.
 *
 * The source embeds this iframe on every page load — a third-party frame plus its
 * scripts, on every route, mostly below the fold. Here it is a facade: a static panel
 * that only mounts the iframe once the visitor asks for it.
 *
 * The source's two visual hacks are kept because they are deliberate design: the map is
 * colour-inverted to sit on a black page, and pulled up 60px to crop Google's grey
 * header strip.
 */
export function FooterMap() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative h-[160px] w-full max-w-[500px] overflow-hidden rounded-[var(--radius-lg)] border border-[#333] shadow-[var(--shadow-card)] transition-colors duration-300 hover:border-primary md:h-[140px] md:max-w-none">
      {loaded ? (
        <iframe
          src={site.mapsEmbedUrl}
          title="خريطة فروع مايل"
          loading="lazy"
          className="absolute block w-full border-0 [filter:invert(90%)_hue-rotate(180deg)_contrast(90%)]"
          style={{ height: 'calc(100% + 60px)', top: '-60px' }}
        />
      ) : (
        <button
          type="button"
          onClick={() => setLoaded(true)}
          className="group absolute inset-0 flex w-full items-center justify-center bg-surface-2"
          aria-label="عرض خريطة الفروع"
        >
          <span className="flex flex-col items-center gap-2 text-fg-muted transition-colors group-hover:text-white">
            <Icon name="mapMarked" size={28} />
            <span className="text-sm font-semibold">اعرض الخريطة</span>
          </span>
        </button>
      )}

      <a
        href={site.mapsViewerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-4 z-20 flex items-center gap-1.5 rounded-[var(--radius-md)] bg-[#d71921] px-4 py-2 text-[13px] font-bold text-white shadow-[0_4px_10px_rgb(0_0_0/0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:text-[#d71921]"
        style={{ insetInlineEnd: '1rem' }}
      >
        <Icon name="mapMarked" size={14} />
        عرض كل الفروع
      </a>
    </div>
  );
}
