/**
 * City table: the map's labels and the only source of branch pin coordinates.
 *
 * `Branch.city` is free text, so `findCity` matches on `name` and `aliases`, not `key`.
 * An unmatched city gets no pin and still appears in the branch list. `BranchPinMap`
 * renders one pin per city, since all branches in a city share this coordinate.
 * `src/tests/lib/geo.test.ts` asserts every coordinate lands on the outline.
 *
 * `dx`/`dy` nudge only the label (SVG units) where neighbouring names would collide.
 * Abha is omitted: too close to Khamis Mushait for both to be legible.
 */
export type KsaCity = {
  /** Stable internal id. Never rendered. */
  key: string;
  name: string;
  lat: number;
  lng: number;
  /** Other spellings an admin may have typed. Matched case- and ال-insensitively. */
  aliases?: readonly string[];
  /** Larger, brighter type — the cities a reader orients by. */
  major?: boolean;
  /** Horizontal label nudge, SVG units. */
  dx?: number;
  /** Vertical label nudge, SVG units. Negative lifts the label above its dot. */
  dy?: number;
};

export const KSA_CITIES: readonly KsaCity[] = [
  { key: 'riyadh', name: 'الرياض', lat: 24.7136, lng: 46.6753, major: true },
  { key: 'jeddah', name: 'جدة', lat: 21.4858, lng: 39.1925, major: true, dx: -22 },
  { key: 'makkah', name: 'مكة', lat: 21.3891, lng: 39.8579, major: true, dx: 24, aliases: ['مكة المكرمة'] },
  { key: 'madinah', name: 'المدينة المنورة', lat: 24.5247, lng: 39.5692, major: true, aliases: ['المدينة'] },
  { key: 'dammam', name: 'الدمام', lat: 26.4207, lng: 50.0888, major: true, dy: 30 },
  { key: 'khobar', name: 'الخبر', lat: 26.2794, lng: 50.2083, major: true, dy: -18 },
  { key: 'dhahran', name: 'الظهران', lat: 26.2361, lng: 50.0393, dy: 54 },
  { key: 'tabuk', name: 'تبوك', lat: 28.3835, lng: 36.5662, major: true },
  { key: 'taif', name: 'الطائف', lat: 21.2703, lng: 40.4158, dy: 34 },
  { key: 'buraydah', name: 'بريدة', lat: 26.326, lng: 43.975, aliases: ['القصيم'] },
  { key: 'hail', name: 'حائل', lat: 27.5114, lng: 41.7208 },
  { key: 'hafar-albatin', name: 'حفر الباطن', lat: 28.4337, lng: 45.9601 },
  { key: 'khafji', name: 'الخفجي', lat: 28.4392, lng: 48.4914 },
  { key: 'jubail', name: 'الجبيل', lat: 27.0046, lng: 49.6461 },
  { key: 'hofuf', name: 'الهفوف', lat: 25.3647, lng: 49.5878, aliases: ['الأحساء', 'الاحساء'] },
  { key: 'arar', name: 'عرعر', lat: 30.9753, lng: 41.0381 },
  { key: 'sakaka', name: 'سكاكا', lat: 29.9697, lng: 40.2064, aliases: ['الجوف'] },
  { key: 'yanbu', name: 'ينبع', lat: 24.0895, lng: 38.0618 },
  { key: 'khamis-mushait', name: 'خميس مشيط', lat: 18.306, lng: 42.729 },
  { key: 'najran', name: 'نجران', lat: 17.4924, lng: 44.1277 },
  { key: 'jazan', name: 'جازان', lat: 16.8892, lng: 42.5511, aliases: ['جيزان'] },
];

/** The names offered as suggestions in the admin's city field. */
export const KSA_CITY_NAMES: readonly string[] = KSA_CITIES.map((c) => c.name);

/**
 * Normalised for matching: trimmed, and with a leading «ال» and the alef/ta-marbuta
 * variants folded, so «الاحساء», «الأحساء» and «الهفوف» all reach the same row.
 */
const normalise = (s: string): string =>
  s
    .trim()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/^ال/, '')
    .replace(/\s+/g, ' ');

/** The city a branch's free-text `city` names, or null when nothing matches. */
export function findCity(cityName: string | null | undefined): KsaCity | null {
  if (!cityName) return null;
  const needle = normalise(cityName);
  return (
    KSA_CITIES.find(
      (c) =>
        normalise(c.name) === needle ||
        (c.aliases ?? []).some((a) => normalise(a) === needle),
    ) ?? null
  );
}
