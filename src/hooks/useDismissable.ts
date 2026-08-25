'use client';

import { useEffect, useRef } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Everything an overlay needs to behave: body scroll lock, Escape to close, focus moved
 * in and trapped while open, and focus returned to the trigger on close.
 *
 * The source site's overlays do none of this. Its drawer leaves focus behind the scrim
 * (so Tab walks the page underneath), and its promo popup papers over the problem by
 * setting `tabindex="-1"` on its own buttons — which makes them unreachable by keyboard
 * entirely. This hook is the fix for both.
 */
export function useDismissable(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    lastFocused.current = document.activeElement as HTMLElement | null;
    document.body.dataset.scrollLocked = 'true';

    const node = ref.current;
    node?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !node) return;

      const items = [...node.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null
      );
      if (items.length === 0) return;

      const first = items[0]!;
      const last = items[items.length - 1]!;
      const active = document.activeElement;

      if (e.shiftKey && (active === first || !node.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      delete document.body.dataset.scrollLocked;
      lastFocused.current?.focus();
    };
  }, [open, onClose]);

  return ref;
}
