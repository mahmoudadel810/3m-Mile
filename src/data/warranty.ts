import { apiList } from '@/lib/api/client';
import { mapWarrantyGroup, type ApiWarrantyGroup } from '@/lib/api/dto';

/**
 * Warranty policy. Fetched server-side so the terms ship in the HTML for search engines
 * and screen readers.
 *
 * API SEAM — one `WarrantyGroup` document per tab, each holding its coverage tiers.
 *
 * `warranty` and `maintenance` are strings rather than numbers on purpose: the copy
 * mixes plain durations with prose, and coercing would lose it.
 */

export type WarrantyTier = {
  title: string;
  /** Cover length as written — a duration or a phrase, never a number. */
  warranty: string;
  maintenance: string;
  terms: readonly string[];
};

export type WarrantyGroup = {
  id: string;
  title: string;
  intro: string;
  tiers: WarrantyTier[];
};

/** @endpoint GET /api/v1/warranty */
export async function getWarrantyGroups(): Promise<WarrantyGroup[]> {
  const rows = await apiList<ApiWarrantyGroup>('/warranty?isActive=true&limit=50');
  return rows.map(mapWarrantyGroup);
}
