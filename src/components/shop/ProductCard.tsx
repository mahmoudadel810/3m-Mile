import Image from 'next/image';
import Link from 'next/link';
import type { ProductSummary } from '@/lib/products';

/**
 * One catalogue card.
 *
 * DELIBERATELY NO PRICE. The shop is a catalogue that converts through WhatsApp, and a
 * zero price reads as "free" rather than "priced on request", so the element is dropped.
 */
export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductSummary;
  priority?: boolean;
}) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-xl)] border border-line bg-glass transition-all duration-300 hover:-translate-y-1 hover:border-primary">
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-[4/3] overflow-hidden"
      >
        {product.featured && (
          <Image
            src={product.featured.url}
            alt={product.featured.alt || product.title}
            fill
            sizes="(max-width: 639px) 95vw, (max-width: 991px) 47vw, 33vw"
            priority={priority}
            loading={priority ? undefined : 'lazy'}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </Link>

      <div className="flex flex-1 flex-col items-center p-4 text-center">
        <h3 className="text-lg leading-snug font-black">
          <Link href={`/product/${product.slug}`} className="transition-colors hover:text-primary">
            {product.title}
          </Link>
        </h3>

        <p className="mt-2 line-clamp-2 text-base leading-relaxed text-fg-muted">
          {product.excerpt}
        </p>

        <Link
          href={`/product/${product.slug}`}
          className="mt-4 rounded-[var(--radius-md)] bg-primary px-5 py-2 text-sm font-bold text-white transition-colors duration-300 hover:bg-white hover:text-primary"
          tabIndex={-1}
          aria-hidden="true"
        >
          اطلب الخدمة
        </Link>
      </div>
    </article>
  );
}
