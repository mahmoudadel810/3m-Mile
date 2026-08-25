import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin/AdminShell';

export const metadata: Metadata = {
  title: 'لوحة التحكم | 3M مايل',
  // The dashboard must never be indexed, and must not leak its existence via search.
  robots: { index: false, follow: false },
};

/**
 * The dashboard is rendered inside the site's own root layout, so it inherits the same
 * fonts, RTL direction and design tokens. That is deliberate — the brief calls for the
 * CMS to use the existing frontend rather than a second application.
 *
 * `force-dynamic` because every admin screen reflects the database as it is right now;
 * ISR caching here would show an admin their own edit as stale.
 */
export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
