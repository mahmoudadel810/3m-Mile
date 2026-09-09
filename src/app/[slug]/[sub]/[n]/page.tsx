import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { findTopRoute, decodeSlug } from '@/data/routes';
import { getPostPageNumbers } from '@/lib/posts';
import { BlogIndexPage } from '@/components/pages/BlogIndexPage';

/**
 * Blog pagination — `{blog}/page/2/` and up.
 *
 * The literal `page` segment arrives as the `[sub]` param and is checked below. A route
 * directory named `page` collides with the `page.js` the compiler emits for the segment.
 *
 * Page 1 is deliberately absent — it lives at the unpaginated blog URL, so there is no
 * duplicate-content pair.
 *
 * `true` because the page count follows what the admin has published. An empty database
 * yields no params, and `false` then leaves the route with no path and no fallback,
 * which Next reports as `NoFallbackError` — a 500 where a 404 belongs. Out-of-range
 * pages 404 via the `notFound()` below.
 */
export const dynamicParams = true;

export async function generateStaticParams() {
  const numbers = await getPostPageNumbers();
  return numbers.map((n) => ({ slug: 'المدونة', sub: 'page', n: String(n) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ n: string }>;
}): Promise<Metadata> {
  const { n } = await params;
  return {
    title: `المدونة — صفحة ${n}`,
    description:
      'أحدث المقالات والنصائح المتخصصة في حماية السيارات، أفلام PPF، العزل الحراري والنانو سيراميك من 3M مايل.',
    alternates: { canonical: encodeURI(`/المدونة/page/${n}`) },
    // The live site serves `follow, index` on its paginated listings, and Google's own
    // guidance is against noindex on pagination — it can drop the linked articles with it.
    // Matched rather than "improved".
    robots: { index: true, follow: true },
  };
}

export default async function BlogPaginated({
  params,
}: {
  params: Promise<{ slug: string; sub: string; n: string }>;
}) {
  const { slug, sub, n } = await params;
  if (findTopRoute(slug)?.page !== 'blog' || decodeSlug(sub) !== 'page') notFound();

  const page = Number(n);
  const valid = await getPostPageNumbers();
  if (!valid.includes(page)) notFound();

  return <BlogIndexPage page={page} />;
}
