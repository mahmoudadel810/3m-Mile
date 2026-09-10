import { site } from '@/data/site';

/**
 * Every form and every CTA converts through WhatsApp, so this is the only place a
 * wa.me URL may be constructed.
 */

/** A prefilled WhatsApp deep link. `number` is the CMS value; omitted, the `site.ts` literal is used. */
export function waLink(text?: string, number?: string): string {
  const base = `https://wa.me/${number || site.whatsapp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** The "book an appointment" link with the CMS number. */
export function bookingLinkFor(number?: string): string {
  return waLink('ابي حجز موعد', number);
}

/** Static "book an appointment" link, for components without settings in hand. */
export const bookingLink = waLink('ابي حجز موعد');

/** `tel:` link for the main line. */
export const telLink = `tel:${site.phone}`;

export type EnquiryFields = {
  name: string;
  phone: string;
  service?: string;
  branch?: string;
  message?: string;
};

/**
 * The enquiry message format the team's WhatsApp inbox expects. Keep the field order and
 * labels stable — they read these at a glance. Empty fields are omitted rather than sent
 * blank.
 */
export function enquiryMessage(fields: EnquiryFields): string {
  const lines = [
    '📝 *طلب جديد (Website)*:',
    '',
    `👤 الاسم: ${fields.name}`,
    `📱 الجوال: ${fields.phone}`,
  ];
  if (fields.service) lines.push(`🚗 الخدمة: ${fields.service}`);
  if (fields.branch) lines.push(`📍 الفرع: ${fields.branch}`);
  if (fields.message) lines.push(`💬 الرسالة: ${fields.message}`);
  return lines.join('\n');
}

export function enquiryLink(fields: EnquiryFields, number?: string): string {
  return waLink(enquiryMessage(fields), number);
}
