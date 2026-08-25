/**
 * Arabic error messages for the dashboard.
 *
 * The API answers with snake_case codes plus English Zod messages. Those codes are the
 * wire contract and stay as they are; this module turns them into Arabic prose. The raw
 * payload goes to `console.error` for debugging.
 */

/** The backend's error envelope. */
type ErrorPayload = {
  message?: string;
  error?: {
    code?: string;
    details?: { field?: string; code?: string }[] | null;
  };
} | null;

/** Codes thrown by the API. Anything unlisted falls through to a status-based sentence. */
const CODE_MESSAGES: Record<string, string> = {
  // --- auth
  invalid_credentials: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
  account_disabled: 'هذا الحساب موقوف. تواصل مع مسؤول النظام.',
  admin_access_only: 'هذا الحساب لا يملك صلاحية الدخول إلى لوحة التحكم.',
  Unauthorized: 'انتهت جلستك. يرجى تسجيل الدخول من جديد.',
  unauthorized: 'انتهت جلستك. يرجى تسجيل الدخول من جديد.',
  invalid_token: 'انتهت جلستك. يرجى تسجيل الدخول من جديد.',
  token_expired: 'انتهت جلستك. يرجى تسجيل الدخول من جديد.',
  user_not_authorized: 'لا تملك صلاحية تنفيذ هذا الإجراء.',

  // --- validation
  validation_failed: 'بعض الحقول غير مكتملة أو غير صحيحة. راجع الحقول المعلَّمة بالأحمر.',
  duplicate_entry: 'يوجد عنصر آخر بنفس هذه البيانات.',
  'Invalid resource identifier': 'العنصر المطلوب غير موجود أو تم حذفه.',

  // --- uploads
  file_too_large: 'حجم الملف كبير جداً. اختر ملفاً أصغر.',
  too_many_files: 'عدد الملفات أكبر من المسموح. احذف بعضها وحاول مجدداً.',
  unexpected_file_field: 'تعذّر رفع الملف من هذا الحقل. أعد تحميل الصفحة وحاول مجدداً.',
  file_type_not_allowed: 'نوع الملف غير مدعوم. استخدم صورة بصيغة JPG أو PNG أو WEBP.',
  upload_failed: 'تعذّر رفع الملف. تأكد من سلامته وحاول مجدداً.',
  media_type_mismatch: 'لا يمكن استبدال صورة بمقطع فيديو أو العكس. احذف العنصر وأضِفه من جديد.',
  file_or_external_id_is_required: 'أضف صورة أو معرّف فيديو يوتيوب لهذا العنصر.',
  external_id_requires_video_type: 'معرّف يوتيوب يُستخدم مع عناصر الفيديو فقط.',
  logo_is_required: 'يرجى رفع شعار الشريك.',
  image_is_required: 'يرجى رفع صورة التقييم.',

  // --- not found (one per resource, as the services throw them)
  service_not_found: 'الخدمة غير موجودة أو تم حذفها.',
  product_not_found: 'المنتج غير موجود أو تم حذفه.',
  category_not_found: 'التصنيف غير موجود أو تم حذفه.',
  branch_not_found: 'الفرع غير موجود أو تم حذفه.',
  blog_post_not_found: 'المقال غير موجود أو تم حذفه.',
  package_not_found: 'العرض غير موجود أو تم حذفه.',
  gallery_item_not_found: 'عنصر المعرض غير موجود أو تم حذفه.',
  partner_not_found: 'الشريك غير موجود أو تم حذفه.',
  faq_not_found: 'السؤال غير موجود أو تم حذفه.',
  review_not_found: 'التقييم غير موجود أو تم حذفه.',
  warranty_group_not_found: 'مجموعة الضمان غير موجودة أو تم حذفها.',
  user_not_found: 'المستخدم غير موجود.',
  role_not_found: 'الدور غير موجود.',

  // --- business rules
  compare_at_price_must_exceed_price: 'السعر قبل الخصم يجب أن يكون أعلى من السعر الحالي.',
  cannot_delete_last_admin_user: 'لا يمكن حذف آخر حساب مسؤول.',
  system_role_cannot_be_deleted: 'لا يمكن حذف دور النظام.',
  internal_error: 'حدث خطأ غير متوقع في الخادم. حاول مرة أخرى بعد قليل.',
};

/** `{field}_already_exists` is generated per duplicate key, so it is matched by shape. */
const duplicateMessage = (code: string, labelOf: (field: string) => string): string | null => {
  const match = /^(.+)_already_exists$/.exec(code);
  if (!match?.[1]) return null;
  const label = labelOf(match[1]);
  return label
    ? `القيمة المُدخلة في «${label}» مستخدمة بالفعل. اختر قيمة أخرى.`
    : 'يوجد عنصر آخر بنفس هذه البيانات.';
};

/** Last-resort sentence, by HTTP status. Never shows the number to the admin. */
const STATUS_MESSAGES: Record<number, string> = {
  400: 'تعذّر حفظ البيانات — بعض القيم غير صحيحة.',
  401: 'انتهت جلستك. يرجى تسجيل الدخول من جديد.',
  403: 'لا تملك صلاحية تنفيذ هذا الإجراء.',
  404: 'العنصر المطلوب غير موجود أو تم حذفه.',
  409: 'يوجد عنصر آخر بنفس هذه البيانات.',
  413: 'حجم الملف كبير جداً. اختر ملفاً أصغر.',
  422: 'تعذّر حفظ البيانات — بعض القيم غير صحيحة.',
  429: 'عدد المحاولات كبير. انتظر قليلاً ثم حاول مجدداً.',
  500: 'حدث خطأ في الخادم. حاول مرة أخرى بعد قليل.',
  502: 'الخادم غير متاح حالياً. حاول مرة أخرى بعد قليل.',
  503: 'الخادم غير متاح حالياً. حاول مرة أخرى بعد قليل.',
};

