import { apiList } from '@/lib/api/client';
import { mapBranch, type ApiBranch } from '@/lib/api/dto';

/**
 * The branches, as one array.
 *
 * ONE record per branch, serving both the map pins and the list cards below. Holding the
 * same branch twice — once for the pins, once for the cards — is how a pin ends up
 * dialling a 9-digit phone number while its card carries the correct 10-digit one. The
 * single array makes that class of bug structurally impossible rather than a matter of
 * discipline.
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
  /** Legacy percentage position; still in the API schema, not read by the map. */
  pin: { top: string; start: string } | null;
  /** Real coordinates, projected by `projectToMap`. Null when either half is missing. */
  location: { lat: number; lng: number } | null;
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
