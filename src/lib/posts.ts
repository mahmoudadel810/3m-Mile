import 'server-only';
import { apiGet, apiList, apiPaged, type Paged } from './api/client';
import {
  mapPost,
  mapPostSummary,
  mapCategory,
  type ApiBlogPost,
  type ApiCategory,
} from './api/dto';

/**
 * Blog posts — the API seam.
 *
 * `import 'server-only'` is load-bearing: `getPost` returns full body HTML, and these
 * calls must stay server-side so the API base URL and ISR caching behave. Client
 * components take `PostSummary`, which carries no `contentHTML`.
 */

export type PostSummary = {
  /** Mongo ObjectId. */
  id: string;
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  categories: string[];
  featured: { url: string; alt: string; width: number | null; height: number | null } | null;
};

export type Post = PostSummary & { contentHTML: string };

export type Category = {
  id: string;
  slug: string;
  name: string;
  count: number;
  description: string;
};

/** Posts per page on the blog index and category archives. Fixed — changing it changes
 *  every indexed pagination URL. */
export const POSTS_PER_PAGE = 9;

export type { Paged };

/** Only published posts are ever served to the public site. */
const PUBLISHED = 'isPublished=true';

// ---------------------------------------------------------------------------
// Accessors
// ---------------------------------------------------------------------------

/** @endpoint GET /api/v1/blog-posts?page=n — newest first, without body HTML. */
export async function getPosts(page = 1): Promise<Paged<PostSummary>> {
  const result = await apiPaged<ApiBlogPost>(
    `/blog-posts?${PUBLISHED}&page=${page}&limit=${POSTS_PER_PAGE}`,
    POSTS_PER_PAGE,
    page,
  );
  return { ...result, items: result.items.map(mapPostSummary) };
}

/** @endpoint GET /api/v1/blog-posts?limit=n — for the homepage rail. */
export async function getLatestPosts(limit: number): Promise<PostSummary[]> {
  const rows = await apiList<ApiBlogPost>(`/blog-posts?${PUBLISHED}&limit=${limit}`);
  return rows.map(mapPostSummary);
}

/** @endpoint GET /api/v1/blog-posts/slug/{slug} — full post including body HTML. */
export async function getPost(slug: string): Promise<Post | undefined> {
  const post = await apiGet<ApiBlogPost>(`/blog-posts/slug/${encodeURIComponent(slug)}`);
  if (!post) return undefined;

  // The API does not filter drafts on this endpoint. Not found, not 403, so draft slugs
  // are not discoverable.
  if (post.isPublished === false) return undefined;

  return mapPost(post);
}

/**
 * Resolve a category slug to its ObjectId.
 *
 * The public URLs carry slugs but the posts filter takes an id, so this hop is
 * unavoidable. It is a separate cached request rather than a new backend endpoint,
 * because both halves are already cached by ISR and a bespoke
 * `?categorySlug=` filter would duplicate `/categories/slug/:slug`.
 */
async function categoryIdFromSlug(slug: string): Promise<string | null> {
  const category = await apiGet<ApiCategory>(`/categories/slug/${encodeURIComponent(slug)}`);
  return category?._id ?? null;
}

/** @endpoint GET /api/v1/blog-posts?category={id}&page=n */
export async function getPostsByCategory(
  category: string,
  page = 1,
): Promise<Paged<PostSummary>> {
  const id = await categoryIdFromSlug(category);
  // Unknown category — an empty page, not a crash. The route still renders its shell.
  if (!id) return { items: [], page, totalPages: 1, total: 0 };

  const result = await apiPaged<ApiBlogPost>(
    `/blog-posts?${PUBLISHED}&category=${id}&page=${page}&limit=${POSTS_PER_PAGE}`,
    POSTS_PER_PAGE,
    page,
  );
  return { ...result, items: result.items.map(mapPostSummary) };
}

/**
 * Posts sharing a category with the given one, newest first, excluding itself.
 *
 * The backend has no "related" endpoint, so this composes two calls it does have. The
 * filler behaviour is preserved from the fixture implementation: a post in a
 * single-member category would otherwise render an empty rail.
 */
export async function getRelatedPosts(post: PostSummary, limit = 3): Promise<PostSummary[]> {
  const firstCategory = post.categories[0];

  const related = firstCategory
    ? (await getPostsByCategory(firstCategory, 1)).items.filter((p) => p.slug !== post.slug)
    : [];

  if (related.length >= limit) return related.slice(0, limit);

  // Top up with the newest posts so the rail is never short.
  const latest = await getLatestPosts(limit + related.length + 1);
  const seen = new Set([post.slug, ...related.map((p) => p.slug)]);
  const filler = latest.filter((p) => !seen.has(p.slug));

  return [...related, ...filler].slice(0, limit);
}

/** @endpoint GET /api/v1/categories?type=blog — with post counts for the sidebar. */
export async function getCategories(): Promise<Category[]> {
  const rows = await apiList<ApiCategory>('/categories?type=blog&withCounts=true&limit=100');
  // The fixture hid empty categories because an empty archive is a soft-404; same rule.
  return rows.map(mapCategory).filter((c) => c.count > 0);
}

/** @endpoint GET /api/v1/categories/slug/{slug} */
export async function getCategory(slug: string): Promise<Category | undefined> {
  // Read from the counted list so `count` is populated — the archive page prints it.
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug);
}

/**
 * Route params for the static build.
 *
 * Pages through the whole collection because `generateStaticParams` needs every slug,
 * and the backend caps `limit` at 100. The page cap is a safety valve against an
 * unbounded loop if the API keeps returning full pages.
 */
export async function getPostSlugs(): Promise<string[]> {
  const PER_PAGE = 100;
  const MAX_PAGES = 50;
  const slugs: string[] = [];

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const rows = await apiList<ApiBlogPost>(
      `/blog-posts?${PUBLISHED}&page=${page}&limit=${PER_PAGE}`,
    );
    slugs.push(...rows.map((p) => p.slug));
    if (rows.length < PER_PAGE) break;
  }

  return slugs;
}

/** Page numbers 2..N for the blog index. Page 1 lives at the unpaginated URL. */
export async function getPostPageNumbers(): Promise<number[]> {
  const { totalPages } = await getPosts(1);
  return Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) => i + 2);
}
