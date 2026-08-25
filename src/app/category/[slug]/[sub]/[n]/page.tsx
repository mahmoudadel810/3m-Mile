import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategories, getCategory, getPostsByCategory } from '@/lib/posts';
import { decodeSlug } from '@/data/routes';
import { CategoryPage } from '@/components/pages/CategoryPage';

/**
 * Category pagination — `/category/{slug}/page/2/`.
 *
 * The literal `page` segment is the `[sub]` param, not a directory — see the sibling
 * route at app/[slug]/[sub]/[n]/page.tsx for why that name cannot be a directory.
 *
 * Params are derived from the live post counts, so only categories with enough posts to
 * paginate get a page. `true` because those counts change as the admin publishes: an
 * empty database yields no params at all, and `false` would then leave the route with no
 * path and no fallback — a 500 rather than a 404. Unknown pages 404 via `notFound()`.
 */
export const dynamicParams = true;

export async function generateStaticParams() {
  const categories = await getCategories();
  const params: { slug: string; sub: string; n: string }[] = [];

  for (const c of categories) {
    const { totalPages } = await getPostsByCategory(c.slug, 1);
    for (let n = 2; n <= totalPages; n++) params.push({ slug: c.slug, sub: 'page', n: String(n) });
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; n: string }>;
}): Promise<Metadata> {
  const { slug, n } = await params;
  const category = await getCategory(decodeSlug(slug));
  if (!category) return {};

  return {
    title: `${category.name} — صفحة ${n}`,
    alternates: { canonical: encodeURI(`/category/${category.slug}/page/${n}`) },
    // The live site serves `follow, index` on its paginated listings, and Google's own
    // guidance is against noindex on pagination — it can drop the linked articles with it.
    // Matched rather than "improved".
    robots: { index: true, follow: true },
  };
}

export default async function CategoryPaginated({
  params,
}: {
  params: Promise<{ slug: string; sub: string; n: string }>;
}) {
  const { slug, sub, n } = await params;
  if (decodeSlug(sub) !== 'page') notFound();

  const category = await getCategory(decodeSlug(slug));
  if (!category) notFound();

  const page = Number(n);
  const { totalPages } = await getPostsByCategory(category.slug, 1);
  if (!Number.isInteger(page) || page < 2 || page > totalPages) notFound();

  return <CategoryPage category={category} page={page} />;
}
