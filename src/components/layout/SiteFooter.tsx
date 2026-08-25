'use client';

import { useState } from 'react';
import Link from 'next/link';
import { site } from '@/data/site';
import type { SocialLink } from '@/data/settings';
import { footerNav } from '@/data/nav';
import { telLink } from '@/lib/whatsapp';
import { Icon, BrandIcon, type BrandName } from '@/components/ui/Icon';
import { FooterMap } from './FooterMap';
import { cn } from '@/lib/cn';

/**
 * Site footer: description + branch map, four link columns, socials.
 *
 * The columns behave differently by breakpoint on the source site — hover dropdowns on
 * desktop, click accordions below 992px — so the submenu is a real <button> here and
 * gets both behaviours rather than the source's `onclick="toggleMobileMenu(...)"` inline
 * handler.
 */
export function SiteFooter({ social }: { social: SocialLink[] }) {
  const [openCol, setOpenCol] = useState<string | null>(null);

  return (
    <footer className="bg-ink px-4 pt-4 pb-5 text-end">
      {/* Description + map */}
      <div className="mx-auto mb-10 grid max-w-[var(--container)] items-center gap-6 md:mb-12 lg:grid-cols-[1.2fr_1fr] lg:gap-10">
        <p className="px-2 text-center text-base leading-relaxed font-semibold text-[#eee] lg:px-0 lg:text-end lg:text-lg">
          مراكز 3M مايل المعتمدة في المملكة العربية السعودية، متخصصون في مجال العناية
          بالسيارات نلتزم بأعلى معايير الجودة وأحدث التقنيات المبتكرة في حماية السيارات
          وتظليل عازل حراري لنقدم خدمة متميزة لعملائنا.
        </p>
        <div className="mx-auto w-full lg:mx-0">
          <FooterMap />
        </div>
      </div>

      {/* Link columns */}
      <div className="mx-auto mb-6 grid max-w-[var(--container)] grid-cols-2 gap-4 sm:gap-8 md:mb-10 lg:grid-cols-4 lg:gap-8">
        {footerNav.map((col) => (
          <div key={col.title}>
            <h2 className="relative mb-3 pb-2.5 text-lg font-bold sm:mb-5 sm:text-[22px] after:absolute after:end-0 after:bottom-0 after:h-0.5 after:w-10 after:bg-primary-strong after:content-['']">
              {col.title}
            </h2>
            <ul>
              {col.items.map((item) => {
                const isOpen = openCol === item.label;
                return (
                  <li key={item.label} className="relative mb-3 lg:[&:hover>ul]:visible lg:[&:hover>ul]:translate-y-0 lg:[&:hover>ul]:opacity-100">
                    {item.children ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setOpenCol(isOpen ? null : item.label)}
                          aria-expanded={isOpen}
                          className="flex w-fit items-center gap-2 text-base font-semibold transition-colors hover:text-primary-strong sm:text-lg"
                        >
                          <Icon name="arrowCircle" size={15} className="text-primary-strong rtl-flip" />
                          <span>{item.label}</span>
                          <Icon
                            name="chevronDown"
                            size={13}
                            className={cn(
                              'text-fg-dim transition-transform duration-300',
                              isOpen && 'rotate-180 text-primary-strong'
                            )}
                          />
                        </button>
                        <ul
                          className={cn(
                            'mt-1.5 rounded-[5px] bg-[#111] p-2.5 lg:absolute lg:top-full lg:z-[100] lg:min-w-[180px]',
                            'lg:border lg:border-[#333] lg:bg-surface-2 lg:shadow-[0_5px_15px_rgb(0_0_0/0.5)]',
                            'lg:invisible lg:translate-y-2.5 lg:opacity-0 lg:transition-all lg:duration-300',
                            isOpen ? 'block' : 'hidden lg:block'
                          )}
                          style={{ insetInlineEnd: 0 }}
                        >
                          {item.children.map((child) => (
                            <li key={child.href} className="mb-2 border-b border-[#333] pb-1.5 last:mb-0 last:border-0 last:pb-0">
                              <Link
                                href={child.href}
                                className="flex items-center gap-1.5 text-[15px] font-semibold transition-colors hover:text-primary-strong"
                              >
                                <Icon
                                  name={child.icon === 'video' ? 'video' : 'images'}
                                  size={12}
                                  className="text-primary-strong"
                                />
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        className="flex items-center gap-2 text-base font-semibold transition-colors hover:text-primary-strong sm:text-lg"
                      >
                        <Icon name="arrowCircle" size={15} className="text-primary-strong rtl-flip" />
                        {item.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        {/* Contact column — links are tel:/mailto:, so it is not part of footerNav */}
        <div>
          <h2 className="relative mb-3 pb-2.5 text-lg font-bold sm:mb-5 sm:text-[22px] after:absolute after:end-0 after:bottom-0 after:h-0.5 after:w-10 after:bg-primary-strong after:content-['']">
            تواصل معنا
          </h2>
          <ul>
            <li className="mb-3">
              <Link href="/فروعنا" className="flex items-center gap-2 text-base font-semibold transition-colors hover:text-primary-strong sm:text-lg">
                <Icon name="pin" size={15} className="text-primary-strong" />
                فروعنا
              </Link>
            </li>
            <li className="mb-3">
              <a href={telLink} className="flex items-center gap-2 text-base font-semibold transition-colors hover:text-primary-strong sm:text-lg">
                <Icon name="phone" size={15} className="text-primary-strong" />
                <span dir="ltr">{site.phone}</span>
              </a>
            </li>
            <li className="mb-3">
              <a href={`mailto:${site.email}`} className="flex items-center gap-2 text-base font-semibold transition-colors hover:text-primary-strong sm:text-lg">
                <Icon name="mail" size={15} className="text-primary-strong" />
                <span dir="ltr">{site.email}</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Payment + socials + copyright */}
      <div className="mx-auto max-w-[var(--container)] border-t border-[#222] pt-8 text-center">
        {/*
          The payment-methods strip was a static file and is gone. The shop takes no
          payments — every product converts through WhatsApp — so there is nothing to
          advertise here and the row is dropped rather than re-sourced.
        */}
        <p className="mb-4 text-lg font-bold">تابع اخبارنا علي منصات التواصل</p>
        <div className="mb-8 flex justify-center gap-5">
          {social.map((s) => (
            <a
              key={s.name}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className="flex size-10 items-center justify-center rounded-full bg-surface-2 text-white transition-colors duration-300 hover:bg-primary-strong"
            >
              <BrandIcon name={s.name as BrandName} size={18} />
            </a>
          ))}
        </div>

        <p className="text-sm text-fg-muted">
          جميع الحقوق محفوظة لشركة 3M مايل © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
