'use client';

import { useEffect, useState } from 'react';

/**
 * True once the page has scrolled past `offset`.
 *
 * A single passive listener throttled through requestAnimationFrame. Every scroll-driven
 * component shares this one, so the page never accumulates handlers.
 */
export function useScrolled(offset = 50) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > offset);
        ticking = false;
      });
    };

    onScroll(); // account for a restored scroll position on load
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [offset]);

  return scrolled;
}
