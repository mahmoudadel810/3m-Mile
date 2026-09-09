import { CmsImage } from '@/components/ui/CmsImage';
import Link from 'next/link';
import { getPhotos } from '@/data/gallery';
import { getHomeSections } from '@/data/home';
import { getPageCopy, getSiteSettings } from '@/data/settings';
import { bookingLinkFor } from '@/lib/whatsapp';
import { PageHero } from '@/components/layout/PageHero';
import { Reveal } from '@/components/ui/Reveal';
import { Icon } from '@/components/ui/Icon';
import { safeHref } from '@/lib/safe';

/**
 * Photo gallery.
 *
 * Verified against the live site: there is no lightbox here. Each image links to a
 * related service page — it is an internal-linking device rather than a viewer. The
 * behaviour is preserved, but the affordance is made explicit with a hover label, since
 * the source gives no hint that clicking navigates away.
 */
export async function PhotoGalleryPage() {
  const [photos, sections, pageCopy, settings] = await Promise.all([
    getPhotos(),
    getHomeSections(),
    getPageCopy(),
    getSiteSettings(),
  ]);
  // Page-specific copy wins over the site-wide label, which wins over the literal.
  const ctaLabel = pageCopy.photoGalleryCta || sections.ctaLabel || 'احجز الآن';
  const bookingLink = bookingLinkFor(settings.whatsappNumber);

  return (
    <main id="main">
      <PageHero
        title="معرض الصور"
        crumbs={[{ label: 'سابقة أعمالنا' }, { label: 'معرض الصور' }]}
      />

      <section className="bg-ink py-8">
        <div className="mx-auto w-[95%] max-w-[var(--container-narrow)]">
          {photos.length > 0 && (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {photos.map((photo, i) => (
                <Reveal as="li" key={photo.src} delay={(i % 3) * 60}>
                  <Link
                    href={safeHref(photo.href)}
                    className="group relative block aspect-square overflow-hidden rounded-[var(--radius-xl)] border border-line transition-colors duration-300 hover:border-primary"
                  >
                    <CmsImage
                      src={photo.src}
                      alt={photo.alt}
                      fill
                      sizes="(max-width: 639px) 95vw, (max-width: 991px) 47vw, 33vw"
                      loading={i < 3 ? 'eager' : 'lazy'}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-[linear-gradient(to_top,rgb(0_0_0/0.85),transparent_60%)]"
                    />
                    <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-4">
                      <span className="text-base font-bold text-white">{photo.alt}</span>
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <Icon name="chevronEnd" size={16} className="rtl-flip" />
                      </span>
                    </span>
                  </Link>
                </Reveal>
              ))}
            </ul>
          )}

          <div className="mt-10 text-center">
            <a
              href={bookingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-[var(--radius-md)] bg-primary px-8 py-3 font-bold text-white transition-colors duration-300 hover:bg-white hover:text-primary"
            >
              {ctaLabel}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
