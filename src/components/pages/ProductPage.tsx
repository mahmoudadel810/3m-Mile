import Link from 'next/link';
import type { Product, ProductSummary, ProductCategory } from '@/lib/products';
import { site } from '@/data/site';
import { waLink } from '@/lib/whatsapp';
import { PageHero } from '@/components/layout/PageHero';
import { ProductGallery } from '@/components/shop/ProductGallery';
import { ProductCard } from '@/components/shop/ProductCard';
import { Reveal } from '@/components/ui/Reveal';
import { Icon, BrandIcon } from '@/components/ui/Icon';

/**
 * A single catalogue entry.
 *
 * DELIBERATELY DROPPED, all store chrome with nothing behind it:
 *  - the zero price (see ShopPage);
 *  - the add-to-cart control — there is no cart by client decision;
 *  - the extra-information tab, which renders attributes no product has;
 *  - the reviews tab and its form, which has no endpoint to post to.
 *
 * What is left — gallery, summary, spec list, description — is the whole of the real
 * content, so the three empty tabs become one linear page instead.
 */
export function ProductPage({
  product,
  related,
  categories,
}: {
  product: Product;
  related: ProductSummary[];
  categories: ProductCategory[];
}) {
  const category = categories.find((c) => c.slug === product.categories[0]);

  const enquiry = waLink(`مرحباً، أرغب بالاستفسار عن ${product.title}`);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.excerpt,
    image: product.gallery.map((g) => `${site.url}${g.url}`),
    brand: { '@type': 'Brand', name: '3M' },
    category: category?.name,
    // No `offers` block: the catalogue publishes no price, and emitting a zero-priced
    // offer would be a false statement to a rich-result parser.
  };

  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHero
        title={product.title}
        crumbs={[
          { label: 'منتجاتنا', href: '/shop' },
          ...(category
            ? [{ label: category.name, href: `/product-category/${category.slug}` }]
            : []),
          { label: product.title },
        ]}
      />

      <section className="bg-ink py-8">
        <div className="mx-auto grid w-[95%] max-w-[var(--container-narrow)] gap-8 lg:grid-cols-2 lg:items-start lg:gap-12">
          <Reveal>
            <ProductGallery images={product.gallery} title={product.title} />
          </Reveal>

          <Reveal delay={80}>
            <div>
              {product.shortDescriptionHTML ? (
                <div
                  className="post-body"
                  dangerouslySetInnerHTML={{ __html: product.shortDescriptionHTML }}
                />
              ) : (
                <p className="text-base leading-loose text-fg-muted">{product.excerpt}</p>
              )}

              <a
                href={enquiry}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center gap-2.5 rounded-[var(--radius-md)] bg-[#25d366] px-7 py-3.5 text-lg font-black text-white transition-transform duration-300 hover:-translate-y-0.5 sm:w-auto"
              >
                <BrandIcon name="whatsapp" size={22} />
                احصل على عرض السعر الآن
              </a>

              <ul className="mt-6 flex flex-col gap-2 border-t border-line pt-5 text-base text-fg-muted">
                <li className="flex items-center gap-2">
                  <Icon name="check" size={15} className="text-primary" strokeWidth={3} />
                  السعر شامل الضريبة
                </li>
                <li className="flex items-center gap-2">
                  <Icon name="check" size={15} className="text-primary" strokeWidth={3} />
                  يمكنك التقسيط مع تابي و تمارا
                </li>
                {category && (
                  <li className="flex items-center gap-2">
                    <Icon name="check" size={15} className="text-primary" strokeWidth={3} />
                    <span>
                      الفئة:{' '}
                      <Link
                        href={`/product-category/${category.slug}`}
                        className="font-bold text-primary transition-colors hover:text-white"
                      >
                        {category.name}
                      </Link>
                    </span>
                  </li>
                )}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-ink pb-10">
        <div className="mx-auto w-[95%] max-w-[var(--container-narrow)]">
          <Reveal>
            <h2 className="mb-5 rounded-[var(--radius-md)] bg-primary px-5 py-2.5 text-lg font-black text-white">
              الوصف
            </h2>
          </Reveal>
          <div className="post-body" dangerouslySetInnerHTML={{ __html: product.contentHTML }} />
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-ink pb-12">
          <div className="mx-auto w-[95%] max-w-[var(--container-narrow)]">
            <Reveal>
              <h2 className="mb-5 text-2xl font-black">منتجات ذات صلة</h2>
            </Reveal>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r, i) => (
                <Reveal as="li" key={r.slug} delay={(i % 3) * 60}>
                  <ProductCard product={r} />
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}
