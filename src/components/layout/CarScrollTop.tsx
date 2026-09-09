'use client';

import { useScrolled } from '@/hooks/useScrolled';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

/** Scroll-to-top button, shown once the page passes 600px. Drives in from off-screen like the source. */
export function CarScrollTop() {
  const visible = useScrolled(600);

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="العودة إلى أعلى الصفحة"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={cn(
        'fixed bottom-5 z-[9999] cursor-pointer md:bottom-[25px]',
        'transition-[transform,opacity] duration-[600ms] ease-[var(--ease-back)]',
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
      style={{
        insetInlineStart: 'var(--fab-inset)',
        // Drives in from beyond the inline-start edge. RTL's inline-start is the
        // physical right, so the sign is direction-dependent.
        transform: visible ? 'translateX(0)' : 'var(--car-hidden-shift)',
      }}
    >
      <span className="grid size-[48px] place-items-center rounded-full bg-primary text-white shadow-[0_5px_5px_rgb(0_0_0/0.3)]">
        <Icon name="arrowUp" size={20} />
      </span>
    </button>
  );
}
