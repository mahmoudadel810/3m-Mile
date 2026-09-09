'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * One direction-aware carousel for the whole site, so RTL is handled once. Autoplay
 * pauses when the carousel scrolls out of view and stops under reduced motion.
 */
export function useCarousel({
  count,
  perView = 1,
  autoplay = 0,
  loop = true,
}: {
  count: number;
  /** Slides visible at once; the last reachable index is count - perView. */
  perView?: number;
  /** Interval in ms; 0 disables. */
  autoplay?: number;
  loop?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const inView = useRef(true);

  const maxIndex = Math.max(0, count - perView);

  const goTo = useCallback(
    (next: number) => {
      if (maxIndex === 0) return setIndex(0);
      if (next < 0) setIndex(loop ? maxIndex : 0);
      else if (next > maxIndex) setIndex(loop ? 0 : maxIndex);
      else setIndex(next);
    },
    [maxIndex, loop]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // Autoplay, paused off-screen and under reduced motion.
  useEffect(() => {
    if (!autoplay || count <= perView) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const start = () => {
      if (timer.current) clearInterval(timer.current);
      timer.current = setInterval(() => {
        if (inView.current) setIndex((i) => (i >= maxIndex ? 0 : i + 1));
      }, autoplay);
    };
    start();

    const el = containerRef.current;
    let observer: IntersectionObserver | undefined;
    if (el && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        ([entry]) => {
          inView.current = !!entry?.isIntersecting;
        },
        { threshold: 0.1 }
      );
      observer.observe(el);
    }

    return () => {
      if (timer.current) clearInterval(timer.current);
      observer?.disconnect();
    };
  }, [autoplay, count, perView, maxIndex]);

  /** Restart the autoplay clock after a manual interaction. */
  const resetTimer = useCallback(() => {
    if (!timer.current || !autoplay) return;
    clearInterval(timer.current);
    timer.current = setInterval(() => {
      if (inView.current) setIndex((i) => (i >= maxIndex ? 0 : i + 1));
    }, autoplay);
  }, [autoplay, maxIndex]);

  // Touch swipe, 50px threshold — the source's value.
  const touchStart = useRef(0);
  const swipeHandlers = {
    onTouchStart: (e: React.TouchEvent) => {
      touchStart.current = e.changedTouches[0]?.screenX ?? 0;
    },
    onTouchEnd: (e: React.TouchEvent) => {
      const end = e.changedTouches[0]?.screenX ?? 0;
      const delta = end - touchStart.current;
      if (Math.abs(delta) < 50) return;
      // In RTL a leftward swipe advances; in LTR it is the reverse.
      const rtl = document.documentElement.dir === 'rtl';
      const forward = rtl ? delta > 0 : delta < 0;
      forward ? next() : prev();
      resetTimer();
    },
  };

  /**
   * Transform for a sliding track. The sign flips under RTL because the track moves
   * toward the inline-start edge, which is the physical right.
   */
  const trackTransform = (rtl = true) =>
    `translateX(${(rtl ? 1 : -1) * index * (100 / perView)}%)`;

  return {
    index,
    setIndex,
    goTo,
    next,
    prev,
    maxIndex,
    containerRef,
    swipeHandlers,
    resetTimer,
    trackTransform,
  };
}
