import { apiList } from '@/lib/api/client';
import { mapBranch, type ApiBranch } from '@/lib/api/dto';

/**
 * The branches, as one array.
 *
 * On the reference site this data exists TWICE — once as `data-*` attributes on the
 * map pins and once as hand-written list cards below — and the two copies had already
 * drifted: one pin carried a 9-digit phone while its card carried the correct 10-digit
 * one, so the call button on that pin dialled a broken number. One record per branch,
 * serving both the map and the cards, is what stops that class of bug recurring — and it
 * is now enforced by the data model rather than by discipline.
 *
 * API SEAM — `getBranches()` reads the CMS; the city grouping stays here because it is
 * presentation, not content.
 */

export type Branch = {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  mapUrl: string;
  /** Position on the branches map, as a percentage of the image box. Null = not plotted. */
  pin: { top: string; start: string } | null;
};

export type BranchCityGroup = { city: string; items: Branch[] };

/** @endpoint GET /api/v1/branches */
export async function getBranches(): Promise<Branch[]> {
  const rows = await apiList<ApiBranch>('/branches?isActive=true&limit=100');
  return rows.map(mapBranch);
}

/**
 * Branches grouped by city, for the accordion on the branches page.
 *
 * City order follows first appearance in the API's own ordering, so the admin controls
 * which city leads by setting each branch's `order` — rather than the frontend pinning
 * a hard-coded city list that a new city would silently fall off the end of.
 */
export async function getBranchesByCity(): Promise<BranchCityGroup[]> {
  const branches = await getBranches();
  const groups: BranchCityGroup[] = [];

  for (const branch of branches) {
    const city = branch.city || 'أخرى';
    const existing = groups.find((g) => g.city === city);
    if (existing) existing.items.push(branch);
    else groups.push({ city, items: [branch] });
  }

  return groups;
}
