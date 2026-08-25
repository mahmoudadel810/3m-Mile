import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getProduct,
  getProductSlugs,
  getRelatedProducts,
  getProductCategories,
} from '@/lib/products';
import { decodeSlug } from '@/data/routes';
import { site } from '@/data/site';
import { ProductPage } from '@/components/pages/ProductPage';

/**
 * `/product/{slug}/` — one page per catalogue entry.
 *
 * `true` because products are CMS content: one added after the last build has no entry
 * in `generateStaticParams`, and `false` would leave it 404ing until someone redeployed.
 * With an empty database `generateStaticParams` returns nothing at all, and `false`
 * then leaves the route with no path and no fallback — a 500, not a 404. Unknown slugs
 * still 404 properly, via the `notFound()` below.
 */
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(decodeSlug(slug));
  if (!product) return {};

  return {
    title: product.title,
    description: product.excerpt,
    alternates: { canonical: encodeURI(`/product/${product.slug}`) },
    openGraph: {
      title: product.title,
      description: product.excerpt,
      url: encodeURI(`${site.url}/product/${product.slug}`),
      images: product.featured ? [product.featured.url] : undefined,
    },
  };
}

export default async function ProductRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(decodeSlug(slug));
  if (!product) notFound();

  const [related, categories] = await Promise.all([
    getRelatedProducts(product, 3),
    getProductCategories(),
  ]);
  return <ProductPage product={product} related={related} categories={categories} />;
}
