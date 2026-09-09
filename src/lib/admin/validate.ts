/**
 * Client-side form validation, in Arabic.
 *
 * The server stays the authority — this only anticipates its rules so the common
 * mistakes never leave the browser. Whatever slips through is translated on the way
 * back by `lib/admin/errors.ts`.
 */

import type { AdminField, ResourceConfig } from './resources';

export type FieldErrors = Record<string, string>;

/** "Please enter/choose/upload {label}", phrased for the control's type. */
const requiredMessage = (field: AdminField): string => {
  switch (field.type) {
    case 'select':
    case 'relation':
    case 'link':
      return `يرجى اختيار ${field.label}`;
    case 'image':
    case 'images':
      return `يرجى رفع ${field.label}`;
    case 'repeater':
    case 'stringList':
    case 'tags':
      return `يرجى إضافة ${field.label}`;
    default:
      return `يرجى إدخال ${field.label}`;
  }
};

const parseArray = (value: string): unknown[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

/** Cross-field rules, keyed by resource. Returns messages keyed by field name. */
const CROSS_FIELD_RULES: Record<
  string,
  (values: Record<string, string>, hasFile: (name: string) => boolean, isNew: boolean, doc: Record<string, unknown> | null) => FieldErrors
> = {
  // Server-side: `file_or_external_id_is_required`.
  gallery: (values, hasFile, isNew, doc) => {
    const errors: FieldErrors = {};
    const hasStored = Boolean(doc?.url);
    if (values.type === 'video') {
      // A video item is either an uploaded file (`file`) or a YouTube reel (`externalId`).
      const hasVideo = hasFile('file') || hasStored;
      if (!values.externalId && !hasVideo) {
        errors.externalId = 'عناصر الفيديو تحتاج رفع ملف فيديو أو إدخال معرّف يوتيوب.';
      }
      if (values.externalId && hasFile('file')) {
        errors.externalId = 'اختر إما ملف الفيديو أو معرّف يوتيوب، وليس كليهما.';
      }
    } else if (values.type === 'image') {
      if (values.externalId) errors.externalId = 'معرّف يوتيوب يُستخدم مع عناصر الفيديو فقط — اتركه فارغاً.';
      if (isNew && !hasFile('file')) errors.file = 'يرجى رفع صورة لهذا العنصر.';
      if (!isNew && !hasStored && !hasFile('file')) errors.file = 'يرجى رفع صورة لهذا العنصر.';
    }
    return errors;
  },
};

export function validateForm({
  config,
  values,
  hasFile,
  isNew,
  doc,
}: {
  config: ResourceConfig;
  values: Record<string, string>;
  /** Whether a file is staged for the given slot name. */
  hasFile: (name: string) => boolean;
  isNew: boolean;
  doc: Record<string, unknown> | null;
}): { errors: FieldErrors; rowErrors: Record<string, Record<string, string>> } {
  const errors: FieldErrors = {};
  /** Repeater sub-cell messages, keyed `field → "index.subName"`. */
  const rowErrors: Record<string, Record<string, string>> = {};

  for (const field of config.fields) {
    const value = (values[field.name] ?? '').trim();

    // --- required -------------------------------------------------------
    if (field.required) {
      const filled =
        field.type === 'image' || field.type === 'images'
          ? hasFile(field.name) || Boolean(doc && readImage(doc, field.name))
          : field.type === 'repeater' || field.type === 'stringList'
            ? parseArray(values[field.name] ?? '').length > 0
            : Boolean(value);

      if (!filled) {
        errors[field.name] = requiredMessage(field);
        continue;
      }
    }

    if (!value) continue;

    // --- shape ----------------------------------------------------------
    if (field.maxLength && value.length > field.maxLength) {
      errors[field.name] = `${field.label}: الحد الأقصى ${field.maxLength} حرفاً (المُدخل ${value.length}).`;
      continue;
    }

    if (field.pattern && !field.pattern.test.test(value)) {
      errors[field.name] = field.pattern.message;
      continue;
    }

    if (field.type === 'number' || field.type === 'percent') {
      const numeric = field.type === 'percent' ? Number(value.replace('%', '')) : Number(value);
      if (Number.isNaN(numeric)) {
        errors[field.name] = `${field.label}: أدخل رقماً صحيحاً.`;
        continue;
      }
      if (field.min !== undefined && numeric < field.min) {
        errors[field.name] = `${field.label}: أقل قيمة مسموحة ${field.min}.`;
        continue;
      }
      if (field.max !== undefined && numeric > field.max) {
        errors[field.name] = `${field.label}: أعلى قيمة مسموحة ${field.max}.`;
        continue;
      }
      if (field.type === 'percent' && (numeric < 0 || numeric > 100)) {
        errors[field.name] = `${field.label}: النسبة بين 0 و100.`;
        continue;
      }
    }

    // --- repeater rows --------------------------------------------------
    if (field.type === 'repeater' && field.item) {
      const rows = parseArray(values[field.name] ?? '') as Record<string, unknown>[];
      const cells: Record<string, string> = {};

      rows.forEach((row, index) => {
        for (const sub of field.item ?? []) {
          const cell = row?.[sub.name];
          const text = cell === undefined || cell === null ? '' : String(cell).trim();
          if (sub.required && !text) {
            cells[`${index}.${sub.name}`] = `يرجى إدخال ${sub.label}`;
          } else if (sub.maxLength && text.length > sub.maxLength) {
            cells[`${index}.${sub.name}`] = `الحد الأقصى ${sub.maxLength} حرفاً.`;
          } else if (sub.type === 'number' && text && Number.isNaN(Number(text))) {
            cells[`${index}.${sub.name}`] = 'أدخل رقماً صحيحاً.';
          }
        }
      });

      if (Object.keys(cells).length) {
        rowErrors[field.name] = cells;
        errors[field.name] = `راجع الحقول المطلوبة داخل «${field.label}».`;
      }

      if (field.maxItems && rows.length > field.maxItems) {
        errors[field.name] = `${field.label}: الحد الأقصى ${field.maxItems} عناصر.`;
      }
      if (field.minItems && rows.length < field.minItems) {
        errors[field.name] = `هذا القسم يحتاج ${field.minItems} عناصر بالضبط.`;
      }
    }

    // --- stringList items -------------------------------------------------
    if (field.type === 'stringList' && field.itemMaxLength) {
      const items = parseArray(values[field.name] ?? '') as unknown[];
      const tooLong = items.some((item) => String(item ?? '').length > field.itemMaxLength!);
      if (tooLong) {
        errors[field.name] = `${field.label}: كل عنصر بحد أقصى ${field.itemMaxLength} حرفاً.`;
      }
    }
  }

  Object.assign(errors, CROSS_FIELD_RULES[config.key]?.(values, hasFile, isNew, doc) ?? {});

  return { errors, rowErrors };
}

/** Whether a document already holds an image in this slot (so a new one is optional). */
function readImage(doc: Record<string, unknown>, name: string): string {
  const value = name.split('.').reduce<unknown>((acc, key) => (acc == null ? acc : (acc as Record<string, unknown>)[key]), doc);
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'url' in value) return String((value as { url?: string }).url ?? '');
  if (Array.isArray(value) && value.length) return 'stored';
  if (name === 'file') return String(doc.url ?? '');
  return '';
}
