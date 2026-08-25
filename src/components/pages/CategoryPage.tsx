import Link from 'next/link';
import { getPostsByCategory, getCategories, type Category } from '@/lib/posts';
import { PageHero } from '@/components/layout/PageHero';
import { PostCard } from '@/components/blog/PostCard';
import { Pagination } from '@/components/blog/Pagination';
import { Reveal } from '@/components/ui/Reveal';

/**
 * A category archive — `/category/{slug}/`, paginated the same nine-per-page as the index.
 *
 * These archives exist on the live site and are linked from inside article bodies, but
 * nothing in the navigation reaches them. The sibling strip below the heading fixes that
 * without changing any URL.
 */
export async function CategoryPage({ category, page = 1 }: { category: Category; page?: number }) {
  const [{ items, totalPages }, categories] = await Promise.all([
    getPostsByCategory(category.slug, page),
    getCategories(),
  ]);

  return (
    <main id="main">
      <PageHero
        title={category.name}
        crumbs={[
          { label: 'المدونة', href: '/المدونة' },
          ...(page > 1
            ? [{ label: category.name, href: `/category/${category.slug}` }, { label: `صفحة ${page}` }]
            : [{ label: category.name }]),
        ]}
      />

      <section className="bg-ink py-8">
        <div className="mx-auto w-[95%] max-w-[var(--container-narrow)]">
          {category.description && (
            <Reveal>
              <p className="mb-6 max-w-[70ch] text-base leading-loose text-fg-muted">
                {category.description}
              </p>
            </Reveal>
          )}

          <Reveal>
            <nav aria-label="تصنيفات المدونة" className="mb-8">
              <ul className="flex flex-wrap gap-2">
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/category/${c.slug}`}
                      aria-current={c.slug === category.slug ? 'page' : undefined}
                      className={
                        c.slug === category.slug
                          ? 'inline-block rounded-[var(--radius-pill)] border border-primary bg-primary px-4 py-1.5 text-sm font-bold text-white'
                          : 'inline-block rounded-[var(--radius-pill)] border border-line bg-glass px-4 py-1.5 text-sm font-bold text-fg-muted transition-colors duration-300 hover:border-primary hover:text-primary'
                      }
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
            {items.map((post, i) => (
              <Reveal as="li" key={post.slug} delay={(i % 3) * 60}>
                <PostCard post={post} priority={page === 1 && i < 3} />
              </Reveal>
            ))}
          </ul>

          <Pagination
            page={page}
            totalPages={totalPages}
            hrefFor={(n) =>
              n === 1 ? `/category/${category.slug}` : `/category/${category.slug}/page/${n}`
            }
          />
        </div>
      </section>
    </main>
  );
}
