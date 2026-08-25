import { cn } from '@/lib/cn';

/**
 * The source site uses three container widths, all at `width: 95%`:
 * 1100px for most widgets, 1200px for the footer and reviews, 1400px for the header.
 */
const widths = {
  narrow: 'max-w-[var(--container-narrow)]',
  base: 'max-w-[var(--container)]',
  wide: 'max-w-[var(--container-wide)]',
} as const;

export function Container({
  as: Tag = 'div',
  size = 'narrow',
  className,
  children,
}: {
  as?: React.ElementType;
  size?: keyof typeof widths;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tag className={cn('mx-auto w-[95%]', widths[size], className)}>{children}</Tag>
  );
}
