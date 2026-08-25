import Link from 'next/link';
import { getProducts, getProductsByCategory, getProductCategories, type ProductCategory } from '@/lib/products';
import { PageHero } from '@/components/layout/PageHero';
import { ProductCard } from '@/components/shop/ProductCard';
import { Reveal } from '@/components/ui/Reveal';

/**
 * Catalogue index — `/shop/`, and the two `/product-category/{slug}/` archives.
 *
 * Three pieces of store chrome are deliberately absent:
 *  - the sort dropdown and the results counter, which are
 *    meaningless for a fixed set of ten items with no prices to sort by;
 *  - the price line (see ProductCard);
 *  - the cart. Per the client decision this is a catalogue and every product converts
 *    through WhatsApp, so there is no basket, checkout or session to maintain.
 *
 * Added: an H1 and a breadcrumb. The live `/shop/` page renders the grid with no heading
 * of any kind — the document has no H1 at all, which is both an SEO and a screen-reader
 * defect. And a category filter, since the two archives are otherwise unreachable from
 * anywhere in the navigation.
 */
export async function ShopPage({ category }: { category?: ProductCategory }) {
  const [products, categories] = await Promise.all([
    category ? getProductsByCategory(category.slug) : getProducts(),
    getProductCategories(),
  ]);

  const pill =
    'inline-block rounded-[var(--radius-pill)] border px-4 py-1.5 text-sm font-bold transition-colors duration-300';
  const on = `${pill} border-primary bg-primary text-white`;
  const off = `${pill} border-line bg-glass text-fg-muted hover:border-primary hover:text-primary`;

  return (
    <main id="main">
      <PageHero
        title={category ? category.name : 'منتجاتنا'}
        crumbs={
          category
            ? [{ label: 'منتجاتنا', href: '/shop' }, { label: category.name }]
            : [{ label: 'منتجاتنا' }]
        }
      />

      <section className="bg-ink py-8">
        <div className="mx-auto w-[95%] max-w-[var(--container-narrow)]">
          <Reveal>
            <p className="mb-6 max-w-[70ch] text-base leading-loose text-fg-muted">
              {category?.description ||
                'أفلام حماية السيارات PPF وأفلام العزل الحراري الأصلية من 3M، مع ضمان رسمي وتركيب على يد فريق متخصص في جميع فروعنا بالمملكة. اختر المنتج المناسب وتواصل معنا لمعرفة السعر وحجز موعد.'}
            </p>
          </Reveal>

          <Reveal>
            <nav aria-label="تصنيفات المنتجات" className="mb-8">
              <ul className="flex flex-wrap gap-2">
                <li>
                  <Link
                    href="/shop"
                    aria-current={category ? undefined : 'page'}
                    className={category ? off : on}
                  >
                    الكل
                  </Link>
                </li>
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/product-category/${c.slug}`}
                      aria-current={c.slug === category?.slug ? 'page' : undefined}
                      className={c.slug === category?.slug ? on : off}
                    >
                      {c.name}{' '}
                      <bdi className="opacity-70">({c.count})</bdi>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </Reveal>

          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product, i) => (
              <Reveal as="li" key={product.slug} delay={(i % 3) * 60}>
                <ProductCard product={product} priority={i < 3} />
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
