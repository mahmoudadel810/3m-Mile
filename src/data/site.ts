/**
 * Single source of truth for identity and contact details.
 *
 * `phone` and `whatsapp` are the site's ONLY conversion path — every form, every CTA,
 * every floating button ends at one of them. Nothing may hard-code these anywhere else.
 */

export const site = {
  name: '3M مايل',
  nameFull: '3M Mile - ثرى ام مايل',
  nameLatin: '3M Mile',
  /** TODO: confirm the real production domain — placeholder pending client sign-off. */
  url: 'https://3mmile.sa',
  locale: 'ar_SA',
  lang: 'ar',
  dir: 'rtl',

  description:
    '3M مايل الوكيل الرسمي والمعتمد لشركة 3M، متخصصون في حماية السيارات نوفر خدمات تظليل عازل حراري، أفلام حماية PPF، تلميع النانو سيراميك وأكثر بعناية فائقة.',

  tagline: 'افضل شركة حماية سيارات في السعودية',

  phone: '0560087412',
  /** International form, digits only — this is what wa.me expects. */
  whatsapp: '966560087412',
  /** TODO: confirm the real production mailbox — placeholder pending client sign-off. */
  email: 'info@3mmile.sa',
  hours: 'خدمة 24 س/7 أيام',

  /**
   * The logo is CMS-managed: upload it on the dashboard's site-settings screen and the
   * header picks it up via `src/data/settings.ts` (getSiteLogo). Until one is uploaded
   * the header renders the site name as styled text.
   */

  // Social profiles are CMS-managed — see `getSocialLinks` in data/settings.ts. Add or
  // retire an account on the dashboard's site-settings screen, not here.

  /** Google MyMaps layer holding all 12 branches. */
  mapsEmbedId: '1Idn61qGyS0wgcxxnJSwBGqsdJ4sTqds',
  get mapsViewerUrl() {
    return `https://www.google.com/maps/d/viewer?mid=${this.mapsEmbedId}`;
  },
  get mapsEmbedUrl() {
    return `https://www.google.com/maps/d/embed?mid=${this.mapsEmbedId}&ehbc=2E312F`;
  },

  stats: {
    rating: '5.0',
    reviewCount: 450,
    years: 15,
    clients: '25K',
    team: 250,
  },
} as const;

export type Site = typeof site;
