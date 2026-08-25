import Image, { type ImageProps } from 'next/image';
import { cn } from '@/lib/cn';

/**
 * The only way CMS-controlled images enter the page.
 *
 * TWO JOBS
 *
 * 1. **Never break on missing content.** The CMS ships empty — every image starts
 *    absent, and an admin can delete one at any time. `<Image src="">` is a runtime
 *    error, so a bare `next/image` would take the whole page down on day one. Here an
 *    absent image renders a neutral placeholder that occupies exactly the same box.
 *
 * 2. **Never let an upload resize the layout.** The container decides the geometry; the
 *    image fills it. That is why this component defaults to `fill` + `object-cover` and
 *    deliberately does NOT accept intrinsic `width`/`height` in fill mode — a 4000px
 *    portrait and a 200px square must both render as the same card. The parent must be
 *    positioned and clip its overflow, which every container in this codebase already
 *    does (`relative … overflow-hidden` with a fixed height or aspect ratio).
 *
 * The placeholder is intentionally quiet: no "broken image" iconography, because on a
 * fresh install a missing image is the expected state, not a fault.
 */

type CmsImageProps = Omit<ImageProps, 'src' | 'alt'> & {
  /** May be empty/null — that is the normal state before an admin uploads. */
  src: string | null | undefined;
  alt: string;
  /** Overrides the default `object-cover`, for logos that must not be cropped. */
  fit?: 'cover' | 'contain';
};

export function CmsImage({ src, alt, fit = 'cover', className, fill, ...rest }: CmsImageProps) {
  // Infer the mode so call sites read the same as they did with next/image: passing
  // width+height means intrinsic sizing, passing neither means fill.
  const isFill = fill ?? !(rest.width && rest.height);

  if (!src) {
    const { width, height } = rest;

    // Two placeholder shapes, matching the two ways next/image is used here.
    // `fill` fills its positioned parent; the intrinsic form reserves the SAME aspect
    // box the real image would have occupied, so a missing image shifts nothing.
    return (
      <div
        // aria-hidden: a missing decorative image should not announce an empty name to
        // a screen reader. The surrounding card still carries its own text.
        aria-hidden
        style={
          isFill || !width || !height
            ? undefined
            : { aspectRatio: `${String(width)} / ${String(height)}` }
        }
        className={cn(
          'bg-gradient-to-br from-line-soft/40 to-line/20',
          isFill ? 'absolute inset-0 h-full w-full' : 'w-full',
          className,
        )}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={isFill}
      className={cn(fit === 'cover' ? 'object-cover' : 'object-contain', className)}
      {...rest}
    />
  );
}
