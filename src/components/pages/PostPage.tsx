import Image from 'next/image';
import Link from 'next/link';
import type { Post, PostSummary, Category } from '@/lib/posts';
import { formatPostDate } from '@/lib/format';
import { site } from '@/data/site';
import { PageHero } from '@/components/layout/PageHero';
import { PostCard } from '@/components/blog/PostCard';
import { Reveal } from '@/components/ui/Reveal';
import { jsonLdHtml } from '@/lib/safe';

/**
 * A single article.
 *
 * The body is the HTML the admin wrote, sanitised server-side by the CMS and injected
 * verbatim. It is styled by the `.post-body` rules in globals.css, so every article
 * inherits the design system rather than carrying its own styles.
 *
 * There is no comment form: the API exposes no comments endpoint, so the control would
 * have nowhere to post to.
 *
 * Emits Article structured data.
 */
export function PostPage({
  post,
  related,
  categories,
}: {
  post: Post;
  related: PostSummary[];
  categories: Category[];
}) {
  const primary = categories.find((c) => c.slug === post.categories[0]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    image: post.featured ? `${site.url}${post.featured.url}` : undefined,
    mainEntityOfPage: `${site.url}/${post.slug}`,
    author: { '@type': 'Organization', name: site.nameFull },
    // No publisher logo: the artwork is CMS-managed and `logo` is optional in schema.org.
    publisher: {
      '@type': 'Organization',
      name: site.nameFull,
    },
  };

  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(jsonLd) }}
      />

      <PageHero
        title={post.title}
        crumbs={[
          { label: 'المدونة', href: '/المدونة' },
          ...(primary ? [{ label: primary.name, href: `/category/${primary.slug}` }] : []),
          { label: post.title },
        ]}
      />

      <article className="bg-ink py-8">
        <div className="mx-auto w-[95%] max-w-[var(--container-narrow)]">
          <div className="mb-6 flex flex-wrap items-center gap-3 text-sm font-semibold text-fg-dim">
            <time dateTime={post.date}>{formatPostDate(post.date)}</time>
            {post.categories.map((slug) => {
              const c = categories.find((x) => x.slug === slug);
              return c ? (
                <Link
                  key={slug}
                  href={`/category/${slug}`}
                  className="rounded-[var(--radius-pill)] border border-line px-3 py-1 transition-colors hover:border-primary hover:text-primary"
                >
                  {c.name}
                </Link>
              ) : null;
            })}
          </div>

          {post.featured && (
            // `max-w-full`, not `w-full`: never upscale the cover past its own pixels.
            <Image
              src={post.featured.url}
              alt={post.featured.alt || post.title}
              width={post.featured.width ?? 1000}
              height={post.featured.height ?? 750}
              priority
              sizes="(max-width: 1100px) 95vw, 1100px"
              className="mx-auto mb-8 block h-auto max-w-full rounded-[var(--radius-xl)]"
            />
          )}

          <div
            className="post-body"
            dangerouslySetInnerHTML={{ __html: post.contentHTML }}
          />
        </div>
      </article>

      {related.length > 0 && (
        <section className="bg-ink pb-12">
          <div className="mx-auto w-[95%] max-w-[var(--container-narrow)]">
            <Reveal>
              <h2 className="mb-5 rounded-[var(--radius-md)] bg-primary px-5 py-2.5 text-lg font-black text-white">
                مقالات ذات صلة
              </h2>
            </Reveal>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r, i) => (
                <Reveal as="li" key={r.slug} delay={(i % 3) * 60}>
                  <PostCard post={r} />
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}
