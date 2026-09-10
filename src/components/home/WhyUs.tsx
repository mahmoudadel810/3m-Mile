import { CmsImage } from '@/components/ui/CmsImage';
import type { HomeContent } from '@/data/home';
import { bookingLinkFor } from '@/lib/whatsapp';
import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';

/**
 * Why-us block — heading and checklist beside a framed image.
 *
 * Desktop uses a two-row grid with named areas so the image spans both rows; below
 * 992px it becomes an explicitly ordered column (heading, image, list).
 *
 * The offset red frame that slides on hover is the section's signature detail:
 * ::before moves from -10px to +8px over 0.3s.
 */
export function WhyUs({
  whyUs,
  whatsappNumber,
}: {
  whyUs: HomeContent['whyUs'];
  whatsappNumber: string;
}) {
  return (
    <section data-section="why-us" className="bg-ink px-4 py-4 md:px-5 md:py-10">
      <div className="mx-auto flex max-w-[95%] flex-col gap-5 lg:grid lg:grid-cols-2 lg:items-center lg:gap-y-5 lg:gap-x-[60px] lg:[grid-template-areas:'header_image''list_image']">
        <Reveal className="order-1 w-full text-center lg:text-start lg:[grid-area:header]">
          <h2 className="text-4xl leading-tight font-black">{whyUs.heading}</h2>
        </Reveal>

        {/* Framed image */}
        <Reveal className="group order-2 w-full lg:[grid-area:image]">
          <div className="relative aspect-square w-full max-w-[521px] mx-auto">
            <span
              aria-hidden="true"
              className="absolute -top-1.5 z-0 size-full rounded-[15px] border-2 border-primary opacity-60 transition-[top,inset-inline-start] duration-300 group-hover:top-2 lg:-top-2.5"
              style={{ insetInlineStart: '-0.625rem' }}
            />
            <CmsImage
              src={whyUs.image}
              alt={whyUs.imageAlt}
              width={1042}
              height={1042}
              className="relative z-[1] size-full rounded-[15px] object-cover shadow-[0_0_20px_rgb(227_27_35/0.15)] transition-transform duration-500 group-hover:scale-[1.01]"
            />
          </div>
        </Reveal>

        <div className="order-3 flex w-full flex-col gap-3 text-center lg:text-start lg:[grid-area:list]">
          <Reveal>
            <p className="text-center text-[0.95rem] leading-relaxed font-bold lg:text-start lg:text-base">
              {whyUs.description}
            </p>
          </Reveal>

          {/* Position keys: points are free text and may repeat. */}
          <ul className="grid gap-3 text-start lg:gap-2.5">
            {whyUs.points.map((point, i) => (
              <Reveal as="li" key={i} delay={i * 50} className="flex items-start justify-start gap-2.5 text-[0.95rem] leading-snug font-bold lg:text-base">
                <span className="mt-[3px] flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-[0_0_8px_rgb(227_27_35/0.4)]">
                  <Icon name="check" size={11} strokeWidth={3.5} />
                </span>
                {point}
              </Reveal>
            ))}
          </ul>

          <Reveal className="mt-2.5 self-center lg:self-start">
            <a
              href={bookingLinkFor(whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full max-w-[300px] rounded-[var(--radius-pill)] border-2 border-primary bg-primary px-[35px] py-2.5 text-center font-black text-white shadow-[0_4px_10px_rgb(227_27_35/0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-transparent hover:text-primary hover:shadow-[0_5px_15px_rgb(227_27_35/0.6)] lg:w-auto"
            >
              {whyUs.ctaLabel}
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
