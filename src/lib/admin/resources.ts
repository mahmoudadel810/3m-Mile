/**
 * Declarative description of every CMS entity. One `ResourceManager` renders them all.
 *
 * Field `name` is the wire contract — submitted verbatim, so it must match the backend
 * Zod schema exactly, including dotted singleton paths (`hero.ctaLabel`) and image slot
 * names (`heroImage`, `trustImage0`). Renaming one silently stops it saving.
 *
 * Field `type` is UI only. The encodings are unchanged: comma-joined for `tags`, a JSON
 * string for `repeater` and `stringList`.
 *
 * `npm run check:contract` in the server repo verifies both sides still agree.
 */

// ---------------------------------------------------------------------------
// Field model
// ---------------------------------------------------------------------------

export type FieldType =
  | 'text'
  | 'textarea'
  | 'html'
  | 'number'
  | 'percent'
  | 'boolean'
  | 'select'
  /** Free-form keywords, entered and removed as chips. Wire: comma-joined string. */
  | 'tags'
  /** An ordered list of single-line strings. Wire: JSON array of strings. */
  | 'stringList'
  /** An ordered list of structured rows. Wire: JSON array of objects. */
  | 'repeater'
  | 'image'
  | 'images'
  /** A reference to another document, chosen by name. Wire: ObjectId (or ids joined by commas). */
  | 'relation'
  /** A page on this site, chosen by its business name. Wire: the path string. */
  | 'link';

/** Sub-field of a `repeater` row. A row cannot itself contain a repeater. */
export type RepeaterField = {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'stringList' | 'link' | 'icon';
  required?: boolean;
  help?: string;
  placeholder?: string;
  maxLength?: number;
  options?: Option[];
  /** For `link` sub-fields: which page list to offer. */
  links?: LinkSource;
  /**
   * Dotted path to read the initial value from, when the stored row nests it elsewhere
   * than `sub.name` — trust badges store alt at `image.alt` but accept it back flat.
   */
  from?: string;
  /** Column span inside the row grid (1 or 2). Defaults to 1. */
  span?: 1 | 2;
};

export type Option = { value: string; label: string };

/** Where a `link` field's choices come from. */
export type LinkSource = {
  /** Fixed site pages, by business name. */
  pages?: boolean;
  /** Documents turned into paths: the label is the title, the value `prefix + slug`. */
  fromResource?: { endpoint: string; prefix: string; labelKey: string; query?: string };
};

export type AdminField = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  placeholder?: string;
  /** Client-side length guard, mirroring the server's `.max()`. */
  maxLength?: number;
  min?: number;
  max?: number;
  /** Extra client-side check. Return an Arabic message, or null when the value is fine. */
  pattern?: { test: RegExp; message: string };
  options?: Option[];
  relation?: { endpoint: string; multiple?: boolean; query?: string; labelKey?: string };
  links?: LinkSource;
  /** Row shape for a `repeater`. */
  item?: RepeaterField[];
  /** Hard cap on rows, mirroring the server's `.max()` on the array. */
  maxItems?: number;
  /** Gives each row an upload in an indexed slot: row 0 → `trustImage0`. */
  rowImage?: { slotPrefix: string; label: string; valuePath: string; aspect?: string };
  /** Ratio of the container on the public site, as CSS `aspect-ratio`. Preview only. */
  aspect?: string;
  /** Number of files an `images` slot accepts. */
  count?: number;
  /** Accepted media. `media` also allows video; mirrors the per-field rule in slotUpload.js. */
  accept?: 'image' | 'media';
  /** Client-side size guard, mirroring the multer limit on that route. */
  maxSizeMB?: number;
  /** Shown under an image field when uploading replaces what is already stored. */
  replaceWarning?: string;
};

export type ResourceConfig = {
  key: string;
  label: string;
  /** One line under the page title, explaining where this content appears on the site. */
  description?: string;
  /** API path under /api/v1. */
  endpoint: string;
  kind: 'collection' | 'singleton';
  /**
   * Admin read path when it differs from the write path — the promo's public GET
   * returns null while the campaign is off, which would render as a blank form.
   */
  readEndpoint?: string;
  /** Extra query string for the admin list (admin sees inactive rows too). */
  listQuery?: string;
  listColumns?: { name: string; label: string }[];
  /** Show a filter box above the list. Worth it once a list can run long. */
  searchable?: boolean;
  fields: AdminField[];
  /** Shown when the list is empty — the normal state on a fresh install. */
  emptyHint?: string;
  /** Banner above the screen, for fields that save but the public site does not read. */
  notice?: string;
};

// ---------------------------------------------------------------------------
// Shared pieces
// ---------------------------------------------------------------------------

const ACTIVE_FIELD: AdminField = {
  name: 'isActive',
  label: 'مُفعّل',
  type: 'boolean',
  help: 'إخفاء العنصر من الموقع دون حذفه.',
};

const ORDER_FIELD: AdminField = {
  name: 'order',
  label: 'الترتيب',
  type: 'number',
  min: 0,
  help: 'الأصغر يظهر أولاً.',
};

const SLUG_FIELD: AdminField = {
  name: 'slug',
  label: 'الرابط (slug)',
  type: 'text',
  maxLength: 200,
  pattern: {
    test: /^[\p{L}\p{N}-]*$/u,
    message: 'الرابط يقبل الحروف والأرقام والشرطات فقط — بدون مسافات أو رموز.',
  },
  help: 'اتركه فارغاً ليُشتق من العنوان. تغييره يغيّر رابط الصفحة ويكسر الروابط القديمة.',
};

