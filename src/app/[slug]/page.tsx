import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import {
  topRoutes,
  findTopRoute,
  findLegacyRedirect,
  decodeSlug,
  assertNoReservedSlugs,
} from '@/data/routes';
import { getTopRouteMetadata } from '@/data/route-metadata';
import { getPost, getPostSlugs, getRelatedPosts, getCategories } from '@/lib/posts';
import { site } from '@/data/site';
import { AboutPage } from '@/components/pages/AboutPage';
import { ServicesPage } from '@/components/pages/ServicesPage';
import { BranchesPage } from '@/components/pages/BranchesPage';
import { ContactPage } from '@/components/pages/ContactPage';
import { VideoGalleryPage } from '@/components/pages/VideoGalleryPage';
import { FaqPage } from '@/components/pages/FaqPage';
import { WarrantyPage } from '@/components/pages/WarrantyPage';
import { BlogIndexPage } from '@/components/pages/BlogIndexPage';
import { PostPage } from '@/components/pages/PostPage';

/**
 * Dispatcher for every top-level route.
 *
 * See data/routes.ts for why routing goes through a dynamic segment instead of one
 * directory per page. The URLs are unchanged; only the declaration differs.
 *
 * Three kinds of slug arrive here, resolved in this order:
 *   1. a legacy URL  -> 301 to its canonical target
 *   2. a fixed page  -> the component from `topRoutes`
 *   3. a post slug   -> the article (posts live at the site root, so all
 *                       201 of them are top-level and share this namespace)
 * Verified: no post slug collides with a page slug or a legacy slug.
 */
export const dynamicParams = true;

export async function generateStaticParams() {
  // Legacy slugs are deliberately NOT prerendered — a build-time redirect cannot be
  // baked into a static page. They resolve on demand and 301 from the component body.
  const slugs = await getPostSlugs();
  // Fails the build rather than silently shadowing a post behind a literal route.
  assertNoReservedSlugs(slugs);
  return [...topRoutes.map((r) => ({ slug: r.slug })), ...slugs.map((slug) => ({ slug }))];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const routeMeta = await getTopRouteMetadata(slug);
  if (Object.keys(routeMeta).length > 0) return routeMeta;

  const post = await getPost(decodeSlug(slug));
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: encodeURI(`/${post.slug}`) },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      url: encodeURI(`${site.url}/${post.slug}`),
      images: post.featured ? [post.featured.url] : undefined,
    },
  };
}

const pages = {
  about: AboutPage,
  services: ServicesPage,
  branches: BranchesPage,
  contact: ContactPage,
  'video-gallery': VideoGalleryPage,
  faq: FaqPage,
  warranty: WarrantyPage,
  blog: BlogIndexPage,
} as const;

export default async function TopLevelRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const legacy = findLegacyRedirect(slug);
  if (legacy) {
    // Two things this line has to get right:
    //  - percent-encoding: Next writes the destination straight into the Location
    //    header, and a raw Arabic path there is not a valid header value;
    //  - the trailing slash: appending one unconditionally turned the two `slider-*`
    //    redirects, whose destination is the site root, into `//`.
    const target = legacy.endsWith('/') ? legacy : `${legacy}/`;
    permanentRedirect(encodeURI(target));
  }

  const route = findTopRoute(slug);
  if (route) {
    const Page = pages[route.page as keyof typeof pages];
    if (!Page) notFound();
    return <Page />;
  }

  const post = await getPost(decodeSlug(slug));
  if (!post) notFound();

  const [related, categories] = await Promise.all([getRelatedPosts(post, 3), getCategories()]);
  return <PostPage post={post} related={related} categories={categories} />;
}
