'use client';

import { useState } from 'react';
import { enquiryLink } from '@/lib/whatsapp';
import type { Branch } from '@/data/branches';
import { cn } from '@/lib/cn';

/**
 * The site's only form pattern. There is no backend: submitting composes a message and
 * opens a WhatsApp deep link.
 *
 * One component covers all three usages — homepage, contact page, and the packages
 * booking form — differing only by which fields are switched on. Real <label>s (visually
 * hidden), `inputMode="numeric"` on the phone field, and an aria-live confirmation after
 * submit.
 */
export function WhatsAppForm({
  serviceOptions,
  branches = [],
  title,
  withMessage = true,
  withBranch = false,
  submitLabel = 'إرسال',
  className,
  whatsappNumber,
}: {
  serviceOptions: string[];
  /** Only needed when `withBranch` is on. */
  branches?: Branch[];
  title?: string;
  withMessage?: boolean;
  withBranch?: boolean;
  submitLabel?: string;
  className?: string;
  whatsappNumber: string;
}) {
  const [sent, setSent] = useState(false);
  const [values, setValues] = useState({
    name: '',
    phone: '',
    service: '',
    branch: '',
    message: '',
  });

  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setValues((v) => ({
      ...v,
      // Phone field is sanitised to digits as the visitor types.
      [key]: key === 'phone' ? e.target.value.replace(/[^0-9]/g, '') : e.target.value,
    }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.open(enquiryLink(values, whatsappNumber), '_blank', 'noopener,noreferrer');
    setSent(true);
  };

  return (
    <form onSubmit={onSubmit} className={cn('w-full', className)}>
      {title && <p className="mb-4 text-2xl font-bold text-primary">{title}</p>}

      <div className="grid gap-3 md:grid-cols-2">
        <Field label="الاسم الكامل" htmlFor="wf-name">
          <input
            id="wf-name"
            name="name"
            required
            autoComplete="name"
            value={values.name}
            onChange={set('name')}
            placeholder="الاسم الكامل"
            className={inputClass}
          />
        </Field>

        <Field label="رقم الجوال" htmlFor="wf-phone">
          <input
            id="wf-phone"
            name="phone"
            required
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            dir="ltr"
            value={values.phone}
            onChange={set('phone')}
            placeholder="05XXXXXXXX"
            className={cn(inputClass, 'text-end')}
          />
        </Field>

        {withBranch && (
          <Field label="اختر الفرع الأقرب إليك" htmlFor="wf-branch" full={!withMessage}>
            <select
              id="wf-branch"
              name="branch"
              required
              value={values.branch}
              onChange={set('branch')}
              className={inputClass}
            >
              <option value="">اختر الفرع</option>
              {branches.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name} — {b.city}
                </option>
              ))}
            </select>
          </Field>
        )}

        <Field label="نوع الخدمة" htmlFor="wf-service" full={!withBranch}>
          <select
            id="wf-service"
            name="service"
            required
            value={values.service}
            onChange={set('service')}
            className={inputClass}
          >
            <option value="">اختر الخدمة</option>
            {serviceOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>

        {withMessage && (
          <Field label="تفاصيل الاستفسار" htmlFor="wf-message" full>
            <textarea
              id="wf-message"
              name="message"
              rows={4}
              value={values.message}
              onChange={set('message')}
              placeholder="اكتب رسالتك هنا..."
              className={cn(inputClass, 'resize-y')}
            />
          </Field>
        )}
      </div>

      <button
        type="submit"
        className="mt-4 w-full rounded-[var(--radius-md)] bg-primary px-6 py-3 font-bold text-white transition-colors duration-300 hover:bg-white hover:text-primary md:w-auto md:px-10"
      >
        {submitLabel}
      </button>

      <p aria-live="polite" className="mt-3 text-sm text-fg-muted">
        {sent && 'تم فتح واتساب في نافذة جديدة — أكمل الإرسال من هناك.'}
      </p>
    </form>
  );
}

const inputClass =
  'w-full rounded-[var(--radius-md)] border border-line bg-white px-4 py-3 text-base text-black placeholder:text-[#777] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary';

function Field({
  label,
  htmlFor,
  full,
  children,
}: {
  label: string;
  htmlFor: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <p className={cn('m-0', full && 'md:col-span-2')}>
      {/* Visually hidden so the layout is unchanged; the field is still announced properly. */}
      <label htmlFor={htmlFor} className="sr-only">
        {label}
      </label>
      {children}
    </p>
  );
}
