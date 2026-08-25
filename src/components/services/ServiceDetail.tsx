import { CmsImage } from '@/components/ui/CmsImage';
import type { Service } from '@/data/services';
import type { ServiceContent } from '@/data/service-content';
import { waLink } from '@/lib/whatsapp';
import { Reveal } from '@/components/ui/Reveal';
import { Icon } from '@/components/ui/Icon';

/**
 * One template for all eight service pages.
 *
 * The source renders these as eight separate Elementor documents with identical widget
 * layouts, which is why their wording has already drifted apart. Layout lives here;
 * everything that differs lives in data/services.ts and data/service-content.ts.
 *
 * Structure follows the original exactly:
 *   intro: copy + two credibility points beside a square hero, then a red CTA
 *   centred benefits headline
 *   three benefit blocks with icon and rule, beside a three-image collage, then a CTA
 */
export function ServiceDetail({
  service,
  content,
}: {
  service: Service;
  content: ServiceContent;
}) {
  return (
    <>
      {/* Intro */}
      <section className="bg-ink py-10">
        <div className="mx-auto grid w-[95%] max-w-[var(--container-narrow)] gap-8 lg:grid-cols-2 lg:items-start lg:gap-12">
          <Reveal className="order-2 lg:order-1">
            <CmsImage
              src={service.heroImage}
              alt={service.heading}
              width={720}
              height={720}
              priority
              sizes="(max-width: 991px) 95vw, 45vw"
              className="h-auto w-full rounded-[var(--radius-lg)] object-cover"
            />
          </Reveal>

          <div className="order-1 lg:order-2">
            <Reveal>
              <h2 className="mb-4 text-2xl leading-snug font-black text-primary md:text-3xl">
                {content.introHeading}
              </h2>
              <p className="text-base leading-loose text-fg-muted">{content.introBody}</p>
            </Reveal>

            <div className="mt-7 grid gap-6">
              {content.introPoints.map((point, i) => (
                <Reveal key={point.title} delay={i * 70}>
                  <h3 className="mb-2 flex items-start gap-2.5 text-lg leading-snug font-bold text-primary md:text-xl">
                    <span
                      aria-hidden="true"
                      className="mt-2 size-3 shrink-0 rounded-[2px] bg-primary"
                    />
                    {point.title}
                  </h3>
                  <p className="ps-[22px] text-base leading-loose text-fg-muted">{point.body}</p>
                </Reveal>
              ))}
            </div>

            <Reveal delay={140}>
              <a
                href={waLink(service.enquiry)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-block rounded-[var(--radius-md)] bg-primary px-7 py-3 font-bold text-white transition-colors duration-300 hover:bg-white hover:text-primary"
              >
                {content.primaryCta}
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-ink pb-12">
        <Reveal>
          <h2 className="mx-auto mb-8 w-[95%] max-w-[var(--container-narrow)] text-center text-3xl font-black md:text-4xl">
            {content.benefitsHeading}
          </h2>
        </Reveal>

        <div className="mx-auto grid w-[95%] max-w-[var(--container-narrow)] gap-8 lg:grid-cols-2 lg:items-center lg:gap-12">
          {/* Collage — one tall image beside two stacked */}
          <Reveal className="order-2 grid grid-cols-2 grid-rows-2 gap-3 lg:order-1">
            <CmsImage
              src={service.collage[0]}
              alt=""
              width={640}
              height={640}
              loading="lazy"
              sizes="(max-width: 991px) 47vw, 22vw"
              className="col-span-2 h-full w-full rounded-[var(--radius-lg)] object-cover"
            />
            <CmsImage
              src={service.collage[1]}
              alt=""
              width={480}
              height={480}
              loading="lazy"
              sizes="(max-width: 991px) 47vw, 22vw"
              className="h-full w-full rounded-[var(--radius-lg)] object-cover"
            />
            <CmsImage
              src={service.collage[2]}
              alt=""
              width={480}
              height={480}
              loading="lazy"
              sizes="(max-width: 991px) 47vw, 22vw"
              className="h-full w-full rounded-[var(--radius-lg)] object-cover"
            />
          </Reveal>

          <div className="order-1 lg:order-2">
            {content.benefits.map((benefit, i) => (
              <Reveal
                key={benefit.title}
                delay={i * 70}
                className="border-b border-line-soft py-5 last:border-b-0"
              >
                <div className="flex items-start gap-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
                    <Icon name="check" size={20} strokeWidth={2.5} />
                  </span>
                  <div>
                    <h3 className="mb-1.5 text-lg leading-snug font-bold text-primary md:text-xl">
                      {benefit.title}
                    </h3>
                    <p className="text-base leading-loose text-fg-muted">{benefit.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}

            <Reveal delay={210}>
              <a
                href={waLink(service.enquiry)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-block rounded-[var(--radius-md)] bg-primary px-7 py-3 font-bold text-white transition-colors duration-300 hover:bg-white hover:text-primary"
              >
                {content.secondaryCta}
              </a>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
