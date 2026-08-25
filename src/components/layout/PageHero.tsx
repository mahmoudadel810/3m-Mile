import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';

export type Crumb = { label: string; href?: string };

/**
 * The page cover every non-home route carries: a breadcrumb trail above the H1.
 *
 * Matches the source's `.page_cover` block. The trail is a real <nav> with an ordered
 * list, which the theme's version is not.
 */
export function PageHero({ title, crumbs = [] }: { title: string; crumbs?: Crumb[] }) {
  return (
    <div className="border-b border-line-soft bg-ink pt-6 pb-5">
      <div className="mx-auto w-[95%] max-w-[var(--container-narrow)]">
        <nav aria-label="مسار التنقل" className="mb-2">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-fg-muted">
            <li className="flex items-center gap-1.5">
              <Link href="/" className="transition-colors hover:text-primary" aria-label="الرئيسية">
                <Icon name="arrowCircle" size={15} className="rtl-flip" />
              </Link>
            </li>
            {crumbs.map((c) => (
              <li key={c.label} className="flex items-center gap-1.5">
                <Icon name="chevronEnd" size={12} className="rtl-flip text-fg-dim" aria-hidden="true" />
                {c.href ? (
                  <Link href={c.href} className="transition-colors hover:text-primary">
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current="page">{c.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <h1 className="text-3xl leading-tight font-black md:text-4xl">{title}</h1>
      </div>
    </div>
  );
}
