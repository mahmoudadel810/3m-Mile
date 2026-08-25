/**
 * Formatting helpers, deliberately kept free of any data imports.
 *
 * `lib/posts.ts` imports the ~8 MB extracted posts JSON. Any client component that
 * imports a runtime value from that module pulls the whole file into the browser bundle
 * — which took the homepage route from 110 KB to 1.6 MB. Client components import from
 * here instead.
 */

/** Matches the live site's format, e.g. `2026/08/07`, with Western digits. */
export function formatPostDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
}
