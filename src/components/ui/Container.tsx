import { cn } from '@/lib/cn';

/**
 * Three container widths, all at `width: 95%` up to their max:
 * 1100px for most sections, 1200px for the footer and reviews, 1400px for the header.
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
