import { CmsImage } from '@/components/ui/CmsImage';
import type { HomeContent } from '@/data/home';

/**
 * Partner logos — dealer and showroom marks.
 *
 * On the source site this is a static row that simply overflows its container. Here it
 * is a true CSS marquee: the track is duplicated and translated, pausing on hover and
 * stopping under reduced motion. No JavaScript and no library.
 */
export function PartnerStrip({ partners }: { partners: HomeContent['partners'] }) {
  return (
    <section className="border-t border-line-soft bg-ink py-5 text-center">
      <h2 className="mb-1.5 text-3xl font-extrabold">شركاء النجاح</h2>
      <p className="mb-6 text-base text-fg-muted">نفخر بثقة شركائنا في مسيرة التميز</p>

      <div className="marquee" aria-label="شعارات شركائنا">
        <div className="marquee-track" data-loop-animation>
          {/* Rendered twice so the loop has no visible seam. The copy is hidden from
              assistive tech so the list is not announced two times. */}
          {[0, 1].map((copy) => (
            <ul key={copy} className="marquee-group" aria-hidden={copy === 1 || undefined}>
              {partners.map((p) => (
                <li
                  key={p.name}
                  className="flex h-[70px] w-[130px] shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-white p-2.5 md:h-[80px] md:w-[150px]"
                >
                  <CmsImage
                    src={p.src}
                    alt={p.name}
                    width={150}
                    height={82}
                    loading="lazy"
                    className="h-auto max-h-full w-auto max-w-full object-contain"
                  />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
