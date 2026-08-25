import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategories, getCategory } from '@/lib/posts';
import { decodeSlug } from '@/data/routes';
import { CategoryPage } from '@/components/pages/CategoryPage';

/**
 * Category archives — `/category/{slug}/`.
 *
 * `category` is ASCII, so this can be a real directory; only the term slug is Arabic and
 * that arrives as a param, which works.
 *
 * `true` because categories are CMS content, and because an empty database makes
 * `generateStaticParams` return nothing — under `false` the route then has no path and
 * no fallback, which is a 500 rather than a 404. Unknown slugs 404 via `notFound()`.
 */
export const dynamicParams = true;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(decodeSlug(slug));
  if (!category) return {};

  return {
    title: category.name,
    description:
      category.description ||
      `مقالات 3M مايل في قسم ${category.name} — ${category.count} مقال متخصص في حماية السيارات.`,
    alternates: { canonical: encodeURI(`/category/${category.slug}`) },
  };
}

export default async function CategoryRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategory(decodeSlug(slug));
  if (!category) notFound();
  return <CategoryPage category={category} />;
}
