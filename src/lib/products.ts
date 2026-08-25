import 'server-only';
import { apiGet, apiList } from './api/client';
import {
  mapProduct,
  mapProductSummary,
  mapCategory,
  type ApiProduct,
  type ApiCategory,
} from './api/dto';

/**
 * Shop catalogue — the API seam.
 *
 * A CATALOGUE, not a store: no cart, no checkout, no prices. Every product page converts
 * through a WhatsApp deep link. The backend model carries `price`/`stock`/`sku` and this
 * DTO deliberately does not surface them; adding commerce later is additive.
 *
 * `import 'server-only'`: these run server-side so ISR and the API base URL resolve.
 */

export type ProductImage = {
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
};

export type ProductSummary = {
  /** Mongo ObjectId. */
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  categories: string[];
  featured: ProductImage | null;
};

export type Product = ProductSummary & {
  /** Full body copy. */
  contentHTML: string;
  /** Paragraph + bullet list shown beside the gallery. Null means genuinely absent. */
  shortDescriptionHTML: string | null;
  /** Every image on the product page, featured first. */
  gallery: ProductImage[];
};

export type ProductCategory = {
  id: string;
  slug: string;
  name: string;
  count: number;
  description: string;
};

/** Only active products reach the public catalogue. */
const ACTIVE = 'isActive=true';

// ---------------------------------------------------------------------------
// Accessors
// ---------------------------------------------------------------------------

/** @endpoint GET /api/v1/products */
export async function getProducts(): Promise<ProductSummary[]> {
  const rows = await apiList<ApiProduct>(`/products?${ACTIVE}&limit=100`);
  return rows.map(mapProductSummary);
}

/** @endpoint GET /api/v1/products/slug/{slug} */
export async function getProduct(slug: string): Promise<Product | undefined> {
  const product = await apiGet<ApiProduct>(`/products/slug/${encodeURIComponent(slug)}`);
  return product ? mapProduct(product) : undefined;
}

/** @endpoint GET /api/v1/products?category={id} */
export async function getProductsByCategory(category: string): Promise<ProductSummary[]> {
  const found = await apiGet<ApiCategory>(`/categories/slug/${encodeURIComponent(category)}`);
  // Unknown category renders an empty archive rather than throwing.
  if (!found?._id) return [];

  const rows = await apiList<ApiProduct>(`/products?${ACTIVE}&category=${found._id}&limit=100`);
  return rows.map(mapProductSummary);
}

/** Other products in the same category, for the related-products rail. */
export async function getRelatedProducts(
  product: ProductSummary,
  limit = 4,
): Promise<ProductSummary[]> {
  const firstCategory = product.categories[0];
  if (!firstCategory) return [];

  const siblings = await getProductsByCategory(firstCategory);
  return siblings.filter((p) => p.slug !== product.slug).slice(0, limit);
}

/** @endpoint GET /api/v1/categories?type=product — only those holding at least one product. */
export async function getProductCategories(): Promise<ProductCategory[]> {
  const rows = await apiList<ApiCategory>('/categories?type=product&withCounts=true&limit=100');
  // An empty archive is a soft-404, so empty categories are not listed or built.
  return rows.map(mapCategory).filter((c) => c.count > 0);
}

/** @endpoint GET /api/v1/categories/slug/{slug} */
export async function getProductCategory(slug: string): Promise<ProductCategory | undefined> {
  // Read from the counted list so `count` is populated — the archive page prints it.
  const categories = await getProductCategories();
  return categories.find((c) => c.slug === slug);
}

export async function getProductSlugs(): Promise<string[]> {
  const rows = await apiList<ApiProduct>(`/products?${ACTIVE}&limit=100`);
  return rows.map((p) => p.slug);
}
