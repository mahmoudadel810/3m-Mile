'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { PostSummary } from '@/lib/posts';
import { formatPostDate } from '@/lib/format';
import { Icon } from '@/components/ui/Icon';

/**
 * Latest posts — a horizontally scrollable rail of the six newest.
 *
 * The source fetches these client-side on every page load, showing a
 * skeleton until the request lands. They are passed in as props here and rendered at
 * build time, so the section is present in the HTML.
 *
 * Its arrows are also semantically swapped on the source ("next" scrolls `left: -320`);
 * these scroll by the inline axis, which is correct in both directions.
 */
export function LatestPosts({
  posts,
  heading,
}: {
  posts: PostSummary[];
  heading?: string;
}) {
  const trackRef = useRef<HTMLUListElement>(null);

  // After the hooks: no posts, no section.
  if (!posts.length) return null;

  const scrollBy = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    // scrollLeft is negative in RTL, so the sign follows the document direction.
    const rtl = document.documentElement.dir === 'rtl';
    el.scrollBy({ left: direction * 320 * (rtl ? -1 : 1), behavior: 'smooth' });
  };

  return (
    <section className="border-t border-line-soft bg-ink py-5">
      <div className="mx-auto w-[95%] max-w-[var(--container)]">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-3xl font-extrabold">{heading || 'أحدث المقالات'}</h2>
          <div className="flex gap-2">
            <RailButton side="prev" onClick={() => scrollBy(-1)} />
            <RailButton side="next" onClick={() => scrollBy(1)} />
          </div>
        </div>

        <ul
          ref={trackRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {posts.map((post) => (
            <li
              key={post.id}
              className="w-[280px] shrink-0 snap-start overflow-hidden rounded-[var(--radius-xl)] border border-line bg-glass transition-colors duration-300 hover:border-primary md:w-[300px]"
            >
              <Link href={`/${post.slug}`} className="block">
                <span className="relative block aspect-[16/10] overflow-hidden bg-surface">
                  {post.featured?.url && (
                    <Image
                      src={post.featured.url}
                      alt={post.featured.alt || post.title}
                      fill
                      sizes="300px"
                      loading="lazy"
                      className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                  )}
                </span>
                <span className="block p-4">
                  <span className="line-clamp-2 block min-h-[3rem] text-base leading-snug font-bold">
                    {post.title}
                  </span>
                  <span className="mt-3 flex items-center justify-between text-sm text-fg-muted">
                    <span className="flex items-center gap-1.5">
                      <Icon name="clock" size={14} />
                      {formatPostDate(post.date)}
                    </span>
                    <span className="font-bold text-primary">اقرأ المزيد</span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function RailButton({ side, onClick }: { side: 'prev' | 'next'; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === 'prev' ? 'المقالات السابقة' : 'المقالات التالية'}
      className="flex size-9 items-center justify-center rounded-full border border-line bg-glass text-white transition-colors duration-300 hover:border-primary hover:bg-primary"
    >
      <Icon name={side === 'prev' ? 'chevronStart' : 'chevronEnd'} size={16} className="rtl-flip" />
    </button>
  );
}
