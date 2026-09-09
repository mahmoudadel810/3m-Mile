'use client';

import { bookingLinkFor } from '@/lib/whatsapp';
import { Icon, BrandIcon } from '@/components/ui/Icon';
import { CarScrollTop } from './CarScrollTop';

/**
 * The three fixed buttons the source site keeps on screen at all times: WhatsApp and
 * phone stacked at the inline-end edge, and the car scroll-to-top at the inline-start.
 *
 * Both wiggle animations and the double pulse ring are reproduced exactly. They carry
 * `data-loop-animation` so reduced-motion stops them while leaving the buttons visible.
 */
export function FloatingActions({ phone, whatsappNumber }: { phone: string; whatsappNumber: string }) {
  return (
    <>
      {/* WhatsApp — 65px, bottom 140px, with two staggered pulse rings */}
      <div
        className="fixed z-[99998] bottom-[120px] md:bottom-[140px]"
        style={{ insetInlineEnd: 'var(--fab-inset)' }}
      >
        <a
          href={bookingLinkFor(whatsappNumber)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="تواصل معنا عبر واتساب"
          data-loop-animation
          className="group relative z-[1] flex size-[55px] animate-[fab-wiggle-wide_1.5s_ease-in-out_infinite] items-center justify-center rounded-full bg-whatsapp text-white shadow-[var(--shadow-whatsapp)] transition-transform duration-300 md:size-[65px]"
        >
          <BrandIcon name="whatsapp" size={30} className="md:size-[34px]" />

          <span
            aria-hidden="true"
            data-loop-animation
            className="pointer-events-none absolute inset-0 -z-10 animate-[fab-ping_1.5s_ease-out_infinite] rounded-full border-2 border-whatsapp"
          />
          <span
            aria-hidden="true"
            data-loop-animation
            className="pointer-events-none absolute inset-0 -z-10 animate-[fab-ping_1.5s_ease-out_infinite] rounded-full border-2 border-whatsapp [animation-delay:0.75s]"
          />

          {/* Tooltip: slides in from the inline-start side on hover */}
          <span
            className="pointer-events-none absolute hidden whitespace-nowrap rounded-[var(--radius-pill)] bg-white px-4 py-2 text-[15px] font-semibold text-[#111] opacity-0 shadow-[0_4px_20px_rgb(0_0_0/0.15)] transition-all duration-500 group-hover:opacity-100 lg:block"
            style={{ insetInlineEnd: '80px' }}
          >
            تواصل معنا
          </span>
        </a>
      </div>

      {/* Phone */}
      <a
        href={`tel:${phone}`}
        aria-label={`اتصل بنا على ${phone}`}
        data-loop-animation
        className="fixed bottom-[50px] z-[99999] flex size-[55px] animate-[fab-wiggle_1.5s_ease-in-out_infinite] items-center justify-center rounded-full bg-primary text-white shadow-[var(--shadow-card)] md:bottom-[60px] md:size-[65px]"
        style={{ insetInlineEnd: 'var(--fab-inset)' }}
      >
        <Icon name="phone" size={30} className="md:size-[34px]" />
      </a>

      <CarScrollTop />
    </>
  );
}
