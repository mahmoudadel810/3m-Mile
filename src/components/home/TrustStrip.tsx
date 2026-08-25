import { CmsImage } from '@/components/ui/CmsImage';
import type { HomeContent } from '@/data/home';
import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';

/**
 * Three trust badges.
 *
 * Changes form rather than shrinking on mobile: glass cards with side-by-side icon and
 * text on desktop, borderless stacked columns divided by hairlines below 768px. That is
 * the source's own responsive design and it is preserved.
 *
 * One fix: the source pins these to `white-space: nowrap` at 0.7rem, which is one long
 * Arabic word away from overflowing. Balanced wrapping is used instead.
 */
export function TrustStrip({ trust }: { trust: HomeContent['trust'] }) {
  return (
    <section className="bg-ink px-4 py-2.5 md:px-0">
      <div className="mx-auto grid w-full max-w-[var(--container-narrow)] grid-cols-3 gap-[5px] md:w-[95%] md:gap-[15px]">
        {trust.map((item, i) => (
          <Reveal
            key={item.head}
            delay={i * 60}
            className="group flex flex-col items-center justify-center gap-2 border-s border-line-soft px-0.5 py-2.5 text-center last:border-s-0 md:flex-row md:gap-[15px] md:rounded-[var(--radius-xl)] md:border md:border-line md:bg-glass md:p-5 md:text-end md:transition-all md:duration-300 md:hover:-translate-y-[3px] md:hover:border-primary md:hover:bg-primary/5"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary shadow-[var(--ring-primary,0_0_0_4px_rgb(227_27_35/0.2))] transition-transform duration-300 md:size-[55px] md:group-hover:scale-110 md:group-hover:rotate-[5deg]">
              {item.image ? (
                <CmsImage
                  src={item.image}
                  alt=""
                  width={40}
                  height={40}
                  className="size-5 object-contain brightness-0 invert md:size-10"
                />
              ) : (
                <Icon name="check" size={20} strokeWidth={3} className="text-white md:size-6" />
              )}
            </span>

            <span className="w-full text-center md:w-auto md:text-end">
              <span className="block text-[0.85rem] leading-tight font-black text-balance md:text-[1.2rem]">
                {item.head}
              </span>
              <span className="mt-0.5 block text-[0.7rem] font-semibold text-fg-muted md:mt-[5px] md:text-[0.9rem]">
                {item.sub}
              </span>
            </span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
