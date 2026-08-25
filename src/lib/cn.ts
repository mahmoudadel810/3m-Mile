/**
 * Minimal class joiner. The project has few enough conditional-class cases that
 * clsx + tailwind-merge would be two dependencies earning nothing.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
