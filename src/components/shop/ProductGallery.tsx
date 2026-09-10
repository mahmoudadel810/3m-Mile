'use client';

import { useState } from 'react';
import { CmsImage } from '@/components/ui/CmsImage';
import type { ProductImage } from '@/lib/products';
import { cn } from '@/lib/cn';

/**
 * Product image viewer: one large image with thumbnails beneath it.
 *
 * A plain state swap rather than a gallery library. PhotoSwipe and friends pull in
 * ~40 kB of JavaScript to show two images and a zoom overlay, which two images do not
 * justify. The thumbnails are real <button>s, so they are keyboard-reachable.
 */
export function ProductGallery({ images, title }: { images: ProductImage[]; title: string }) {
  const [active, setActive] = useState(0);
  const current = images[active];
  if (!current) return null;

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-xl)] border border-line">
        <CmsImage
          key={current.url}
          src={current.url}
          alt={`${title} — صورة ${active + 1}`}
          fill
          sizes="(max-width: 991px) 95vw, 550px"
          priority
          className="object-cover"
        />
      </div>

      {images.length > 1 && (
        <ul className="mt-3 flex flex-wrap gap-2.5">
          {images.map((img, i) => (
            <li key={img.url}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`عرض صورة ${i + 1} من ${images.length}`}
                aria-current={i === active ? 'true' : undefined}
                className={cn(
                  'relative block size-[70px] overflow-hidden rounded-[var(--radius-md)] border-2 transition-colors duration-300',
                  i === active ? 'border-primary' : 'border-line hover:border-fg-dim'
                )}
              >
                <CmsImage src={img.url} alt="" fill sizes="70px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
