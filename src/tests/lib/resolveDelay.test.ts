/**
 * @jest-environment node
 *
 * Unit coverage for `resolveDelay` (`src/lib/promo/resolveDelay.ts`) — the pure-function
 * seam that turns a CMS-stored `Promo.delayMs` into the timeout `PromoModal` actually
 * uses. Kept as a pure function specifically so the falsy-zero and clamping cases can be
 * asserted without waiting out a real `setTimeout`. `src/tests/components/PromoModal.test.tsx`
 * proves the component is actually wired to it.
 */
import {
  resolveDelay,
  PROMO_DEFAULT_DELAY_MS,
  PROMO_MIN_DELAY_MS,
  PROMO_MAX_DELAY_MS,
} from '@/lib/promo/resolveDelay';

test('a valid in-range delayMs passes through unchanged', () => {
  expect(resolveDelay(1234)).toBe(1234);
});

test('delayMs === 0 is honoured, NOT replaced by the default (falsy-zero bug)', () => {
  expect(resolveDelay(0)).toBe(0);
  expect(resolveDelay(0)).not.toBe(PROMO_DEFAULT_DELAY_MS);
});

test('undefined delayMs (field absent) falls back to the default', () => {
  expect(resolveDelay(undefined)).toBe(PROMO_DEFAULT_DELAY_MS);
});

test('null delayMs falls back to the default', () => {
  expect(resolveDelay(null)).toBe(PROMO_DEFAULT_DELAY_MS);
});

test('NaN delayMs falls back to the default (defensive, not just absent-field)', () => {
  expect(resolveDelay(Number.NaN)).toBe(PROMO_DEFAULT_DELAY_MS);
});

test('an out-of-range-high stored value is clamped to the max, not obeyed', () => {
  expect(resolveDelay(999_999)).toBe(PROMO_MAX_DELAY_MS);
  expect(resolveDelay(PROMO_MAX_DELAY_MS + 1)).toBe(PROMO_MAX_DELAY_MS);
});

test('the max bound itself is honoured exactly (boundary, not off-by-one)', () => {
  expect(resolveDelay(PROMO_MAX_DELAY_MS)).toBe(PROMO_MAX_DELAY_MS);
});

test('a negative stored value is clamped to the min, not obeyed', () => {
  expect(resolveDelay(-500)).toBe(PROMO_MIN_DELAY_MS);
});
