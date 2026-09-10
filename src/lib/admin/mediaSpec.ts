/**
 * Geometry of every fixed image/video slot on the public site, transcribed from
 * `docs/media-slots.md`. Drives the admin help text (`specHelp`) and upload rejection
 * (`checkAspect`). Keep in sync with that table.
 */

export type SlotKey =
  | 'settings.logo'
  | 'settings.aboutImage'
  | 'home.heroVideo'
  | 'home.heroPoster'
  | 'home.tile'
  | 'home.trustIcon'
  | 'home.whyUsImage'
  | 'reviews.image'
  | 'partners.logo'
  | 'blog.cover'
  | 'products.image'
  | 'packages.image'
  | 'offers.banner'
  | 'gallery.image'
  | 'gallery.video'
  | 'services.heroImage'
  | 'services.wideImage'
  | 'services.collage'
  | 'promo.image'
  | 'blogIntro.image';

export type MediaSpec = {
  kind: 'image' | 'video' | 'media';
  /** width / height */
  aspect: number;
  /** '1:1', '10:11', '1100:570' */
  aspectLabel: string;
  /** Recommended px (2× the rendered CSS box at 1440, rounded). */
  width: number;
  height: number;
  minWidth: number;
  minHeight: number;
  maxMB: number;
  /** ± band around `aspect`, as a fraction. Default 0.05 (±5 %). */
  tolerance: number;
  /** Landscape floor instead of a target — e.g. the logo just needs to be wide enough. */
  minAspect?: number;
  /** Ceiling paired with `minAspect` — a range instead of a single target ratio. */
  maxAspect?: number;
  /** Arabic: where this slot renders on the site. */
  where: string;
};

