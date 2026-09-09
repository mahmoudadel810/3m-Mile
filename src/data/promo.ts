import { apiGet } from '@/lib/api/client';

/**
 * The timed promotional overlay.
 *
 * API SEAM — the public endpoint returns null when the campaign is off (`isActive`), so
 * the modal simply stops rendering.
 */

export type Promo = {
  image: string;
  /**
   * Intrinsic size of the artwork, used only to reserve the aspect box. `undefined`
   * rather than `null` because that is what next/image accepts for "unknown" — the
   * modal's own max-width/max-height cap what is actually rendered either way, so an
   * oversized upload cannot resize the overlay.
   */
  width: number | undefined;
  height: number | undefined;
  alt: string;
  whatsappText: string;
  /** Delay before the overlay appears, in milliseconds. */
  delayMs: number;
};

type ApiPromo = {
  image?: string | null;
  alt?: string;
  width?: number | null;
  height?: number | null;
  whatsappText?: string;
  delayMs?: number;
};

/**
 * @endpoint GET /api/v1/promo
 * Returns null when no campaign is running, so the modal simply does not render.
 */
export async function getPromo(): Promise<Promo | null> {
  const promo = await apiGet<ApiPromo>('/promo');
  // The endpoint returns null when inactive; also guard the case where a campaign is
  // switched on before its artwork has been uploaded.
  if (!promo?.image) return null;

  return {
    image: promo.image,
    width: promo.width ?? undefined,
    height: promo.height ?? undefined,
    alt: promo.alt ?? '',
    whatsappText: promo.whatsappText ?? '',
    delayMs: promo.delayMs ?? 3000,
  };
}