/**
 * Turn one Zod message into Arabic. Matched by shape, since Zod's wording changes
 * between versions; an unmatched message degrades to a generic sentence, never English.
 */
const zodMessage = (raw: string): string => {
  const text = raw.toLowerCase();

  if (text.includes('required') || text.includes('received undefined') || text.includes('received null')) {
    return 'هذا الحقل مطلوب.';
  }
  if (text.includes('invalid url')) return 'أدخل رابطاً صحيحاً يبدأ بـ https://';
  if (text.includes('invalid email')) return 'أدخل بريداً إلكترونياً صحيحاً.';
  if (text.includes('youtube')) return 'أدخل معرّف فيديو يوتيوب صحيحاً (11 خانة).';
  if (text.includes('slug may contain')) return 'الرابط يقبل الحروف والأرقام والشرطات فقط.';
  if (text.includes('percentage')) return 'أدخل نسبة مئوية، مثل ‎58%‎.';
  if (text.includes('too small') || text.includes('at least')) {
    const min = /(\d+)/.exec(raw)?.[1];
    return min ? `القيمة قصيرة جداً — الحد الأدنى ${min}.` : 'القيمة قصيرة جداً.';
  }
  if (text.includes('too big') || text.includes('at most') || text.includes('less than')) {
    const max = /(\d+)/.exec(raw)?.[1];
    return max ? `القيمة طويلة جداً — الحد الأقصى ${max}.` : 'القيمة طويلة جداً.';
  }
  if (text.includes('invalid option') || text.includes('expected one of') || text.includes('enum')) {
    return 'القيمة المختارة غير مسموح بها.';
  }
  if (text.includes('expected number') || text.includes('nan')) return 'أدخل رقماً صحيحاً.';
  if (text.includes('expected array') || text.includes('expected object')) {
    return 'تنسيق هذا الحقل غير صحيح. أعد إدخاله من النموذج.';
  }
  return 'القيمة المُدخلة غير صحيحة.';
};

/** Resolve a wire path (`tiers.0.title`) to the Arabic label plus a 1-based row number. */
const fieldLabel = (path: string, labelOf: (field: string) => string): string => {
  const direct = labelOf(path);
  if (direct) return direct;

  const segments = path.split('.');
  // Longest prefix first, so `tiers.0.title` resolves to the label for `tiers`.
  for (let end = segments.length - 1; end > 0; end -= 1) {
    const base = labelOf(segments.slice(0, end).join('.'));
    if (!base) continue;
    const rest = segments.slice(end);
    const index = rest.find((s) => /^\d+$/.test(s));
    return index ? `${base} — العنصر ${Number(index) + 1}` : base;
  }
  return '';
};

export type TranslatedError = {
  /** One sentence to show above the form. */
  message: string;
  /** Per-field messages, keyed by the field name in the resource config. */
  fields: Record<string, string>;
};

/** Entry point. `labels` comes from `fieldLabels(config)` in resources.ts. */
export function translateApiError(
  payload: unknown,
  status: number | undefined,
  labels: Record<string, string> = {},
): TranslatedError {
  if (payload) console.error('[admin] API error', { status, payload });

  const body = payload as ErrorPayload;
  const labelOf = (field: string) => labels[field] ?? '';

  const fields: Record<string, string> = {};
  for (const detail of body?.error?.details ?? []) {
    if (!detail?.field) continue;
    fields[detail.field] = zodMessage(detail.code ?? '');
  }

  // The code lands on `error.code` or on `message`; prefer whichever is specific, so a
  // generic `internal_error` never masks e.g. `branch_not_found`.
  const candidates = [body?.error?.code, body?.message].filter(
    (c): c is string => Boolean(c),
  );
  const specific = candidates.find((c) => CODE_MESSAGES[c] && c !== 'internal_error');
  const code = specific ?? candidates[0] ?? '';

  // A validation failure is explained by its field list.
  if (Object.keys(fields).length) {
    const named = Object.entries(fields)
      .map(([field, message]) => {
        const label = fieldLabel(field, labelOf);
        return label ? `«${label}»: ${message}` : message;
      })
      .slice(0, 4);
    return { message: named.join(' — '), fields };
  }

  const duplicate = duplicateMessage(code, labelOf);
  if (duplicate) return { message: duplicate, fields };

  if (CODE_MESSAGES[code]) return { message: CODE_MESSAGES[code], fields };

  if (status && STATUS_MESSAGES[status]) return { message: STATUS_MESSAGES[status], fields };

  return { message: 'تعذّر إتمام العملية. حاول مرة أخرى.', fields };
}

/** A fetch that never reached the server: DNS, connection refused, offline. */
export const NETWORK_ERROR_MESSAGE =
  'تعذّر الاتصال بالخادم. تأكد من اتصالك بالإنترنت ثم حاول مجدداً.';

export const SESSION_EXPIRED_MESSAGE = 'انتهت جلستك. يرجى تسجيل الدخول من جديد.';