export const MEDIA_SPECS: Record<SlotKey, MediaSpec> = {
  'settings.logo': {
    kind: 'image',
    aspect: 3,
    aspectLabel: '3:1',
    width: 600,
    height: 200,
    minWidth: 300,
    minHeight: 100,
    maxMB: 1,
    tolerance: 0.05,
    minAspect: 2,
    where: 'شعار الموقع في رأس الصفحة (SiteHeader)',
  },
  'home.heroVideo': {
    kind: 'video',
    aspect: 1100 / 570,
    aspectLabel: '1100:570',
    width: 2200,
    height: 1140,
    minWidth: 1100,
    minHeight: 570,
    maxMB: 50,
    tolerance: 0.05,
    minAspect: 1.7,
    maxAspect: 2.05,
    where: 'فيديو الغلاف في الصفحة الرئيسية (VideoHero)',
  },
  'home.heroPoster': {
    kind: 'image',
    aspect: 1100 / 570,
    aspectLabel: '1100:570',
    width: 2200,
    height: 1140,
    minWidth: 1100,
    minHeight: 570,
    maxMB: 10,
    tolerance: 0.05,
    minAspect: 1.7,
    maxAspect: 2.05,
    where: 'صورة غلاف الفيديو قبل تشغيله (VideoHero)',
  },
  'home.tile': {
    kind: 'image',
    aspect: 10 / 11,
    aspectLabel: '10:11',
    width: 726,
    height: 800,
    minWidth: 363,
    minHeight: 400,
    maxMB: 10,
    tolerance: 0.05,
    where: 'بطاقات الغلاف في الصفحة الرئيسية (HeroGrid)',
  },
  'home.trustIcon': {
    kind: 'image',
    aspect: 1,
    aspectLabel: '1:1',
    width: 160,
    height: 160,
    minWidth: 80,
    minHeight: 80,
    maxMB: 1,
    tolerance: 0.05,
    where: 'أيقونة شارة الثقة في الصفحة الرئيسية (TrustStrip)',
  },
  'home.whyUsImage': {
    kind: 'image',
    aspect: 1,
    aspectLabel: '1:1',
    width: 1042,
    height: 1042,
    minWidth: 521,
    minHeight: 521,
    maxMB: 10,
    tolerance: 0.05,
    where: 'قسم «لماذا تختارنا» في الصفحة الرئيسية (WhyUs)',
  },
  'reviews.image': {
    kind: 'image',
    aspect: 11 / 8,
    aspectLabel: '11:8',
    width: 958,
    height: 694,
    minWidth: 479,
    minHeight: 347,
    maxMB: 10,
    tolerance: 0.05,
    where: 'بطاقة تقييم جوجل في سلايدر التقييمات (ReviewCarousel)',
  },
  'partners.logo': {
    kind: 'image',
    aspect: 3 / 2,
    aspectLabel: '3:2',
    width: 384,
    height: 256,
    minWidth: 128,
    minHeight: 85,
    maxMB: 1,
    tolerance: 0.05,
    where: 'شعار الشريك في شريط الشركاء (PartnerStrip)',
  },
  'blog.cover': {
    kind: 'image',
    aspect: 16 / 10,
    aspectLabel: '16:10',
    width: 1120,
    height: 700,
    minWidth: 560,
    minHeight: 350,
    maxMB: 10,
    tolerance: 0.05,
    where: 'بطاقة المقال وأحدث المقالات (PostCard، LatestPosts)',
  },
  'products.image': {
    kind: 'image',
    aspect: 4 / 3,
    aspectLabel: '4:3',
    width: 1200,
    height: 900,
    minWidth: 600,
    minHeight: 450,
    maxMB: 10,
    tolerance: 0.05,
    where: 'بطاقة المنتج ومعرض صوره (ProductCard)',
  },
  'packages.image': {
    kind: 'image',
    aspect: 4 / 5,
    aspectLabel: '4:5',
    width: 800,
    height: 1000,
    minWidth: 400,
    minHeight: 500,
    maxMB: 10,
    tolerance: 0.05,
    where: 'بطاقة العرض في صفحة العروض',
  },
  'offers.banner': {
    kind: 'image',
    aspect: 22 / 9,
    aspectLabel: '22:9',
    width: 2200,
    height: 900,
    minWidth: 1100,
    minHeight: 450,
    maxMB: 10,
    tolerance: 0.05,
    where: 'بانر صفحة العروض (OffersPage)',
  },
  'gallery.image': {
    kind: 'image',
    aspect: 1,
    aspectLabel: '1:1',
    width: 1200,
    height: 1200,
    minWidth: 600,
    minHeight: 600,
    maxMB: 10,
    tolerance: 0.05,
    where: 'معرض الصور (PhotoGallery)',
  },
  'gallery.video': {
    kind: 'video',
    aspect: 9 / 16,
    aspectLabel: '9:16',
    width: 1080,
    height: 1920,
    minWidth: 540,
    minHeight: 960,
    maxMB: 50,
    tolerance: 0.05,
    where: 'معرض الفيديو (ReelCarousel)',
  },
  'services.heroImage': {
    kind: 'image',
    aspect: 1,
    aspectLabel: '1:1',
    width: 1440,
    height: 1440,
    minWidth: 720,
    minHeight: 720,
    maxMB: 10,
    tolerance: 0.05,
    where: 'الصورة الرئيسية في صفحة الخدمة (ServiceDetail)',
  },
  'services.wideImage': {
    kind: 'image',
    aspect: 16 / 10,
    aspectLabel: '16:10',
    width: 1280,
    height: 800,
    minWidth: 640,
    minHeight: 400,
    maxMB: 10,
    tolerance: 0.05,
    where: 'الصورة العريضة في فهرس الخدمات (ServiceDetail)',
  },
  'services.collage': {
    kind: 'image',
    aspect: 1,
    aspectLabel: '1:1',
    width: 960,
    height: 960,
    minWidth: 480,
    minHeight: 480,
    maxMB: 10,
    tolerance: 0.05,
    where: 'صور المزايا في صفحة الخدمة (ServiceDetail)',
  },
  'promo.image': {
    kind: 'image',
    aspect: 3 / 2,
    aspectLabel: '3:2',
    width: 1600,
    height: 1067,
    minWidth: 800,
    minHeight: 533,
    maxMB: 10,
    tolerance: 0.05,
    where: 'النافذة الترويجية (PromoModal)',
  },
  'blogIntro.image': {
    kind: 'image',
    aspect: 4 / 5,
    aspectLabel: '4:5',
    width: 800,
    height: 1000,
    minWidth: 400,
    minHeight: 500,
    maxMB: 10,
    tolerance: 0.05,
    where: 'بانر مقدمة المدونة',
  },
  'settings.aboutImage': {
    kind: 'image',
    aspect: 1,
    aspectLabel: '1:1',
    width: 940,
    height: 940,
    minWidth: 470,
    minHeight: 470,
    maxMB: 10,
    tolerance: 0.05,
    where: 'صورة قسم «من نحن»',
  },
};

