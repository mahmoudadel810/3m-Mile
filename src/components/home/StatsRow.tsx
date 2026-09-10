'use client';

import { useEffect, useState } from 'react';
import type { HomeContent } from '@/data/home';
import { useInView } from '@/hooks/useInView';

/**
 * The three counters.
 *
 * Card hover: a lift plus a red underline growing to 50% width.
 *
 * The numbers count up when the row enters view. They are the proof-point of the
 * whole section and rendering them as static text under-sells them. The final value is
 * always in the DOM for screen readers and for anyone with reduced motion.
 */
export function StatsRow({ stats }: { stats: HomeContent['stats'] }) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 });

  return (
    <section className="border-t border-line bg-ink px-2.5 py-2.5 text-center md:px-5 md:py-5">
      <div
        ref={ref}
        className="mx-auto grid max-w-[var(--container-narrow)] grid-cols-3 gap-2 md:gap-[15px]"
      >
        {stats.map((s) => (
          <div
            key={s.title}
            className="group relative flex flex-col items-center justify-center overflow-hidden rounded-[10px] border border-line bg-glass px-[5px] py-4 transition-transform duration-300 hover:-translate-y-2.5 hover:border-primary md:rounded-[15px] md:px-2.5 md:py-[30px]"
          >
            <p className="m-0 text-stat leading-none font-black whitespace-nowrap">
              <Counter to={s.value} run={inView} />
              {s.suffix}
              <span className="align-super text-[0.55em] text-primary">+</span>
            </p>
            <p className="mt-[5px] text-[0.8rem] font-bold text-fg-muted md:mt-[15px] md:text-[1.1rem]">
              {s.title}
            </p>
            <span
              aria-hidden="true"
              className="absolute bottom-0 left-1/2 h-[3px] w-0 -translate-x-1/2 bg-primary transition-[width] duration-300 group-hover:w-1/2"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function Counter({ to, run }: { to: number; run: boolean }) {
  const [value, setValue] = useState(to);

  useEffect(() => {
    if (!run) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    const duration = 1200;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic — decelerates into the final value
      setValue(Math.round(to * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    setValue(0);
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, to]);

  return <>{value}</>;
}
