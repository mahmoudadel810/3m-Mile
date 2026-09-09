/** Header and footer menus, transcribed from the live markup. */

export type NavItem = {
  label: string;
  href: string;
  children?: { label: string; href: string; icon?: 'video' | 'images' }[];
};

export const mainNav: NavItem[] = [
  { label: 'الرئيسية', href: '/' },
  { label: 'من نحن', href: '/من-نحن' },
  {
    label: 'سابقة اعمالنا',
    href: '#',
    children: [
      { label: 'صور', href: '/معرض-الفيديو/معرض-الصور', icon: 'images' },
      { label: 'فيديو', href: '/معرض-الفيديو', icon: 'video' },
    ],
  },
  { label: 'خدماتنا', href: '/خدمات' },
  { label: 'منتجاتنا', href: '/shop' },
  { label: 'العروض', href: '/Packages/عروض-حماية-السيارات' },
  { label: 'فروعنا', href: '/فروعنا' },
  { label: 'المدونة', href: '/المدونة' },
  { label: 'تواصل معنا', href: '/تواصل-معنا' },
];

export const footerNav: { title: string; items: NavItem[] }[] = [
  {
    title: 'روابط هامة',
    items: [
      { label: 'الرئيسية', href: '/' },
      { label: 'من نحن', href: '/من-نحن' },
      {
        label: 'سابقة الأعمال',
        href: '#',
        children: [
          { label: 'معرض الفيديو', href: '/معرض-الفيديو', icon: 'video' },
          { label: 'معرض الصور', href: '/معرض-الفيديو/معرض-الصور', icon: 'images' },
        ],
      },
    ],
  },
  // The «خدماتنا» column is built by `SiteFooter` from the CMS services.
  {
    title: 'معلومات',
    items: [
      { label: 'الأسئلة الشائعة', href: '/الأسئلة-الشائعة' },
      { label: 'سياسة الضمان', href: '/سياسة-الضمان' },
      { label: 'المدونة', href: '/المدونة' },
    ],
  },
];
