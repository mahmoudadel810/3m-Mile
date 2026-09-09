/**
 * @jest-environment node
 *
 * Pure-function tests for the KSA projection, the owned outline, and the city table.
 * No browser, no stack.
 */
import crypto from 'node:crypto';
import { projectToMap, unprojectFromMap } from '@/lib/geo';
import { KSA_OUTLINE_PATH } from '@/lib/ksaOutline';
import { KSA_CITIES, findCity } from '@/lib/ksaCities';

type Point = [number, number];

const CLOSE = (actual: number, expected: number, tol = 0.1) =>
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tol);

/** Parse the `M...L...Z` subpaths in the `d` string back into arrays of [x, y] points. */
function parseSubpaths(d: string): Point[][] {
  const subpaths = d.slice(1, -1).split('ZM'); // drop leading M / trailing Z, split rings
  return subpaths.map((sp) =>
    sp.split('L').map((pair) => pair.split(' ').map(Number) as Point),
  );
}

function pointInPolygon([px, py]: Point, ring: Point[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]!;
    const [xj, yj] = ring[j]!;
    const intersects = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

/** Distance from a point to the nearest edge of the ring, in viewBox units. */
function distanceToRing([px, py]: Point, ring: Point[]): number {
  let best = Infinity;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [ax, ay] = ring[i]!;
    const [bx, by] = ring[j]!;
    const dx = bx - ax;
    const dy = by - ay;
    const len = dx * dx + dy * dy;
    const t = len ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len)) : 0;
    best = Math.min(best, Math.hypot(px - (ax + t * dx), py - (ay + t * dy)));
  }
  return best;
}

const rings = parseSubpaths(KSA_OUTLINE_PATH);
// The largest ring by point count is the mainland (153 points vs 9/18/5 for islands).
const mainland = rings.reduce((a, b) => (b.length > a.length ? b : a));

// projectToMap returns 0-100 percentages; the outline is in the 0-1000 viewBox.
const toViewBoxPoint = (lat: number, lng: number): Point => {
  const { xPct, yPct } = projectToMap(lat, lng);
  return [xPct * 10, yPct * 10];
};

describe('projectToMap', () => {
  test('Riyadh projects to ~57.4%, ~47.1%', () => {
    const { xPct, yPct } = projectToMap(24.7136, 46.6753);
    CLOSE(xPct, 57.4);
    CLOSE(yPct, 47.1);
  });

  test('Jeddah projects to ~22.1%, ~67.4%', () => {
    const { xPct, yPct } = projectToMap(21.4858, 39.1925);
    CLOSE(xPct, 22.1);
    CLOSE(yPct, 67.4);
  });

  test('Dammam projects to ~73.5%, ~36.3%', () => {
    const { xPct, yPct } = projectToMap(26.4207, 50.0888);
    CLOSE(xPct, 73.5);
    CLOSE(yPct, 36.3);
  });
});

describe('unprojectFromMap', () => {
  // This proves projectToMap and unprojectFromMap are exact algebraic inverses — it can
  // only fail on an inverse-formula bug. It provides NO protection against KSA_BBOX
  // itself being wrong: any bbox round-trips at 1e-9. The magic-number assertions above
  // are what anchor the constants to reality.
  test('round-trips projectToMap within 1e-9 for several cities', () => {
    const cities: Point[] = [
      [24.7136, 46.6753], // Riyadh
      [21.4858, 39.1925], // Jeddah
      [26.4207, 50.0888], // Dammam
      [30.0444, 31.2357], // Cairo
      [25.2048, 55.2708], // Dubai
    ];
    for (const [lat, lng] of cities) {
      const { xPct, yPct } = projectToMap(lat, lng);
      const back = unprojectFromMap(xPct, yPct);
      expect(Math.abs(back.lat - lat)).toBeLessThan(1e-9);
      expect(Math.abs(back.lng - lng)).toBeLessThan(1e-9);
    }
  });
});

