import { site } from '@/data/site';

/**
 * Every form and every CTA converts through WhatsApp, so this is the only place a
 * wa.me URL may be constructed.
 */

/** A prefilled WhatsApp deep link. */
export function waLink(text?: string): string {
  const base = `https://wa.me/${site.whatsapp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** The generic "book an appointment" link used by the header and floating buttons. */
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
 * Mirrors the message format the live site sends, so the team's WhatsApp inbox keeps
 * looking exactly as it does today. Empty fields are omitted rather than sent blank.
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

export function enquiryLink(fields: EnquiryFields): string {
  return waLink(enquiryMessage(fields));
}
