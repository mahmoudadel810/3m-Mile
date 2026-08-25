'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

/**
 * Shared disclosure list, used by the FAQ and by any future Q&A block.
 *
 * Built on <button aria-expanded> + region rather than <details>, so the open state is
 * controllable (only one panel at a time) while keeping the semantics screen readers
 * expect. Content is always in the DOM, so it is indexable even while collapsed.
 */
export function Accordion({
  items,
  className,
}: {
  items: { q: string; a: string }[];
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className={cn('grid gap-3', className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={item.q}
            className={cn(
              'overflow-hidden rounded-[var(--radius-lg)] border bg-glass transition-colors duration-300',
              isOpen ? 'border-primary' : 'border-line hover:border-white/20'
            )}
          >
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                aria-controls={`acc-panel-${i}`}
                id={`acc-button-${i}`}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start text-base font-bold md:text-lg"
              >
                <span>{item.q}</span>
                <Icon
                  name="chevronDown"
                  size={18}
                  className={cn(
                    'shrink-0 transition-transform duration-300',
                    isOpen ? 'rotate-180 text-primary' : 'text-fg-dim'
                  )}
                />
              </button>
            </h3>

            <div
              id={`acc-panel-${i}`}
              role="region"
              aria-labelledby={`acc-button-${i}`}
              hidden={!isOpen}
              className="px-5 pb-5 text-base leading-loose text-fg-muted"
            >
              {item.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}
