import { CmsImage } from '@/components/ui/CmsImage';
import Link from 'next/link';
import { getPosts, getCategories } from '@/lib/posts';
import { getBlogIntro } from '@/data/blog';
import { PageHero } from '@/components/layout/PageHero';
import { PostCard } from '@/components/blog/PostCard';
import { Pagination } from '@/components/blog/Pagination';
import { Reveal } from '@/components/ui/Reveal';

/**
 * Blog index — 201 articles, nine per page across 23 pages, matching the live site's
 * pagination exactly so no indexed URL changes.
 *
 * Added: the category strip. The source publishes eight categories and links to their
 * archives from inside article bodies, but offers no way to reach them from the index —
 * every one of those archives is effectively orphaned.
 */
export async function BlogIndexPage({ page = 1 }: { page?: number }) {
  const [{ items, totalPages }, categories, blogIntro] = await Promise.all([
    getPosts(page),
    getCategories(),
    getBlogIntro(),
  ]);

  return (
    <main id="main">
      <PageHero
        title="المدونة"
        crumbs={page > 1 ? [{ label: 'المدونة', href: '/المدونة' }, { label: `صفحة ${page}` }] : [{ label: 'المدونة' }]}
      />

      <section className="bg-ink py-8">
        <div className="mx-auto w-[95%] max-w-[var(--container-narrow)]">
          {/* The intro banner is page 1 only — on page 5 it is just a wall to scroll past. */}
          {page === 1 && (
            <Reveal>
              <div className="mb-8 grid items-center gap-6 overflow-hidden rounded-[var(--radius-xl)] border border-line bg-glass p-6 md:grid-cols-[1fr_auto] md:gap-10 md:p-8">
                <div>
                  <h2 className="text-2xl leading-tight font-black md:text-3xl">
                    {blogIntro.heading}
                  </h2>
                  <p className="mt-3 max-w-[60ch] text-base leading-loose text-fg-muted">
                    {blogIntro.description}
                  </p>
                </div>
                <CmsImage
                  src={blogIntro.image}
                  alt=""
                  width={410}
                  height={446}
                  priority
                  sizes="(max-width: 767px) 95vw, 410px"
                  className="h-auto w-full rounded-[var(--radius-lg)] object-cover md:w-[320px]"
                />
              </div>
            </Reveal>
          )}

          {page === 1 && categories.length > 0 && (
            <Reveal>
              <nav aria-label="تصنيفات المدونة" className="mb-8">
                <ul className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/category/${c.slug}`}
                        className="inline-block rounded-[var(--radius-pill)] border border-line bg-glass px-4 py-1.5 text-sm font-bold text-fg-muted transition-colors duration-300 hover:border-primary hover:text-primary"
                      >
                        {c.name}{' '}
                        <bdi className="text-fg-dim">({c.count})</bdi>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </Reveal>
          )}

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
            hrefFor={(n) => (n === 1 ? '/المدونة' : `/المدونة/page/${n}`)}
          />
        </div>
      </section>
    </main>
  );
}
