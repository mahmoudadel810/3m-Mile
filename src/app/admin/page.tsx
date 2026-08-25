import Link from 'next/link';
import { NAV_GROUPS, findResource } from '@/lib/admin/resources';

/**
 * Dashboard landing page.
 *
 * Deliberately not a statistics dashboard. On a fresh install every count is zero, so
 * a wall of "0" would be both useless and discouraging; what a new administrator needs
 * is to know where each part of the website is edited. This is that index.
 */
export default function AdminOverview() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-fg">أهلاً بك</h1>
        <p className="mt-2 max-w-2xl text-sm text-fg-muted">
          كل محتوى الموقع يُدار من هنا: النصوص والصور والخدمات والمقالات والعروض. اختر
          القسم الذي تريد تعديله. الصور تُقصّ تلقائياً لتناسب تصميم الموقع، لذا لن يتغيّر
          شكل الصفحات مهما كان مقاس الصورة التي ترفعها.
        </p>
      </div>

      {NAV_GROUPS.map((group) => (
        <section key={group.title}>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-fg-dim">{group.title}</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.keys.map((key) => {
              const resource = findResource(key);
              if (!resource) return null;
              return (
                <li key={key}>
                  <Link
                    href={`/admin/${key}`}
                    className="block h-full rounded-[var(--radius-md)] border border-line p-4 transition-colors hover:border-primary"
                  >
                    <span className="block font-bold text-fg">{resource.label}</span>
                    <span className="mt-1 block text-xs text-fg-dim">
                      {resource.description ?? (resource.kind === 'singleton' ? 'قسم ثابت في الموقع' : 'قائمة عناصر')}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
