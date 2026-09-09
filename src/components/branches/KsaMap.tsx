import { KSA_OUTLINE_PATH } from '@/lib/ksaOutline';
import type { KsaCity } from '@/lib/ksaCities';
import { projectToMap } from '@/lib/geo';

/**
 * Decorative Saudi Arabia outline behind the branch pins (see `lib/ksaOutline.ts`).
 *
 * The 1000x1000 viewBox shares the projection in `lib/geo.ts`, so pins and outline
 * stretch together. `preserveAspectRatio="none"` is required so the viewBox fills the
 * element box, and the caller must render it into the same square container the pins
 * are positioned over. Hidden from assistive tech; the pins on top are the controls.
 */
export function KsaMap({
  className,
  cities = [],
  labelScale = 1,
}: {
  className?: string;
  /** Cities to label; pass only the ones that have a branch. */
  cities?: readonly KsaCity[];
  /** Multiplies the label size (viewBox units, so it scales with the box). */
  labelScale?: number;
}) {
  return (
    <svg
      viewBox="0 0 1000 1000"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d={KSA_OUTLINE_PATH} fillRule="nonzero" fill="var(--color-surface-2)" stroke="var(--color-line)" />

      {/* Labels only; the branch pin already marks the coordinate. Text stays undistorted only in a square box. */}
      {cities.map((c) => {
        const { xPct, yPct } = projectToMap(c.lat, c.lng);
        const size = 24 * labelScale;
        return (
          <text
            key={c.key}
            x={xPct * 10 + (c.dx ?? 0)}
            y={yPct * 10 + (c.dy ?? 0) + size + 8}
            textAnchor="middle"
            fontSize={size}
            fontWeight={700}
            fill="var(--color-fg-muted)"
          >
            {c.name}
          </text>
        );
      })}
    </svg>
  );
}
