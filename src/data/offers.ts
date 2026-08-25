import { apiGet, apiList } from '@/lib/api/client';
import { mapOffer, type ApiPackage } from '@/lib/api/dto';

/**
 * Seasonal offers shown on the offers page.
 *
 * API SEAM — the offer CARDS are `Package` documents, so the admin adds and retires
 * offers without touching the page around them. The banner and copy are a separate
 * singleton (`OffersPage`), because they are the page's own furniture rather than one
 * of the offers.
 */

export type Offer = {
  id: string;
  title: string;
  image: string;
  alt: string;
  badge?: string;
  whatsappText: string;
};

export type OffersPage = {
  banner: string;
  bannerAlt: string;
  intro: string;
  formHeading: string;
  formSubheading: string;
};

type ApiOffersPage = {
  banner?: string | null;
  bannerAlt?: string;
  intro?: string;
  formHeading?: string;
  formSubheading?: string;
};

/** @endpoint GET /api/v1/packages */
export async function getOffers(): Promise<Offer[]> {
  const rows = await apiList<ApiPackage>('/packages?isActive=true&limit=50');
  return rows.map(mapOffer);
}

/** @endpoint GET /api/v1/offers-page — banner and intro copy for the offers page. */
export async function getOffersPage(): Promise<OffersPage> {
  const page = await apiGet<ApiOffersPage>('/offers-page');
  return {
    banner: page?.banner ?? '',
    bannerAlt: page?.bannerAlt ?? '',
    intro: page?.intro ?? '',
    formHeading: page?.formHeading ?? '',
    formSubheading: page?.formSubheading ?? '',
  };
}
