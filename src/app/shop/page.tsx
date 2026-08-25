import type { Metadata } from 'next';
import { ShopPage } from '@/components/pages/ShopPage';

/** `/shop/` — the catalogue index. ASCII path, so a plain directory route works. */
export const metadata: Metadata = {
  title: 'منتجاتنا',
  description:
    'أفلام حماية السيارات PPF وأفلام العزل الحراري الأصلية من 3M بضمان رسمي وتركيب متخصص في فروع مايل بالمملكة.',
  alternates: { canonical: '/shop' },
};

export default function ShopRoute() {
  return <ShopPage />;
}
