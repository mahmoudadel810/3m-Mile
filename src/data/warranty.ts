import { apiList } from '@/lib/api/client';
import { mapWarrantyGroup, type ApiWarrantyGroup } from '@/lib/api/dto';

/**
 * Warranty policy.
 *
 * The source site renders this page as a self-contained JavaScript app: a `TERMS_DB`
 * object and a `SERVICES` array inside an inline <script> that builds the tabs at
 * runtime. None of the warranty terms exist in the served HTML, so search engines and
 * screen readers see an empty page. Here the tabs stay but the content ships in the
 * HTML — that is why this is fetched server-side and rendered as real markup.
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
