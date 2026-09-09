/**
 * Output-encoding helpers for CMS-authored values. The backend caps lengths but does not
 * escape or scheme-check these fields. Special characters are built from codepoints so
 * this file stays pure ASCII.
 */

/** U+2028 LINE SEPARATOR. */
const LINE_SEPARATOR = String.fromCharCode(0x2028);
/** U+2029 PARAGRAPH SEPARATOR. */
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);

/**
 * Serialise a value for a `<script type="application/ld+json">` block. `<` is escaped so
 * a value cannot close the script element; U+2028/U+2029 are JS line terminators.
 */
export function jsonLdHtml(data: unknown): string {
  return JSON.stringify(data)
    .split('<').join('\\u003c')
    .split(LINE_SEPARATOR).join('\\u2028')
    .split(PARAGRAPH_SEPARATOR).join('\\u2029');
}

/** Schemes permitted in a CMS link. The backend's URL check does not reject `javascript:`. */
const ALLOWED_SCHEME = /^(?:https?:|mailto:|tel:)/i;

/** Remove whitespace and control characters, which browsers ignore inside a scheme. */
function stripBlank(value: string): string {
  let out = '';
  for (const ch of value) {
    const code = ch.codePointAt(0) ?? 0;
    if (code > 0x20) out += ch;
  }
  return out;
}

/**
 * Make a CMS href safe for an `href` attribute. Relative links pass through; anything
 * without an allowed scheme returns `fallback`.
 */
export function safeHref(href: string | null | undefined, fallback = '#'): string {
  if (typeof href !== 'string') return fallback;

  const trimmed = href.trim();
  if (!trimmed) return fallback;

  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return trimmed;

  const normalised = stripBlank(trimmed);
  if (ALLOWED_SCHEME.test(normalised)) return normalised;

  // A bare domain is neither relative nor schemed; do not guess a scheme.
  return fallback;
}

/** True when a CMS href is a real link; an empty `href=""` reloads the page. */
export function hasLink(href: string | null | undefined): boolean {
  return safeHref(href, '') !== '';
}
