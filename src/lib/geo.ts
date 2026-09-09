/**
 * Equirectangular projection from lat/lng into the 0–100% box used by both the branch
 * pins and the `KsaMap` outline.
 *
 * `KSA_BBOX` is Natural Earth's SAU bbox, slightly padded. The bbox is wider than tall
 * but maps onto a square, so the country is stretched horizontally. This is deliberate:
 * pins and outline share the projection, so they stay aligned. Do not replace it with an
 * aspect-preserving projection without regenerating `ksaOutline.ts`.
 */
export const KSA_BBOX = { west: 34.5, east: 55.7, south: 16.3, north: 32.2 } as const;

/** Projects a lat/lng into a percentage position (0–100) matching the SVG viewBox. */
export function projectToMap(lat: number, lng: number): { xPct: number; yPct: number } {
  const xPct = ((lng - KSA_BBOX.west) / (KSA_BBOX.east - KSA_BBOX.west)) * 100;
  const yPct = ((KSA_BBOX.north - lat) / (KSA_BBOX.north - KSA_BBOX.south)) * 100;
  return { xPct, yPct };
}

/** Inverse of `projectToMap`. Percentages are measured from the left/top edges. */
export function unprojectFromMap(xPct: number, yPct: number): { lat: number; lng: number } {
  const lng = KSA_BBOX.west + (xPct / 100) * (KSA_BBOX.east - KSA_BBOX.west);
  const lat = KSA_BBOX.north - (yPct / 100) * (KSA_BBOX.north - KSA_BBOX.south);
  return { lat, lng };
}
