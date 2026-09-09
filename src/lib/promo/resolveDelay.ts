/**
 * Clamps the CMS `Promo.delayMs` into range and falls back to the default for missing or
 * non-finite values. Not `||`: `0` is a valid "show immediately".
 */
export const PROMO_DEFAULT_DELAY_MS = 3000;
export const PROMO_MIN_DELAY_MS = 0;
export const PROMO_MAX_DELAY_MS = 30000;

export function resolveDelay(delayMs: number | null | undefined): number {
  if (typeof delayMs !== 'number' || !Number.isFinite(delayMs)) {
    return PROMO_DEFAULT_DELAY_MS;
  }
  return Math.min(PROMO_MAX_DELAY_MS, Math.max(PROMO_MIN_DELAY_MS, delayMs));
}