/** Well-known ratio names, used only to phrase a min/max band in messages. */
const COMMON_RATIOS: { r: number; label: string }[] = [
  { r: 1, label: '1:1' },
  { r: 4 / 3, label: '4:3' },
  { r: 3 / 2, label: '3:2' },
  { r: 16 / 10, label: '16:10' },
  { r: 16 / 9, label: '16:9' },
  { r: 2, label: '2:1' },
  { r: 21 / 9, label: '21:9' },
];
const nearestRatioLabel = (ratio: number): string =>
  COMMON_RATIOS.reduce((best, c) => (Math.abs(c.r - ratio) < Math.abs(best.r - ratio) ? c : best)).label;

/** Reduced-fraction label, e.g. `label(1080, 1350)` → `'4:5'`. */
const label = (w: number, h: number) => {
  const g = (a: number, b: number): number => (b ? g(b, a % b) : a);
  const d = g(w, h);
  const a = w / d;
  const b = h / d;
  return a > 40 || b > 40 ? (w / h).toFixed(2) + ':1' : `${a}:${b}`;
};

/**
 * Whether a file's pixel size satisfies a slot's geometry. Aspect is checked first
 * (a `minAspect`/`maxAspect` range, or `±tolerance` around `aspect`), then the
 * `minWidth`/`minHeight` floor.
 */
export function checkAspect(
  width: number,
  height: number,
  spec: MediaSpec,
): { ok: true } | { ok: false; message: string } {
  const ratio = width / height;
  const ok =
    spec.minAspect !== undefined
      ? ratio >= spec.minAspect && (spec.maxAspect === undefined || ratio <= spec.maxAspect)
      : Math.abs(ratio - spec.aspect) / spec.aspect <= spec.tolerance;
  if (ok) {
    if (width < spec.minWidth || height < spec.minHeight) {
      return {
        ok: false,
        message: `مقاس الملف ${width}×${height} أصغر من الحد الأدنى ${spec.minWidth}×${spec.minHeight}.`,
      } as const;
    }
    return { ok: true } as const;
  }
  const need =
    spec.minAspect !== undefined
      ? spec.maxAspect !== undefined
        ? `نسبة بين ${nearestRatioLabel(spec.minAspect)} و${nearestRatioLabel(spec.maxAspect)}، مثل ${spec.width}×${spec.height}`
        // Name the floor itself, which can differ from the recommended size's ratio.
        : `صورة أفقية بنسبة ${nearestRatioLabel(spec.minAspect)} أو أعرض، مثل ${spec.width}×${spec.height}`
      : `نسبة ${spec.aspectLabel}، مثل ${spec.width}×${spec.height}`;
  return {
    ok: false,
    message: `مقاس الملف ${width}×${height} (نسبة ${label(width, height)}) — هذا المكان يحتاج ${need}.`,
  } as const;
}

/** The Arabic help line appended to a field's `help`, naming the exact recommended geometry. */
export const specHelp = (s: MediaSpec) =>
  `${s.where}. المقاس الموصى به ${s.width}×${s.height} بكسل (نسبة ${s.aspectLabel})، ولا يقل عن ${s.minWidth}×${s.minHeight}. الحد الأقصى ${s.maxMB} ميغابايت.`;

/** CSS `aspect-ratio` value for a slot's preview frame — `${width} / ${height}`. */
export const cssAspect = (spec: MediaSpec) => `${spec.width} / ${spec.height}`;
