import Image from 'next/image';
import Link from 'next/link';
import type { PostSummary } from '@/lib/posts';
import { formatPostDate } from '@/lib/format';
import { Icon } from '@/components/ui/Icon';

/**
 * One article card. Used by the blog index, the category archives and the related-posts
 * rail — the source has three separate card markups for those, already visually drifted.
 *
 * `priority` is passed for the first row only; everything below folds in lazily.
 */
export function PostCard({ post, priority = false }: { post: PostSummary; priority?: boolean }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-xl)] border border-line bg-glass transition-all duration-300 hover:-translate-y-1 hover:border-primary">
      <Link href={`/${post.slug}`} className="relative block aspect-[16/10] overflow-hidden">
        {post.featured ? (
          <Image
            src={post.featured.url}
            alt={post.featured.alt || post.title}
            fill
            sizes="(max-width: 639px) 95vw, (max-width: 991px) 47vw, 33vw"
            priority={priority}
            loading={priority ? undefined : 'lazy'}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          // 0 posts lack a featured image today, but a backend could return one that
          // does; a bare grey box is better than a broken <img>.
          <span aria-hidden="true" className="block size-full bg-surface-2" />
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg leading-snug font-black">
          <Link href={`/${post.slug}`} className="transition-colors hover:text-primary">
            {post.title}
          </Link>
        </h3>

        <p className="mt-2 line-clamp-3 text-base leading-relaxed text-fg-muted">{post.excerpt}</p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <time
            dateTime={post.date}
            className="flex items-center gap-1.5 text-sm font-semibold text-fg-dim"
          >
            <Icon name="clock" size={13} />
            {formatPostDate(post.date)}
          </time>

          <Link
            href={`/${post.slug}`}
            className="rounded-[var(--radius-sm)] bg-primary px-3 py-1.5 text-sm font-bold text-white transition-colors duration-300 hover:bg-white hover:text-primary"
            // The card title is already a link to the same place; this one is decorative
            // for pointer users, so it is hidden from the accessibility tree rather than
            // announced as a second identical destination.
            tabIndex={-1}
            aria-hidden="true"
          >
            اقرأ المزيد
          </Link>
        </div>
      </div>
    </article>
  );
}