describe('KSA_OUTLINE_PATH agrees with the projection (point-in-polygon)', () => {
  // The only check that proves the outline and projectToMap were built with the same
  // transform — a mismatched pair (0-100 vs 0-1000 space, or a flipped axis) would
  // otherwise ship silently while still "looking plausible".
  test('mainland ring has the expected point count (153)', () => {
    expect(mainland.length).toBe(153);
  });

  // Catches any mutation of the outline data (mirror, shift, truncation, a regeneration
  // with a different tolerance). Hash recorded while the data was verified correct.
  test('KSA_OUTLINE_PATH matches the recorded checksum', () => {
    const hash = crypto.createHash('sha256').update(KSA_OUTLINE_PATH).digest('hex');
    expect(hash).toBe('fa78f6ae691485aaa0d2697941a31e099b3aa98783047fdf534ab2ecaa66b51d');
  });

  // Riyadh/Jeddah/Dammam sit close enough to the mainland's centre that mirroring the
  // ring on either axis does NOT flip their result; they guard translation/scale errors.
  // Tabuk and Sakaka sit far enough north-west that mirroring moves them outside —
  // these discriminate a mirrored map from the real one.
  test.each<[string, number, number]>([
    ['Riyadh', 24.7136, 46.6753],
    ['Jeddah', 21.4858, 39.1925],
    ['Dammam', 26.4207, 50.0888],
    ['Tabuk', 28.3838, 36.555],
    ['Sakaka', 29.9697, 40.2064],
  ])('%s projects inside the mainland ring', (_name, lat, lng) => {
    expect(pointInPolygon(toViewBoxPoint(lat, lng), mainland)).toBe(true);
  });

  // Doha, Kuwait City and Manama are just outside the real coastline but land INSIDE a
  // mirrored copy of it — the outside-cases that discriminate a mirrored map.
  test.each<[string, number, number]>([
    ['Cairo', 30.0444, 31.2357],
    ['Dubai', 25.2048, 55.2708],
    ['Doha', 25.2854, 51.531],
    ['Kuwait City', 29.3759, 47.9774],
    ['Manama', 26.2285, 50.586],
  ])('%s projects outside the mainland ring', (_name, lat, lng) => {
    expect(pointInPolygon(toViewBoxPoint(lat, lng), mainland)).toBe(false);
  });

  describe('detects an axis-mirrored outline (mutation test)', () => {
    // Proves the discriminating cities above have teeth: mirror the ring on each axis and
    // assert the same expectations flip.
    const mirrorX: Point[] = mainland.map(([x, y]) => [1000 - x, y]);
    const mirrorY: Point[] = mainland.map(([x, y]) => [x, 1000 - y]);

    const mustFlipToOutside: [string, number, number][] = [
      ['Tabuk', 28.3838, 36.555],
      ['Sakaka', 29.9697, 40.2064],
    ];
    const mustFlipToInside: [string, number, number][] = [
      ['Doha', 25.2854, 51.531],
      ['Kuwait City', 29.3759, 47.9774],
      ['Manama', 26.2285, 50.586],
    ];

    describe.each<[string, Point[]]>([
      ['x-mirrored', mirrorX],
      ['y-mirrored', mirrorY],
    ])('%s ring', (_axis, mirrored) => {
      test.each(mustFlipToOutside)('%s is now OUTSIDE (was inside on the real ring)', (_n, lat, lng) => {
        expect(pointInPolygon(toViewBoxPoint(lat, lng), mirrored)).toBe(false);
      });
      test.each(mustFlipToInside)('%s is now INSIDE (was outside on the real ring)', (_n, lat, lng) => {
        expect(pointInPolygon(toViewBoxPoint(lat, lng), mirrored)).toBe(true);
      });
    });
  });
});

describe('KSA_CITIES', () => {
  // The city table is the ONLY source of branch pin coordinates, so a typo'd latitude
  // shows up as a pin in the sea, or in Iraq. This checks each coordinate is a real
  // Saudi one.
  test.each(KSA_CITIES.map((c) => [c.key, c] as const))('%s lands on the outline', (_key, city) => {
    const { xPct, yPct } = projectToMap(city.lat, city.lng);
    const p: Point = [xPct * 10, yPct * 10];
    // Coastal cities (Khobar, Khafji, Jazan) sit exactly ON the shoreline, and the
    // outline is RDP-simplified at 1.0 units — so they can read a hair outside the ring
    // while being geographically correct. 1 unit of 1000 is sub-pixel at every size this
    // map renders at; anything further out is a real coordinate error.
    const ok = pointInPolygon(p, mainland) || distanceToRing(p, mainland) <= 1;
    expect(ok).toBe(true);
  });

  test('keys are unique', () => {
    const keys = KSA_CITIES.map((c) => c.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  test('names are unique', () => {
    const names = KSA_CITIES.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe('findCity', () => {
  test('matches every table name exactly', () => {
    for (const c of KSA_CITIES) expect(findCity(c.name)?.key).toBe(c.key);
  });

  test('matches aliases and spelling variants', () => {
    expect(findCity('الأحساء')?.key).toBe('hofuf');
    expect(findCity('الاحساء')?.key).toBe('hofuf');
    expect(findCity('جيزان')?.key).toBe('jazan');
    expect(findCity('مكة المكرمة')?.key).toBe('makkah');
  });

  test('tolerates the definite article and stray whitespace', () => {
    expect(findCity('  رياض ')?.key).toBe('riyadh');
    expect(findCity('الرياض')?.key).toBe('riyadh');
  });

  test('returns null for an unknown or empty city — the "no pin" path', () => {
    expect(findCity('مدينة غير مدرجة')).toBeNull();
    expect(findCity('')).toBeNull();
    expect(findCity(null)).toBeNull();
    expect(findCity(undefined)).toBeNull();
  });
});
