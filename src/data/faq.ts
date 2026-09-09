import { apiList } from '@/lib/api/client';
import { mapFaq, type ApiFaq } from '@/lib/api/dto';

/**
 * FAQ.
 *
 * Also feeds the FAQPage JSON-LD in the page metadata, so the structured data stays in
 * step with whatever the admin publishes.
 *
 * API SEAM — `{q, a}` is kept as the component contract; the backend stores
 * `{question, answer}`. The rename happens once in the DTO mapper rather than in the
 * accordion component.
 */

export type FaqItem = { q: string; a: string };

/** @endpoint GET /api/v1/faqs */
export async function getFaq(): Promise<FaqItem[]> {
  const rows = await apiList<ApiFaq>('/faqs?isActive=true&limit=100');
  return rows.map(mapFaq);
}
