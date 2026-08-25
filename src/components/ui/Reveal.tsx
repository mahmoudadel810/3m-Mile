'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * Scroll-entrance wrapper.
 *
 * The source site has no entrance animation at all — sections simply appear. This is the
 * one genuinely missing piece of motion, and it costs nothing beyond IntersectionObserver.
 *
 * Two deliberate safeguards, because a reveal that fails leaves content invisible:
 *
 *  1. The hidden state is only armed for elements that start BELOW the fold. Anything
 *     already on screen at mount renders normally — no hide-then-show flash, and no way
 *     for above-the-fold content to get stuck at opacity 0.
 *  2. The server HTML carries no `data-reveal` attribute at all, so without JavaScript
 *     (or if hydration fails) every section is simply visible.
 */
export function Reveal({
  as: Tag = 'div',
  delay = 0,
  className,
  children,
}: {
  as?: React.ElementType;
  /** Stagger, in ms. Grid children typically step by 60. */
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<'idle' | 'hidden' | 'shown'>('idle');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Already visible, or no observer support: leave it alone.
    if (typeof IntersectionObserver === 'undefined') return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    setState('hidden');

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setState('shown');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -5% 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal={state === 'idle' ? undefined : state === 'shown' ? 'shown' : ''}
      style={delay ? ({ '--reveal-delay': `${delay}ms` } as React.CSSProperties) : undefined}
      className={cn(className)}
    >
      {children}
    </Tag>
  );
}
