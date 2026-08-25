'use client';

import { useEffect, useRef, useState } from 'react';
import type { AdminField } from '@/lib/admin/resources';

/**
 * Upload control showing the staged file and the stored one side by side.
 * Type and size are checked against the same limits the route enforces.
 */

const IMAGE_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
/** Mirrors VIDEO_MIME in the server's utils/slotUpload.js. */
const VIDEO_MIME = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv'];

const EXTENSIONS = 'JPG أو PNG أو WEBP أو GIF';

/** Validate one picked file against the field's accept/size rules. */
const checkFile = (file: File, field: { accept?: 'image' | 'media'; maxSizeMB?: number }): string | null => {
  const allowed = field.accept === 'media' ? [...IMAGE_MIME, ...VIDEO_MIME] : IMAGE_MIME;
  if (!allowed.includes(file.type)) {
    return field.accept === 'media'
      ? `«${file.name}» ليس ملفاً مدعوماً. استخدم صورة (${EXTENSIONS}) أو فيديو (MP4 أو WebM).`
      : `«${file.name}» ليس صورة مدعومة. استخدم ${EXTENSIONS}.`;
  }
  const limit = field.maxSizeMB ?? 10;
  if (file.size > limit * 1024 * 1024) {
    const size = (file.size / (1024 * 1024)).toFixed(1);
    return `حجم «${file.name}» ${size} ميغابايت — الحد الأقصى ${limit} ميغابايت.`;
  }
  return null;
};

const isVideoUrl = (url: string) => /\.(mp4|webm|mov|avi|wmv)(\?|$)/i.test(url) || url.includes('/video/upload/');

/** One preview tile, either a stored asset or a freshly picked file. */
function Preview({ src, aspect, video }: { src: string; aspect?: string; video?: boolean }) {
  return (
    <div
      style={{ aspectRatio: (aspect ?? '4/3').replace('/', ' / ') }}
      className="relative w-40 shrink-0 overflow-hidden rounded-[var(--radius-sm)] border border-line bg-ink"
    >
      {video ? (
        <video src={src} controls muted playsInline className="absolute inset-0 size-full object-cover" />
      ) : (
        // Plain <img>: admin chrome, and next/image cannot take a blob: URL.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="absolute inset-0 size-full object-cover" />
      )}
    </div>
  );
}

function EmptyFrame({ aspect }: { aspect?: string }) {
  return (
    <div
      style={{ aspectRatio: (aspect ?? '4/3').replace('/', ' / ') }}
      className="relative w-40 shrink-0 overflow-hidden rounded-[var(--radius-sm)] border border-dashed border-line bg-ink"
    >
      <span className="absolute inset-0 grid place-items-center text-xs text-fg-dim">لا توجد صورة</span>
    </div>
  );
}

export function ImageField({
  field,
  id,
  existing,
  files,
  onFiles,
  invalid,
}: {
  field: AdminField;
  id: string;
  /** URLs already stored on the document, in slot order. */
  existing: string[];
  /** Files currently staged for upload. */
  files: File[];
  onFiles: (files: File[]) => void;
  invalid?: boolean;
}) {
  const multiple = field.type === 'images';
  const max = multiple ? field.count ?? 8 : 1;
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  // Revoke on change/unmount, or the file stays in memory for the life of the tab.
  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  const accept = field.accept === 'media' ? 'image/*,video/*' : IMAGE_MIME.join(',');

  const pick = (list: FileList | null) => {
    if (!list?.length) return;
    const picked = Array.from(list).slice(0, max);

    for (const file of picked) {
      const problem = checkFile(file, field);
      if (problem) {
        setError(problem);
        // Reset so re-picking the same file still fires change.
        if (inputRef.current) inputRef.current.value = '';
        return;
      }
    }

    if (multiple && list.length > max) {
      setError(`اخترت ${list.length} ملفاً — سيتم رفع أول ${max} فقط.`);
    } else {
      setError(null);
    }
    onFiles(picked);
  };

  const clear = () => {
    onFiles([]);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const hasStaged = files.length > 0;
  const storedTiles = existing.filter(Boolean);

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => pick(e.target.files)}
        aria-invalid={invalid || Boolean(error)}
        className={`w-full rounded-[var(--radius-sm)] border px-2 py-1.5 text-sm text-fg-muted file:me-3 file:rounded-[var(--radius-sm)] file:border-0 file:bg-primary file:px-3 file:py-1.5 file:font-bold file:text-white ${
          invalid || error ? 'border-primary' : 'border-line'
        }`}
      />

      {/* Staged */}
      {hasStaged && (
        <div className="rounded-[var(--radius-sm)] border border-primary/40 bg-primary/5 p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs font-bold text-primary">
              {multiple ? `${files.length} ملف جاهز للرفع عند الحفظ` : 'الملف الجديد — سيُرفع عند الحفظ'}
            </p>
            <button
              type="button"
              onClick={clear}
              className="rounded-[var(--radius-sm)] border border-line px-2 py-0.5 text-xs text-fg-muted hover:border-primary"
            >
              إلغاء الاختيار
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {previews.map((url, index) => (
              <Preview
                key={url}
                src={url}
                aspect={field.aspect}
                video={files[index]?.type.startsWith('video/')}
              />
            ))}
          </div>
          {!multiple && files[0] && (
            <p className="mt-2 text-xs text-fg-dim" dir="ltr">
              {files[0].name} · {(files[0].size / (1024 * 1024)).toFixed(2)} MB
            </p>
          )}
        </div>
      )}

      {/* Stored */}
      <div>
        <p className="mb-1 text-xs text-fg-dim">
          {hasStaged ? (storedTiles.length ? 'الحالي (سيُستبدل):' : 'لا توجد صورة محفوظة حالياً.') : 'الصورة الحالية على الموقع:'}
        </p>
        {storedTiles.length ? (
          <div className="flex flex-wrap gap-2">
            {storedTiles.map((url) => (
              <Preview key={url} src={url} aspect={field.aspect} video={isVideoUrl(url)} />
            ))}
          </div>
        ) : (
          !hasStaged && <EmptyFrame aspect={field.aspect} />
        )}
      </div>

      {error && (
        <p role="alert" className="text-xs font-bold text-primary">{error}</p>
      )}

      {field.replaceWarning && (
        <p className="text-xs text-fg-dim">⚠ {field.replaceWarning}</p>
      )}

      <p className="text-xs text-fg-dim">
        المقاس ثابت في التصميم — أي صورة تُقصّ لتناسب الإطار أعلاه ولن تغيّر شكل الصفحة.
        {field.maxSizeMB ? ` الحد الأقصى ${field.maxSizeMB} ميغابايت.` : ''}
      </p>
    </div>
  );
}
