'use client';

import { useEffect, useState } from 'react';

/**
 * Natural pixel size of a hosted image URL. `naturalWidth`/`naturalHeight` are readable
 * cross-origin without CORS, so a plain `Image()` probe is enough.
 */
export function useImageDimensions(src: string | null) {
  const [dims, setDims] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    setDims(null);
    if (!src) return;
    let alive = true;
    const img = new Image();
    img.onload = () => {
      if (alive) setDims({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.src = src;
    return () => {
      alive = false;
    };
  }, [src]);

  return dims;
}