/**
 * Public pages, by the name an admin knows them by. Paths are declared in
 * `src/data/routes.ts` and are frontend-owned — offered as a list so no internal route
 * string is ever typed by hand. Keep in sync with `topRoutes` / `subRoutes` there.
 */
export const SITE_PAGES: Option[] = [
  { value: '/', label: 'الصفحة الرئيسية' },
  { value: '/خدمات', label: 'الخدمات' },
  { value: '/فروعنا', label: 'الفروع' },
  { value: '/معرض-الفيديو', label: 'معرض الفيديو' },
  { value: '/معرض-الفيديو/معرض-الصور', label: 'معرض الصور' },
  { value: '/Packages/عروض-حماية-السيارات', label: 'صفحة العروض' },
  { value: '/المدونة', label: 'المدونة' },
  { value: '/shop', label: 'المتجر' },
  { value: '/من-نحن', label: 'من نحن' },
  { value: '/سياسة-الضمان', label: 'سياسة الضمان' },
  { value: '/الأسئلة-الشائعة', label: 'الأسئلة الشائعة' },
  { value: '/تواصل-معنا', label: 'تواصل معنا' },
];

/** Glyphs `components/ui/Icon.tsx` can actually draw, named for what they mean here. */
export const ICON_OPTIONS: Option[] = [
  { value: 'check', label: '✔ علامة صح' },
  { value: 'playCircle', label: '▶ تشغيل فيديو' },
  { value: 'images', label: '🖼 صور' },
  { value: 'video', label: '🎬 فيديو' },
  { value: 'pin', label: '📍 موقع' },
  { value: 'phone', label: '📞 هاتف' },
  { value: 'mail', label: '✉ بريد' },
  { value: 'clock', label: '🕐 وقت' },
  { value: 'calendar', label: '📅 تاريخ' },
  { value: 'mapMarked', label: '🗺 خريطة' },
  { value: 'arrowCircle', label: '➜ سهم' },
];

/** The `{title, body}` pair the service intro points and benefit cards both use. */
const TITLE_BODY_ROW: RepeaterField[] = [
  { name: 'title', label: 'العنوان', type: 'text', required: true, maxLength: 200 },
  { name: 'body', label: 'النص', type: 'textarea', maxLength: 2000, span: 2 },
];

// ---------------------------------------------------------------------------
// Resources
// ---------------------------------------------------------------------------

