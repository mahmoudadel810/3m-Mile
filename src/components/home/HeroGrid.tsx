'use client';

import { CmsImage } from '@/components/ui/CmsImage';
import Link from 'next/link';
import type { Service } from '@/data/services';
import type { HomeContent } from '@/data/home';
import { useCarousel } from '@/hooks/useCarousel';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { safeHref } from '@/lib/safe';

/**
 * The homepage's signature block: three tiles — branches, work gallery, and a rotating
 * service slider.
 *
 * Layout is the source's, including its deliberate mobile re-composition: three columns
 * on desktop at 400px tall, two columns on mobile at 180px with the slider tile spanning
 * both and growing to 380px. That is intentional mobile design, not a shrink.
 *
 * The slider crossfades every 3s with an 0.8s opacity transition and pauses off-screen.
 *
 * Added: the tiles have no hover state at all on the source site — only the icon circles
 * react. A subtle image scale plus a gradient scrim keeps the red ribbon legible.
 */
export function HeroGrid({
  services: heroSliderServices,
  tiles: heroTiles,
}: {
  services: Service[];
  tiles: HomeContent['heroTiles'];
}) {
  const slider = useCarousel({ count: heroSliderServices.length, autoplay: 3000 });
  /*
    NOT asserted non-null. Services are CMS content now, so an empty list is a real
    state — it is the state a fresh install is in — and `heroSliderServices[0]!` threw
    during prerender, taking the whole build down. The tile keeps its fixed height when
    empty so the grid geometry is identical either way.
  */
  const active = heroSliderServices[slider.index];

  return (
    <div className="mx-auto grid w-[95%] max-w-[var(--container-narrow)] grid-cols-2 gap-x-2 gap-y-2.5 pt-2.5 md:w-full md:grid-cols-3 md:gap-[5px] md:pt-4 lg:pt-5">
      {/* Branches */}
      <Tile href={heroTiles.branches.href} label={heroTiles.branches.label}>
        <CmsImage
          src={heroTiles.branches.image}
          alt={heroTiles.branches.alt}
          fill
          sizes="(max-width: 767px) 50vw, 33vw"
          priority
          className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04] md:object-center"
        />
      </Tile>

      {/* Work gallery — two circular actions over a scrim */}
      <div className="group relative z-[1] block h-[180px] overflow-hidden rounded-[12px] bg-black shadow-[0_4px_10px_rgb(0_0_0/0.2)] md:h-[400px] md:rounded-[8px]">
        <CmsImage
          src={heroTiles.gallery.image}
          alt={heroTiles.gallery.alt}
          fill
          sizes="(max-width: 767px) 50vw, 33vw"
          priority
          className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.04] md:object-center"
        />
        <Ribbon>{heroTiles.gallery.label}</Ribbon>
        <div className="absolute inset-0 z-[5] flex flex-col items-center justify-start gap-5 bg-black/40 pt-14 md:justify-center md:gap-[30px] md:pt-20">
          {heroTiles.gallery.actions.map((a) => (
            <Link
              key={a.href}
              href={safeHref(a.href)}
              aria-label={`معرض ${a.label}`}
              className="flex w-[140px] flex-row items-center justify-start gap-4 text-white no-underline md:w-auto md:flex-col md:gap-0"
            >
              <span className="mb-0 flex size-[35px] items-center justify-center rounded-full border border-white/50 bg-white/15 backdrop-blur-[5px] transition-all duration-300 hover:scale-110 hover:border-primary hover:bg-primary md:mb-2 md:size-[75px]">
                <Icon name={a.icon} size={20} filled className="md:size-10" />
              </span>
              <span className="text-sm font-bold [text-shadow:0_2px_4px_rgb(0_0_0/0.8)]">
                {a.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Service slider — spans both columns on mobile */}
      <div
        ref={slider.containerRef}
        {...slider.swipeHandlers}
        className="group relative col-span-2 h-[380px] overflow-hidden rounded-b-[18px] rounded-t-[12px] bg-black shadow-[0_4px_10px_rgb(0_0_0/0.2)] md:col-span-1 md:h-[400px] md:rounded-[8px]"
      >
        {heroSliderServices.map((s, i) => (
          <Link
            key={s.slug}
            href={`/خدمات/${s.slug}`}
            aria-label={s.title}
            aria-hidden={i !== slider.index}
            tabIndex={i === slider.index ? 0 : -1}
            className={cn(
              'absolute inset-0 block transition-opacity duration-[800ms] ease-in-out',
              i === slider.index
                ? 'z-[2] opacity-100'
                : 'pointer-events-none z-[1] opacity-0'
            )}
          >
            <CmsImage
              src={s.gridImage}
              alt={s.title}
              fill
              sizes="(max-width: 767px) 95vw, 33vw"
              priority={i === 0}
              className="object-cover object-top md:object-center"
            />
          </Link>
        ))}

        <Ribbon>{heroTiles.servicesLabel}</Ribbon>

        {/* Active service name, so the tile reads without waiting for the rotation */}
        {active && (
          <p className="pointer-events-none absolute inset-x-0 top-11 z-[6] text-center text-lg font-black text-white [text-shadow:0_2px_6px_rgb(0_0_0/0.9)] md:top-14 md:text-xl">
            {active.title}
          </p>
        )}

        {/* Arrows and dots are meaningless with nothing to page through. */}
        {heroSliderServices.length > 1 && (
          <>
            <NavButton side="prev" onClick={() => { slider.prev(); slider.resetTimer(); }} />
            <NavButton side="next" onClick={() => { slider.next(); slider.resetTimer(); }} />
          </>
        )}

        <div className="absolute inset-x-0 bottom-[30px] z-[4] flex justify-center gap-[5px]">
          {heroSliderServices.map((s, i) => (
            <button
              key={s.slug}
              type="button"
              aria-label={`اذهب إلى ${s.title}`}
              aria-current={i === slider.index}
              onClick={() => { slider.goTo(i); slider.resetTimer(); }}
              className={cn(
                'size-1.5 rounded-full transition-all duration-300',
                i === slider.index ? 'scale-[1.3] bg-primary' : 'bg-white/50'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Tile({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="group relative z-[1] block h-[180px] overflow-hidden rounded-[12px] bg-black shadow-[0_4px_10px_rgb(0_0_0/0.2)] md:h-[400px] md:rounded-[8px]"
    >
      {children}
      <Ribbon>{label}</Ribbon>
    </Link>
  );
}

/** The red label ribbon sitting at the top of each tile. */
function Ribbon({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute inset-x-0 top-0 z-[6] block bg-primary py-1 text-center text-sm font-black tracking-widest text-white">
      {children}
    </span>
  );
}

function NavButton({ side, onClick }: { side: 'prev' | 'next'; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === 'prev' ? 'الخدمة السابقة' : 'الخدمة التالية'}
      className="absolute top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-[4px] transition-all duration-300 hover:scale-110 hover:border-primary hover:bg-primary md:size-11"
      style={side === 'prev' ? { insetInlineStart: '10px' } : { insetInlineEnd: '10px' }}
    >
      {/* rtl-flip so each arrow points outward: prev sits at the inline-start edge,
          which is the physical right under RTL, and must point right. */}
      <Icon
        name={side === 'prev' ? 'chevronStart' : 'chevronEnd'}
        size={18}
        className="rtl-flip md:size-[22px]"
      />
    </button>
  );
}
