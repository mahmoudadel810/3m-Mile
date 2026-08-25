import type { Metadata } from 'next';
import { findTopRoute, findSubRoute, decodeSlug } from './routes';
import { getService } from './services';
import { getVideoGalleryIntro } from './gallery';
import { getOffersPage } from './offers';

/**
 * Per-route SEO metadata for the two Arabic dispatchers.
 *
 * Split out of `data/routes.ts` because some of it is derived from content — a service
 * page's title is the service's own heading, the offers page's description is its intro
 * copy — and content is behind async accessors. `routes.ts` has to stay synchronous for
 * `generateStaticParams`, so anything that awaits lives here instead.
 *
 * Both dispatchers already export an async `generateMetadata`, so awaiting costs nothing.
 */

/** Canonical paths carry Arabic. Next renders the tag verbatim, so encode it here. */
const canonical = (path: string) => ({ alternates: { canonical: encodeURI(path) } });

const STATIC: Record<string, Metadata> = {
  about: {
    title: 'من نحن',
    description:
      'مراكز 3M مايل المعتمدة، متخصصون في افلام حماية السيارات PPF وتلميع النانو سيراميك وتظليل العازل الحراري بخبرة تتجاوز 15 عامًا في المملكة.',
    ...canonical('/من-نحن'),
  },
  services: {
    title: 'خدماتنا',
    description:
      'نعتني بسيارتك من داخليتها لهيكلها الخارجي ونقدم كل خدمات حماية السيارات باستخدام أحدث التقنيات وأفضل المنتجات الأصلية.',
    ...canonical('/خدمات'),
  },
  branches: {
    title: 'فروعنا',
    description:
      'مراكز 3M مايل المعتمدة في المملكة العربية السعودية — 12 فرعًا في الرياض وجدة والدمام والخبر. اعرف العنوان ورقم التواصل لكل فرع.',
    ...canonical('/فروعنا'),
  },
  contact: {
    title: 'تواصل معنا',
    description:
      'تواصل مع فريق 3M مايل — الجوال 0561266685، البريد info@3mmile.sa، خدمة 24 ساعة طوال أيام الأسبوع.',
    ...canonical('/تواصل-معنا'),
  },
  faq: {
    title: 'الأسئلة الشائعة',
    description:
      'إجابات على أكثر الأسئلة شيوعًا حول خدمات حماية السيارات، أفلام PPF، العزل الحراري، النانو سيراميك والضمان لدى 3M مايل.',
    ...canonical('/الأسئلة-الشائعة'),
  },
  warranty: {
    title: 'سياسة الضمان',
    description:
      'تفاصيل ضمان 3M مايل على أفلام حماية PPF والعزل الحراري والنانو سيراميك — مدد الضمان والصيانة والشروط والأحكام.',
    ...canonical('/سياسة-الضمان'),
  },
  blog: {
    title: 'المدونة',
    description:
      'يقدم لك فريق مايل أحدث المقالات والنصائح والمعلومات المتخصصة في مجال حماية السيارات، أفلام PPF، العزل الحراري والنانو سيراميك.',
    ...canonical('/المدونة'),
  },
  'photo-gallery': {
    title: 'معرض الصور',
    description:
      'صور من أعمال 3M مايل — حماية PPF كاملة، تظليل عازل حراري وتلميع نانو سيراميك لسيارات عملائنا.',
    ...canonical('/معرض-الفيديو/معرض-الصور'),
  },
};

/** Metadata for a top-level route. Returns `{}` for slugs this dispatcher doesn't own. */
export async function getTopRouteMetadata(slug: string): Promise<Metadata> {
  const route = findTopRoute(slug);
  if (!route) return {};
  if (route.page === 'video-gallery') {
    const intro = await getVideoGalleryIntro();
    return {
      title: 'معرض الفيديو',
      description: intro.description,
      ...canonical('/معرض-الفيديو'),
    };
  }
  return STATIC[route.page] ?? {};
}

/** Metadata for a two-segment route. */
export async function getSubRouteMetadata(slug: string, sub: string): Promise<Metadata> {
  const route = findSubRoute(slug, sub);
  if (!route) return {};

  if (route.page === 'offers') {
    const page = await getOffersPage();
    return {
      title: 'عروض حماية السيارات',
      description: page.intro,
      ...canonical('/Packages/عروض-حماية-السيارات'),
      openGraph: { images: [page.banner] },
    };
  }

  if (route.page === 'service-detail') {
    const service = await getService(decodeSlug(sub));
    if (!service) return {};
    return {
      title: service.heading,
      description: service.tagline,
      ...canonical(`/خدمات/${service.slug}`),
      openGraph: {
        title: service.heading,
        description: service.tagline,
        images: [service.heroImage],
      },
    };
  }

  return STATIC[route.page] ?? {};
}