export const RESOURCES: ResourceConfig[] = [
  // ---------------------------------------------------------------- services
  {
    key: 'services',
    label: 'الخدمات',
    description: 'كل خدمة لها صفحة خاصة على الموقع، وتظهر في القائمة وفي سلايدر الصفحة الرئيسية.',
    endpoint: '/services',
    kind: 'collection',
    searchable: true,
    listColumns: [
      { name: 'title', label: 'الخدمة' },
      { name: 'slug', label: 'الرابط' },
      { name: 'order', label: 'الترتيب' },
    ],
    emptyHint: 'لا توجد خدمات بعد. أضف أول خدمة لتظهر في الصفحة الرئيسية وصفحة الخدمات.',
    fields: [
      { name: 'title', label: 'اسم الخدمة (البطاقات والقوائم)', type: 'text', required: true, maxLength: 200 },
      SLUG_FIELD,
      { name: 'heading', label: 'العنوان الرئيسي في صفحة الخدمة', type: 'text', maxLength: 300 },
      { name: 'tagline', label: 'وصف مختصر (سطران)', type: 'textarea', maxLength: 500 },
      { name: 'enquiry', label: 'نص استفسار واتساب', type: 'text', maxLength: 300, help: 'الرسالة الجاهزة التي تُفتح في واتساب عند الضغط على زر الاستفسار.' },
      {
        name: 'category', label: 'التصنيف', type: 'relation',
        relation: { endpoint: '/categories', query: 'type=service' },
        help: 'التصنيفات تُدار من صفحة «التصنيفات».',
      },
      // Four named slots, one per fixed container in the service layout.
      { name: 'heroImage', label: 'الصورة الرئيسية (مربعة)', type: 'image', aspect: '1/1', maxSizeMB: 10 },
      // Alt text per slot; falls back to the service title when blank.
      { name: 'heroImageAlt', label: 'وصف الصورة الرئيسية', type: 'text', maxLength: 300, help: 'اتركه فارغاً لاستخدام اسم الخدمة.' },
      { name: 'wideImage', label: 'صورة عريضة (فهرس الخدمات)', type: 'image', aspect: '16/10', maxSizeMB: 10 },
      { name: 'wideImageAlt', label: 'وصف الصورة العريضة', type: 'text', maxLength: 300, help: 'اتركه فارغاً لاستخدام اسم الخدمة.' },
      { name: 'gridImage', label: 'صورة السلايدر (طولية)', type: 'image', aspect: '3/4', maxSizeMB: 10 },
      { name: 'gridImageAlt', label: 'وصف صورة السلايدر', type: 'text', maxLength: 300, help: 'اتركه فارغاً لاستخدام اسم الخدمة.' },
      {
        name: 'collage', label: 'صور المزايا', type: 'images', count: 3, aspect: '1/1', maxSizeMB: 10,
        help: 'ثلاث صور تظهر بجانب قسم المزايا.',
        replaceWarning: 'رفع صور جديدة يستبدل الصور الثلاث الحالية بالكامل.',
      },
      { name: 'introHeading', label: 'عنوان المقدمة', type: 'text', maxLength: 300 },
      { name: 'introBody', label: 'نص المقدمة', type: 'textarea' },
      {
        name: 'introPoints', label: 'نقاط المقدمة', type: 'repeater',
        item: TITLE_BODY_ROW, maxItems: 6,
        help: 'كل نقطة تظهر كبطاقة صغيرة أسفل المقدمة.',
      },
      { name: 'primaryCta', label: 'زر الدعوة الأول', type: 'text', maxLength: 300 },
      { name: 'benefitsHeading', label: 'عنوان المزايا', type: 'text', maxLength: 300 },
      {
        name: 'benefits', label: 'المزايا', type: 'repeater',
        item: TITLE_BODY_ROW, maxItems: 12,
        help: 'كل ميزة تظهر كبطاقة في قسم المزايا.',
      },
      { name: 'secondaryCta', label: 'زر الدعوة الثاني', type: 'text', maxLength: 300 },
      {
        name: 'features', label: 'مميزات سريعة', type: 'tags',
        help: 'اكتب الميزة ثم اضغط Enter لإضافتها. تظهر كقائمة نقاط قصيرة.',
      },
      { name: 'isFeatured', label: 'يظهر في سلايدر الرئيسية', type: 'boolean' },
      ORDER_FIELD,
      ACTIVE_FIELD,
    ],
  },

  // -------------------------------------------------------------- categories
  {
    key: 'categories',
    label: 'التصنيفات',
    description: 'التصنيفات تربط المقالات والمنتجات والخدمات، وتظهر في القوائم الجانبية.',
    endpoint: '/categories',
    kind: 'collection',
    searchable: true,
    listColumns: [
      { name: 'name', label: 'التصنيف' },
      { name: 'type', label: 'النوع' },
      { name: 'slug', label: 'الرابط' },
    ],
    emptyHint: 'لا توجد تصنيفات بعد. أضف تصنيفاً لتتمكن من ربط المقالات والمنتجات والخدمات به.',
    fields: [
      { name: 'name', label: 'الاسم', type: 'text', required: true, maxLength: 150 },
      SLUG_FIELD,
      {
        name: 'type', label: 'النوع', type: 'select', required: true,
        help: 'يحدد أين يظهر التصنيف: مع الخدمات أو المنتجات أو المقالات.',
        options: [
          { value: 'service', label: 'خدمات' },
          { value: 'product', label: 'منتجات' },
          { value: 'blog', label: 'مقالات' },
        ],
      },
      { name: 'description', label: 'الوصف', type: 'textarea', maxLength: 1000 },
      ORDER_FIELD,
      ACTIVE_FIELD,
    ],
  },

  // ------------------------------------------------------------- blog posts
  {
    key: 'blog-posts',
    label: 'المقالات',
    description: 'مقالات المدونة. كل مقال يظهر على رابط خاص به وفي شبكة المدونة.',
    endpoint: '/blog-posts',
    kind: 'collection',
    searchable: true,
    listColumns: [
      { name: 'title', label: 'المقال' },
      { name: 'slug', label: 'الرابط' },
    ],
    emptyHint: 'لا توجد مقالات بعد. صفحة المدونة ستظهر فارغة حتى تنشر أول مقال.',
    fields: [
      { name: 'title', label: 'العنوان', type: 'text', required: true, maxLength: 200 },
      SLUG_FIELD,
      { name: 'excerpt', label: 'مقتطف (بطاقة المقال)', type: 'textarea', maxLength: 300 },
      {
        name: 'content', label: 'المحتوى', type: 'html', required: true,
        help: 'يُسمح بوسوم HTML أساسية فقط (فقرات، عناوين، قوائم، روابط، صور)؛ يُنقّى الباقي على الخادم.',
      },
      {
        name: 'categories', label: 'التصنيفات', type: 'relation',
        relation: { endpoint: '/categories', multiple: true, query: 'type=blog' },
        help: 'اختر تصنيفاً أو أكثر. التصنيفات من نوع «مقالات» فقط تظهر هنا.',
      },
      {
        name: 'tags', label: 'الوسوم', type: 'tags',
        help: 'اكتب الوسم ثم اضغط Enter. الوسوم كلمات مفتاحية قصيرة تصف المقال.',
      },
      { name: 'coverImage', label: 'صورة الغلاف', type: 'image', aspect: '16/10', maxSizeMB: 10 },
      { name: 'coverImageAlt', label: 'وصف صورة الغلاف', type: 'text', maxLength: 300, help: 'يُقرأ لضعاف البصر ويظهر إن تعذّر تحميل الصورة.' },
      { name: 'isPublished', label: 'منشور', type: 'boolean', help: 'أوقفه لحفظ المقال كمسودة لا تظهر على الموقع.' },
    ],
  },

  // ---------------------------------------------------------------- products
  {
    key: 'products',
    label: 'المنتجات',
    description: 'كتالوج المتجر. لا تُعرض الأسعار على الموقع — الطلب يتم عبر واتساب.',
    endpoint: '/products',
    kind: 'collection',
    searchable: true,
    listColumns: [
      { name: 'name', label: 'المنتج' },
      { name: 'slug', label: 'الرابط' },
    ],
    emptyHint: 'لا توجد منتجات بعد. المتجر عبارة عن كتالوج — أضف أول منتج ليظهر فيه.',
    fields: [
      { name: 'name', label: 'الاسم', type: 'text', required: true, maxLength: 200 },
      SLUG_FIELD,
      { name: 'excerpt', label: 'مقتطف (بطاقة المنتج)', type: 'textarea', maxLength: 500 },
      { name: 'shortDescription', label: 'وصف مختصر (بجانب الصور)', type: 'html', maxLength: 2000 },
      { name: 'description', label: 'الوصف الكامل', type: 'html' },
      {
        name: 'category', label: 'التصنيف', type: 'relation',
        relation: { endpoint: '/categories', query: 'type=product' },
      },
      // Capped at 8 to match `uploaders.productImages.array('images', 8)` on the route.
      {
        name: 'images', label: 'صور المنتج', type: 'images', count: 8, aspect: '1/1', maxSizeMB: 5,
        help: 'أول صورة هي صورة البطاقة في قائمة المتجر.',
        replaceWarning: 'رفع صور جديدة يستبدل جميع صور المنتج الحالية.',
      },
      { name: 'isFeatured', label: 'مميز', type: 'boolean' },
      ACTIVE_FIELD,
    ],
  },

  // ----------------------------------------------------------------- gallery
  {
    key: 'gallery',
    label: 'معرض الأعمال',
    description: 'صور الأعمال ومقاطع اليوتيوب القصيرة، معروضة في معرض الصور ومعرض الفيديو.',
    endpoint: '/gallery',
    kind: 'collection',
    searchable: true,
    listColumns: [
      { name: 'title', label: 'العنوان' },
      { name: 'type', label: 'النوع' },
    ],
    emptyHint: 'لا توجد عناصر بعد. أضف صورة عمل أو مقطع يوتيوب قصير.',
    fields: [
      { name: 'title', label: 'العنوان', type: 'text', maxLength: 200 },
      {
        name: 'type', label: 'النوع', type: 'select', required: true,
        // Not in the gallery service's UPDATABLE_FIELDS — the stored media is immutable.
        help: 'الصور تظهر في معرض الصور، والفيديو في معرض الفيديو. لا يمكن تغيير النوع بعد الإضافة — احذف العنصر وأضِفه من جديد.',
        options: [
          { value: 'image', label: 'صورة (معرض الصور)' },
          { value: 'video', label: 'فيديو يوتيوب (معرض الفيديو)' },
        ],
      },
      // `file` is the multer field name on the gallery route.
      {
        name: 'file', label: 'الصورة', type: 'image', aspect: '1/1', maxSizeMB: 50,
        help: 'مطلوبة لعناصر الصور فقط. عناصر الفيديو تستخدم معرّف يوتيوب بدلاً منها.',
      },
      {
        name: 'externalId', label: 'معرّف فيديو يوتيوب', type: 'text', maxLength: 11,
        placeholder: 'sS9qCj6cqrU',
        pattern: {
          test: /^[A-Za-z0-9_-]{11}$/,
          message: 'أدخل المعرّف فقط (11 خانة) وليس الرابط الكامل — مثال: sS9qCj6cqrU.',
        },
        help: 'لعناصر الفيديو: الجزء الأخير من رابط الـ Short، بعد آخر شرطة مائلة.',
      },
      { name: 'description', label: 'الوصف', type: 'textarea', maxLength: 2000 },
      { name: 'alt', label: 'وصف الصورة (بديل)', type: 'text', maxLength: 300, help: 'يُقرأ لضعاف البصر ويظهر إن تعذّر تحميل الصورة.' },
      {
        // Destination picked by name; the path is derived.
        name: 'href', label: 'الصفحة التي يفتحها العنصر', type: 'link',
        links: {
          pages: true,
          fromResource: { endpoint: '/services', prefix: '/خدمات/', labelKey: 'title' },
        },
        help: 'اختياري. معرض الصور يربط كل صورة بصفحة خدمة.',
      },
      ORDER_FIELD,
      ACTIVE_FIELD,
    ],
  },

  // ---------------------------------------------------------------- branches
  {
    key: 'branches',
    label: 'الفروع',
    description: 'بيانات الفروع. السجل الواحد يغذّي دبوس الخريطة وبطاقة الفرع أسفلها معاً.',
    endpoint: '/branches',
    kind: 'collection',
    searchable: true,
    listColumns: [
      { name: 'name', label: 'الفرع' },
      { name: 'city', label: 'المدينة' },
      { name: 'phone', label: 'الهاتف' },
    ],
    emptyHint: 'لا توجد فروع بعد. أضف فرعاً ليظهر في الخريطة وفي القائمة أسفلها.',
    fields: [
      { name: 'name', label: 'اسم الفرع', type: 'text', required: true, maxLength: 200 },
      { name: 'city', label: 'المدينة', type: 'text', maxLength: 120, help: 'الفروع تُجمَّع حسب المدينة في صفحة الفروع.' },
      { name: 'address', label: 'العنوان', type: 'text', maxLength: 500 },
      { name: 'phone', label: 'الهاتف', type: 'text', maxLength: 40, placeholder: '0555555555' },
      { name: 'whatsapp', label: 'واتساب', type: 'text', maxLength: 40, placeholder: '966555555555' },
      {
        name: 'mapUrl', label: 'رابط خرائط جوجل', type: 'text', maxLength: 1000,
        placeholder: 'https://maps.app.goo.gl/…',
        pattern: { test: /^https?:\/\/.+/i, message: 'أدخل رابطاً كاملاً يبدأ بـ https://' },
        help: 'الرابط الذي يفتحه زر «الخريطة» في بطاقة الفرع.',
      },
      { name: 'workingHours', label: 'ساعات العمل', type: 'text', maxLength: 200, placeholder: 'السبت – الخميس، 9 ص – 11 م' },
      // Pin position on the map image. Both halves are required for a pin to render.
      {
        name: 'pin.top', label: 'موضع الدبوس على الخريطة — من الأعلى', type: 'percent',
        help: 'نسبة من ارتفاع صورة الخريطة. اتركه فارغاً إن لم ترغب بإظهار دبوس لهذا الفرع.',
      },
      {
        name: 'pin.start', label: 'موضع الدبوس على الخريطة — من الجهة اليمنى', type: 'percent',
        help: 'نسبة من عرض صورة الخريطة. يجب تعبئة الحقلين معاً ليظهر الدبوس.',
      },
      ORDER_FIELD,
      ACTIVE_FIELD,
    ],
  },

  // -------------------------------------------------------------------- faqs
  {
    key: 'faqs',
    label: 'الأسئلة الشائعة',
    description: 'تظهر في صفحة الأسئلة الشائعة كقائمة قابلة للطي.',
    endpoint: '/faqs',
    kind: 'collection',
    searchable: true,
    listColumns: [{ name: 'question', label: 'السؤال' }],
    emptyHint: 'لا توجد أسئلة بعد. أضف أول سؤال لتظهر الصفحة بمحتوى.',
    fields: [
      { name: 'question', label: 'السؤال', type: 'text', required: true, maxLength: 300 },
      { name: 'answer', label: 'الإجابة', type: 'textarea', required: true },
      ORDER_FIELD,
      ACTIVE_FIELD,
    ],
  },

  // ---------------------------------------------------------------- partners
  {
    key: 'partners',
    label: 'شركاء النجاح',
    description: 'شريط الشعارات في الصفحة الرئيسية.',
    endpoint: '/partners',
    kind: 'collection',
    listColumns: [{ name: 'name', label: 'الشريك' }],
    emptyHint: 'لا يوجد شركاء بعد. أضف شريكاً ليظهر شعاره في الصفحة الرئيسية.',
    fields: [
      { name: 'name', label: 'الاسم', type: 'text', required: true, maxLength: 150 },
      {
        // Server-side: `logo_is_required`.
        name: 'logo', label: 'الشعار', type: 'image', required: true,
        aspect: '3/2', maxSizeMB: 1,
        help: 'يُفضّل شعار بخلفية شفافة (PNG أو WEBP). الحد الأقصى 1 ميغابايت.',
      },
      ORDER_FIELD,
      ACTIVE_FIELD,
    ],
  },

  // ----------------------------------------------------------------- reviews
  {
    key: 'reviews',
    label: 'تقييمات جوجل',
    description: 'صور من واجهة تقييمات جوجل، تظهر في سلايدر التقييمات بالصفحة الرئيسية.',
    endpoint: '/reviews',
    kind: 'collection',
    listColumns: [{ name: 'alt', label: 'الوصف' }],
    emptyHint: 'لا توجد تقييمات بعد. ارفع لقطة شاشة من تقييمات جوجل.',
    fields: [
      {
        // Server-side: `image_is_required`.
        name: 'image', label: 'صورة التقييم', type: 'image', required: true,
        aspect: '4/3', maxSizeMB: 10,
      },
      {
        name: 'alt', label: 'الوصف (مطلوب للوصولية)', type: 'text', required: true, maxLength: 300,
        help: 'الصورة لقطة شاشة، فالوصف هو النص الوحيد الذي يصل لضعاف البصر.',
      },
      ORDER_FIELD,
      ACTIVE_FIELD,
    ],
  },

  // ---------------------------------------------------------------- packages
  {
    key: 'packages',
    label: 'العروض',
    description: 'بطاقات العروض في صفحة العروض. الضغط عليها يفتح واتساب برسالة جاهزة.',
    endpoint: '/packages',
    kind: 'collection',
    searchable: true,
    listColumns: [{ name: 'title', label: 'العرض' }],
    emptyHint: 'لا توجد عروض بعد. أضف عرضاً ليظهر في صفحة العروض.',
    fields: [
      { name: 'title', label: 'عنوان العرض', type: 'text', required: true, maxLength: 200 },
      SLUG_FIELD,
      { name: 'description', label: 'نص استفسار واتساب', type: 'textarea', help: 'الرسالة الجاهزة التي تُفتح في واتساب عند الضغط على البطاقة.' },
      { name: 'image', label: 'صورة العرض', type: 'image', aspect: '4/5', maxSizeMB: 10 },
      {
        name: 'service', label: 'الخدمة المرتبطة', type: 'relation',
        relation: { endpoint: '/services', labelKey: 'title' },
        help: 'اختياري — يربط العرض بخدمة قائمة.',
      },
      ORDER_FIELD,
      ACTIVE_FIELD,
    ],
  },

  // ---------------------------------------------------------------- warranty
  {
    key: 'warranty',
    label: 'سياسة الضمان',
    description: 'كل مجموعة تظهر كتبويب في صفحة الضمان، وبداخلها فئات الضمان وبنودها.',
    endpoint: '/warranty',
    kind: 'collection',
    listColumns: [{ name: 'title', label: 'المجموعة' }],
    emptyHint: 'لا توجد مجموعات ضمان بعد. أضف مجموعة لتظهر كتبويب في صفحة الضمان.',
    fields: [
      { name: 'title', label: 'اسم المجموعة (التبويب)', type: 'text', required: true, maxLength: 200 },
      SLUG_FIELD,
      { name: 'intro', label: 'مقدمة', type: 'textarea', maxLength: 2000 },
      {
        // Array of objects, each with its own nested array of terms.
        name: 'tiers', label: 'فئات الضمان', type: 'repeater', maxItems: 20,
        help: 'كل فئة صف في جدول الضمان. البنود تُضاف واحداً واحداً داخل الفئة.',
        item: [
          { name: 'title', label: 'اسم الفئة', type: 'text', required: true, maxLength: 200, placeholder: 'PPF' },
          { name: 'warranty', label: 'مدة الضمان', type: 'text', maxLength: 500, placeholder: '10 سنوات' },
          { name: 'maintenance', label: 'الصيانة', type: 'textarea', maxLength: 1000, placeholder: 'لا يتطلب صيانة', span: 2 },
          { name: 'terms', label: 'بنود الفئة', type: 'stringList', span: 2, help: 'بند واحد في كل سطر.' },
        ],
      },
      ORDER_FIELD,
      ACTIVE_FIELD,
    ],
  },

  // ------------------------------------------------------- singletons: home
  {
    key: 'home',
    label: 'الصفحة الرئيسية',
    description: 'محتوى الصفحة الرئيسية: الغلاف والبطاقات وشارات الثقة والأرقام.',
    endpoint: '/home',
    kind: 'singleton',
    fields: [
      { name: 'heroVideo', label: 'فيديو الغلاف', type: 'image', accept: 'media', aspect: '21/9', maxSizeMB: 50, help: 'MP4 أو WebM. الحد الأقصى 50 ميغابايت.' },
      { name: 'heroPoster', label: 'صورة الغلاف (قبل تشغيل الفيديو)', type: 'image', aspect: '21/9', maxSizeMB: 10 },
      { name: 'hero.ctaLabel', label: 'نص زر الغلاف', type: 'text', maxLength: 120 },
      { name: 'hero.ctaText', label: 'نص واتساب لزر الغلاف', type: 'text', maxLength: 300 },

      { name: 'heroTiles.servicesLabel', label: 'عنوان بطاقة الخدمات', type: 'text', maxLength: 120 },

      { name: 'heroTiles.branches.label', label: 'عنوان بطاقة الفروع', type: 'text', maxLength: 120 },
      // No `heroTiles.branches.href`: the path is fixed in routes.ts and defaulted in
      // data/home.ts. Branch content is edited on the branches screen.
      { name: 'branchesTileImage', label: 'صورة بطاقة الفروع', type: 'image', aspect: '3/4', maxSizeMB: 10 },
      // HeroGrid and WhyUs render these alt attributes with no fallback.
      { name: 'heroTiles.branches.image.alt', label: 'وصف صورة بطاقة الفروع', type: 'text', maxLength: 300 },

      { name: 'heroTiles.gallery.label', label: 'عنوان بطاقة الأعمال', type: 'text', maxLength: 120 },
      { name: 'galleryTileImage', label: 'صورة بطاقة الأعمال', type: 'image', aspect: '3/4', maxSizeMB: 10 },
      { name: 'heroTiles.gallery.image.alt', label: 'وصف صورة بطاقة الأعمال', type: 'text', maxLength: 300 },
      {
        name: 'heroTiles.gallery.actions', label: 'أزرار بطاقة الأعمال', type: 'repeater', maxItems: 4,
        help: 'زرّان عادةً: الفيديو والصور. اختر الصفحة من القائمة — لا حاجة لكتابة أي رابط.',
        item: [
          { name: 'label', label: 'نص الزر', type: 'text', required: true, maxLength: 120 },
          { name: 'href', label: 'الصفحة', type: 'link', links: { pages: true } },
          { name: 'icon', label: 'الأيقونة', type: 'icon' },
        ],
      },

      {
        name: 'trust', label: 'شارات الثقة', type: 'repeater', maxItems: 3,
        help: 'ثلاث شارات كحد أقصى. صورة كل شارة تُرفع من داخل صفّها.',
        item: [
          { name: 'head', label: 'العنوان', type: 'text', maxLength: 120, required: true },
          { name: 'sub', label: 'السطر الثاني', type: 'text', maxLength: 120 },
          { name: 'icon', label: 'الأيقونة (تُستخدم إن لم توجد صورة)', type: 'icon' },
          { name: 'alt', label: 'وصف الصورة', type: 'text', maxLength: 300, span: 2, from: 'image.alt' },
        ],
        // Row N → the `trustImageN` slot in HOME_SLOTS.
        rowImage: { slotPrefix: 'trustImage', label: 'صورة الشارة', valuePath: 'image.url', aspect: '1/1' },
      },

      { name: 'whyUs.heading', label: 'عنوان «لماذا تختارنا»', type: 'text', maxLength: 300 },
      { name: 'whyUs.description', label: 'وصف «لماذا تختارنا»', type: 'textarea', maxLength: 2000 },
      { name: 'whyUsImage', label: 'صورة «لماذا تختارنا»', type: 'image', aspect: '4/3', maxSizeMB: 10 },
      { name: 'whyUs.image.alt', label: 'وصف صورة «لماذا تختارنا»', type: 'text', maxLength: 300 },
      {
        name: 'whyUs.points', label: 'النقاط', type: 'stringList', maxItems: 20,
        help: 'كل نقطة تظهر بجانب علامة صح.',
      },
      { name: 'whyUs.ctaLabel', label: 'نص الزر', type: 'text', maxLength: 120 },

      {
        name: 'stats', label: 'الأرقام', type: 'repeater', maxItems: 6,
        help: 'الأرقام التي تظهر في شريط الإحصائيات.',
        item: [
          { name: 'value', label: 'الرقم', type: 'number', required: true },
          { name: 'suffix', label: 'لاحقة', type: 'text', maxLength: 10, placeholder: '+' },
          { name: 'title', label: 'الوصف', type: 'text', maxLength: 120, required: true, span: 2, placeholder: 'سنة خبرة' },
        ],
      },

      { name: 'reviewsIntro.heading', label: 'عنوان التقييمات', type: 'text', maxLength: 300 },
      { name: 'reviewsIntro.description', label: 'وصف التقييمات', type: 'textarea', maxLength: 2000 },
      { name: 'contactBlock.heading', label: 'عنوان نموذج التواصل', type: 'text', maxLength: 300 },
      { name: 'contactBlock.subheading', label: 'وصف نموذج التواصل', type: 'text', maxLength: 500 },
      { name: 'contactBlock.formTitle', label: 'عنوان زر النموذج', type: 'text', maxLength: 120 },
    ],
  },

  // ------------------------------------------------------ singletons: promo
  {
    key: 'promo',
    label: 'النافذة الترويجية',
    description: 'نافذة تظهر للزائر بعد فترة قصيرة من دخوله الموقع.',
    endpoint: '/promo',
    readEndpoint: '/promo/admin',
    kind: 'singleton',
    fields: [
      { name: 'image', label: 'صورة العرض', type: 'image', aspect: '3/2', maxSizeMB: 10 },
      { name: 'alt', label: 'وصف الصورة', type: 'text', maxLength: 300 },
      { name: 'whatsappText', label: 'نص واتساب', type: 'text', maxLength: 300 },
      {
        name: 'delayMs', label: 'التأخير قبل الظهور (بالمللي ثانية)', type: 'number',
        min: 0, max: 30000, placeholder: '3000',
        help: '1000 = ثانية واحدة. الحد الأقصى 30000 (نصف دقيقة).',
      },
      {
        name: 'isActive', label: 'الحملة تعمل', type: 'boolean',
        help: 'إيقافها يخفي النافذة فوراً دون حذف الصورة.',
      },
    ],
  },

  // ------------------------------------------------ singletons: offers page
  {
    key: 'offers-page',
    label: 'صفحة العروض',
    description: 'بانر ونصوص صفحة العروض. بطاقات العروض نفسها تُدار من «العروض».',
    endpoint: '/offers-page',
    kind: 'singleton',
    fields: [
      { name: 'banner', label: 'البانر', type: 'image', aspect: '21/9', maxSizeMB: 10 },
      { name: 'bannerAlt', label: 'وصف البانر', type: 'text', maxLength: 300 },
      { name: 'intro', label: 'المقدمة', type: 'textarea', maxLength: 4000 },
      { name: 'formHeading', label: 'عنوان النموذج', type: 'text', maxLength: 300 },
      { name: 'formSubheading', label: 'وصف النموذج', type: 'text', maxLength: 500 },
    ],
  },

  // ------------------------------------------------- singletons: blog intro
  {
    key: 'blog-intro',
    label: 'مقدمة المدونة',
    description: 'البانر والنص أعلى شبكة المقالات.',
    endpoint: '/blog-intro',
    kind: 'singleton',
    fields: [
      { name: 'heading', label: 'العنوان', type: 'text', maxLength: 300 },
      { name: 'description', label: 'الوصف', type: 'textarea', maxLength: 2000 },
      { name: 'image', label: 'الصورة', type: 'image', aspect: '16/10', maxSizeMB: 10 },
      { name: 'imageAlt', label: 'وصف الصورة', type: 'text', maxLength: 300 },
    ],
  },

  // ---------------------------------------------- singletons: gallery intro
  {
    key: 'gallery-intro',
    label: 'مقدمة المعرض',
    description: 'العناوين والنصوص أعلى معرض الفيديو ومعرض الصور.',
    endpoint: '/gallery-intro',
    kind: 'singleton',
    fields: [
      { name: 'video.heading', label: 'عنوان معرض الفيديو', type: 'text', maxLength: 300 },
      { name: 'video.description', label: 'وصف معرض الفيديو', type: 'textarea', maxLength: 2000 },
      { name: 'photo.heading', label: 'عنوان معرض الصور', type: 'text', maxLength: 300 },
      { name: 'photo.description', label: 'وصف معرض الصور', type: 'textarea', maxLength: 2000 },
    ],
  },

  // --------------------------------------------------- singletons: settings
  {
    key: 'settings',
    label: 'إعدادات الموقع',
    description: 'الهوية وبيانات التواصل وروابط التواصل الاجتماعي.',
    endpoint: '/settings',
    kind: 'singleton',
    notice:
      'الشعار يُقرأ من هنا: ارفعه وسيظهر في رأس الموقع خلال دقيقة. بقية الحقول تُحفظ ' +
      'بشكل صحيح لكن الموقع العام لا يقرأها بعد — لا يزال يستخدم قيم الهوية الثابتة في ' +
      'الكود (رقم الهاتف والواتساب وروابط التواصل). ربطها يحتاج خطوة تطوير إضافية. ' +
      'أما «من نحن» والأرقام وسياسة الضمان فتُدار حالياً من صفحة «الصفحة الرئيسية» ' +
      'و«سياسة الضمان».',
    fields: [
      { name: 'siteName', label: 'اسم الموقع', type: 'text', maxLength: 150 },
      { name: 'siteNameFull', label: 'الاسم الكامل', type: 'text', maxLength: 200 },
      { name: 'tagline', label: 'الشعار النصي', type: 'text', maxLength: 300 },
      { name: 'description', label: 'وصف الموقع (SEO)', type: 'textarea', maxLength: 2000 },
      {
        name: 'siteUrl', label: 'رابط الموقع', type: 'text', maxLength: 300,
        placeholder: 'https://3mmile.sa',
        pattern: { test: /^https?:\/\/.+/i, message: 'أدخل رابطاً كاملاً يبدأ بـ https://' },
      },
      { name: 'logo', label: 'الشعار', type: 'image', aspect: '3/1', maxSizeMB: 10 },
      { name: 'logo.alt', label: 'وصف الشعار', type: 'text', maxLength: 300 },
      { name: 'contactPhone', label: 'رقم الهاتف', type: 'text', maxLength: 40, placeholder: '0555555555' },
      {
        name: 'whatsappNumber', label: 'رقم واتساب', type: 'text', maxLength: 40,
        placeholder: '966555555555',
        pattern: { test: /^\d{8,15}$/, message: 'أرقام فقط بالصيغة الدولية وبدون + أو مسافات — مثال: 966555555555.' },
      },
      {
        name: 'contactEmail', label: 'البريد الإلكتروني', type: 'text', maxLength: 200,
        pattern: { test: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'أدخل بريداً إلكترونياً صحيحاً.' },
      },
      { name: 'workingHours', label: 'ساعات العمل', type: 'text', maxLength: 200 },
      { name: 'mapsEmbedId', label: 'معرّف خريطة جوجل', type: 'text', maxLength: 200 },
      { name: 'rating.score', label: 'التقييم', type: 'text', maxLength: 10, placeholder: '4.9' },
      { name: 'rating.reviewCount', label: 'عدد التقييمات', type: 'number', min: 0 },
      { name: 'aboutTitle', label: 'عنوان «من نحن»', type: 'text' },
      { name: 'aboutDescription', label: 'وصف «من نحن»', type: 'textarea' },
      { name: 'aboutImage', label: 'صورة «من نحن»', type: 'image', aspect: '4/3', maxSizeMB: 10 },
      {
        name: 'aboutFeatures', label: 'نقاط «من نحن»', type: 'tags',
        help: 'اكتب النقطة ثم اضغط Enter لإضافتها.',
      },
      { name: 'warrantyPolicy', label: 'نص سياسة الضمان', type: 'textarea' },
      { name: 'socialLinks.facebook', label: 'فيسبوك', type: 'text', placeholder: 'https://facebook.com/…' },
      { name: 'socialLinks.instagram', label: 'إنستغرام', type: 'text', placeholder: 'https://instagram.com/…' },
      { name: 'socialLinks.tiktok', label: 'تيك توك', type: 'text', placeholder: 'https://tiktok.com/@…' },
      { name: 'socialLinks.snapchat', label: 'سناب شات', type: 'text' },
      { name: 'socialLinks.youtube', label: 'يوتيوب', type: 'text' },
      { name: 'socialLinks.twitter', label: 'إكس', type: 'text' },
    ],
  },
];

