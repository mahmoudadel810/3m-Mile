import { CmsImage } from '@/components/ui/CmsImage';
import type { HomeContent } from '@/data/home';

/**
 * Partner logos — dealer and showroom marks.
 *
 * A CSS marquee matching the source's `.sp-slider-track`: card and gap geometry, travel
 * speed, hover pause. No JavaScript and no library, and it stops under reduced motion
 * (`data-loop-animation`, see `globals.css`).
 *
 * The marquee only makes sense once there is enough content to loop — with fewer than
 * six logos the duplicated track would just repeat the same handful of logos with an
 * obvious seam, so a short list renders as a plain centred row instead.
 */

/** Desktop card width plus gap; used only to size and time the loop. */
const PER_LOGO_PX = 180;

/** One group must be wider than the strip (capped at 1100px) or the loop shows a gap. */
const MIN_GROUP_PX = 1400;

/** The source's speed: 19 logos (~3400px) in 40s. */
const SPEED_PX_PER_SEC = 85;

export function PartnerStrip({
  partners,
  heading,
  sub,
}: {
  partners: HomeContent['partners'];
  heading?: string;
  sub?: string;
}) {
  if (!partners.length) return null;

  // Card geometry is the source's `.sp-card`: 130x100 on mobile, 160x120 from md up.
  const boxClassName =
    'group flex h-[100px] w-[130px] shrink-0 items-center justify-center rounded-[20px] border border-[#333] bg-white p-[15px] shadow-[0_5px_15px_rgb(0_0_0/0.3)] transition-all duration-300 hover:-translate-y-[5px] hover:border-primary/50 hover:shadow-[0_10px_30px_rgb(227_27_35/0.5)] md:h-[120px] md:w-[160px]';

  const logo = (p: HomeContent['partners'][number]) => (
    <CmsImage
      src={p.src}
      alt={p.name}
      width={256}
      height={170}
      loading="lazy"
      // `fit`, not a className: `cn` has no tailwind-merge, so `object-cover` would win.
      fit="contain"
      className="size-full transition-transform duration-300 group-hover:scale-110"
    />
  );

  // Repeat the list until a group clears MIN_GROUP_PX, then time the loop from its width.
  const repeats = Math.max(1, Math.ceil(MIN_GROUP_PX / (partners.length * PER_LOGO_PX)));
  const groupLogos = Array.from({ length: repeats }, () => partners).flat();
  const duration = `${((groupLogos.length * PER_LOGO_PX) / SPEED_PX_PER_SEC).toFixed(1)}s`;

  return (
    <section className="border-t border-line-soft bg-ink py-5 text-center">
      <h2 className="mb-2.5 inline-block text-[32px] font-extrabold after:mx-auto after:mt-2.5 after:block after:h-1 after:w-[60px] after:rounded-[2px] after:bg-primary after:content-['']">
        {heading || 'شركاء النجاح'}
      </h2>
      <p className="mb-6 text-base text-fg-muted">{sub || 'نفخر بثقة شركائنا في مسيرة التميز'}</p>

      {partners.length >= 6 ? (
        <div
          className="marquee mx-auto w-full max-w-[var(--container-narrow)]"
          aria-label="شعارات شركائنا"
          style={{ '--marquee-duration': duration } as React.CSSProperties}
        >
          <div className="marquee-track" data-loop-animation>
            {/* Two copies for a seamless loop; the second is hidden from assistive tech. */}
            {[0, 1].map((copy) => (
              <ul key={copy} className="marquee-group" aria-hidden={copy === 1 || undefined}>
                {/* Position keys: the list repeats the same partners. */}
                {groupLogos.map((p, i) => (
                  <li key={i} className={boxClassName}>
                    {logo(p)}
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      ) : (
        <ul className="flex flex-wrap items-center justify-center gap-4" aria-label="شعارات شركائنا">
          {partners.map((p) => (
            <li key={p.name} className={boxClassName}>
              {logo(p)}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
