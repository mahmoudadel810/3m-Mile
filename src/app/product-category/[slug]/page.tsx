import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductCategories, getProductCategory } from '@/lib/products';
import { decodeSlug } from '@/data/routes';
import { ShopPage } from '@/components/pages/ShopPage';

/**
 * `/product-category/{slug}/` — one archive per product category from the CMS.
 *
 * Only categories that actually hold products are built: an empty archive is a soft-404
 * with nothing linking to it.
 */
// `true` because categories are CMS content, and because an empty database makes
// `generateStaticParams` return nothing — under `false` the route then has no path and
// no fallback, which is a 500 rather than a 404. Unknown slugs 404 via `notFound()`.
export const dynamicParams = true;

export async function generateStaticParams() {
  const categories = await getProductCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getProductCategory(decodeSlug(slug));
  if (!category) return {};

  return {
    title: category.name,
    description:
      category.description ||
      `منتجات 3M مايل في قسم ${category.name} — ${category.count} منتج بضمان رسمي وتركيب متخصص.`,
    alternates: { canonical: encodeURI(`/product-category/${category.slug}`) },
  };
}

export default async function ProductCategoryRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getProductCategory(decodeSlug(slug));
  if (!category) notFound();
  return <ShopPage category={category} />;
}
