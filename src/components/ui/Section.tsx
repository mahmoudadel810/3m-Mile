import { cn } from '@/lib/cn';
import { Container } from './Container';

/**
 * Vertical rhythm wrapper.
 *
 * The source site's sections are deliberately tight — 10px on the trust strip, 20px on
 * stats and reviews, 40px on why-us. This is a dense page, not an airy one, and that
 * density is part of its character. These paddings mirror the measured values rather
 * than imposing a generic spacious scale.
 */
const spacing = {
  tight: 'py-2.5', // 10px — trust strip
  base: 'py-5', // 20px — stats, reviews, partners
  loose: 'py-10 px-5', // 40px 20px — why us
  none: '',
} as const;

export function Section({
  id,
  space = 'base',
  container = 'narrow',
  bordered = false,
  className,
  containerClassName,
  children,
}: {
  id?: string;
  space?: keyof typeof spacing;
  container?: 'narrow' | 'base' | 'wide' | false;
  /** Hairline top rule — the source uses this between stats and reviews. */
  bordered?: boolean;
  className?: string;
  containerClassName?: string;
  children: React.ReactNode;
}) {
  const body =
    container === false ? (
      children
    ) : (
      <Container size={container} className={containerClassName}>
        {children}
      </Container>
    );

  return (
    <section
      id={id}
      className={cn(
        'bg-ink',
        spacing[space],
        bordered && 'border-t border-line-soft',
        className
      )}
    >
      {body}
    </section>
  );
}