export const findResource = (key: string) => RESOURCES.find((r) => r.key === key);

/**
 * Wire-name → Arabic-label map, including repeater sub-fields. Lets `lib/admin/errors.ts`
 * report a failure on `tiers.0.title` against the label and row number the admin sees.
 */
export const fieldLabels = (config: ResourceConfig): Record<string, string> => {
  const labels: Record<string, string> = {};
  for (const field of config.fields) {
    labels[field.name] = field.label;
    for (const sub of field.item ?? []) {
      labels[`${field.name}.${sub.name}`] = `${field.label} — ${sub.label}`;
    }
  }
  return labels;
};

/** Sidebar grouping, by the part of the site each screen edits. */
export const NAV_GROUPS: { title: string; keys: string[] }[] = [
  { title: 'الصفحة الرئيسية', keys: ['home', 'reviews', 'partners'] },
  { title: 'الخدمات والأعمال', keys: ['services', 'gallery', 'gallery-intro', 'warranty'] },
  { title: 'المدونة والمتجر', keys: ['blog-posts', 'blog-intro', 'products', 'categories'] },
  { title: 'العروض والتسويق', keys: ['packages', 'offers-page', 'promo'] },
  { title: 'بيانات الشركة', keys: ['branches', 'faqs', 'settings'] },
];
