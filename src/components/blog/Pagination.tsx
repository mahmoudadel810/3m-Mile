import Link from 'next/link';
import { Icon } from '@/components/ui/Icon';

/**
 * Numbered pagination for the blog index and the category archives.
 *
 * `hrefFor(1)` must return the unpaginated URL — page 1 is served at the blog root and
 * page 2 at `{root}/page/2/`; preserving that avoids a duplicate-content pair.
 *
 * The window mirrors the source's: the first three pages, the last page, the current
 * page's neighbours, and an ellipsis for each gap — so page 1 of 23 reads "1 2 3 … 23",
 * exactly as the live site does. Rendered as a real <nav> with an ordered list, which the
 * theme's version is not.
 */
function pageWindow(current: number, total: number): (number | 'gap')[] {
  const keep = new Set([1, 2, 3, total, current, current - 1, current + 1]);
  const pages = Array.from({ length: total }, (_, i) => i + 1).filter(
    (p) => p >= 1 && p <= total && keep.has(p)
  );

  const out: (number | 'gap')[] = [];
  let last = 0;
  for (const p of pages) {
    if (last && p - last > 1) out.push('gap');
    out.push(p);
    last = p;
  }
  return out;
}

export function Pagination({
  page,
  totalPages,
  hrefFor,
}: {
  page: number;
  totalPages: number;
  hrefFor: (n: number) => string;
}) {
  if (totalPages <= 1) return null;

  const base =
    'flex size-9 items-center justify-center rounded-[var(--radius-sm)] border border-line text-sm font-bold transition-colors duration-300';

  return (
    <nav aria-label="تصفح الصفحات" className="mt-10 flex justify-center">
      <ol className="flex flex-wrap items-center gap-1.5">
        {pageWindow(page, totalPages).map((p, i) =>
          p === 'gap' ? (
            <li key={`gap-${i}`} className={`${base} border-transparent text-fg-dim`} aria-hidden="true">
              …
            </li>
          ) : (
            <li key={p}>
              {p === page ? (
                <span className={`${base} border-primary bg-primary text-white`} aria-current="page">
                  {p}
                </span>
              ) : (
                <Link
                  href={hrefFor(p)}
                  className={`${base} bg-glass text-fg hover:border-primary hover:text-primary`}
                  aria-label={`الصفحة ${p}`}
                >
                  {p}
                </Link>
              )}
            </li>
          )
        )}

        {page < totalPages && (
          <li>
            <Link
              href={hrefFor(page + 1)}
              className={`${base} bg-glass text-fg hover:border-primary hover:text-primary`}
              aria-label="الصفحة التالية"
              rel="next"
            >
              {/* rtl-flip so the chevron points along the reading direction */}
              <Icon name="chevronEnd" size={14} className="rtl-flip" />
            </Link>
          </li>
        )}
      </ol>
    </nav>
  );
}
