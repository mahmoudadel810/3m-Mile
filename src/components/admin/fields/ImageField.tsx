'use client';

import { useEffect, useRef, useState } from 'react';
import type { AdminField } from '@/lib/admin/resources';
import { MEDIA_SPECS, checkAspect, type MediaSpec, type SlotKey } from '@/lib/admin/mediaSpec';
import { useImageDimensions } from '@/hooks/useImageDimensions';

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

/** Slot to check a picked file against; a video in the gallery slot uses `gallery.video`. */
const specKeyFor = (field: { spec?: SlotKey }, file: File): SlotKey | undefined => {
  if (!field.spec) return undefined;
  if (field.spec === 'gallery.image' && file.type.startsWith('video/')) return 'gallery.video';
  return field.spec;
};

/** Same as `specKeyFor`, for an already-stored URL. */
const storedSpecKeyFor = (field: { spec?: SlotKey }, isVideo: boolean): SlotKey | undefined => {
  if (!field.spec) return undefined;
  if (field.spec === 'gallery.image' && isVideo) return 'gallery.video';
  return field.spec;
};

/** A video whose metadata never loads must not stall the pick forever. */
const VIDEO_PROBE_TIMEOUT_MS = 8000;

/**
 * Pixel dimensions of a picked file, read locally. Images use `createImageBitmap` with
 * an `<img>` fallback; videos use `<video preload="metadata">`. Object URLs are revoked
 * on every path.
 */
async function readDimensions(file: File): Promise<{ width: number; height: number }> {
  if (file.type.startsWith('video/')) {
    return new Promise((resolve, reject) => {
      const v = document.createElement('video');
      v.preload = 'metadata';
      v.muted = true;

      const cleanup = () => {
        clearTimeout(timer);
        v.onloadedmetadata = null;
        v.onerror = null;
        URL.revokeObjectURL(v.src);
      };
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error('timed out reading video metadata'));
      }, VIDEO_PROBE_TIMEOUT_MS);

      v.onloadedmetadata = () => {
        const dims = { width: v.videoWidth, height: v.videoHeight };
        cleanup();
        resolve(dims);
      };
      v.onerror = () => {
        cleanup();
        reject(new Error('could not read video metadata'));
      };
      v.src = URL.createObjectURL(file);
    });
  }

  if (typeof createImageBitmap === 'function') {
    try {
      const bmp = await createImageBitmap(file);
      try {
        return { width: bmp.width, height: bmp.height };
      } finally {
        bmp.close();
      }
    } catch {
      // Some formats reject createImageBitmap but decode fine through an <img>.
    }
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('could not read image metadata'));
    };
    img.src = url;
  });
}

/** Mismatch message for a stored asset, or `null` while probing or when it fits its slot. */
function useStoredMismatch(src: string, spec: MediaSpec | undefined, isVideo: boolean): string | null {
  const imageDims = useImageDimensions(!isVideo && spec ? src : null);
  const [videoDims, setVideoDims] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    setVideoDims(null);
    if (!isVideo || !spec) return;
    let alive = true;
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.muted = true;

    const timer = setTimeout(cleanup, VIDEO_PROBE_TIMEOUT_MS);
    function cleanup() {
      clearTimeout(timer);
      v.onloadedmetadata = null;
      v.onerror = null;
    }
    v.onloadedmetadata = () => {
      if (alive) setVideoDims({ width: v.videoWidth, height: v.videoHeight });
      cleanup();
    };
    v.onerror = cleanup;
    v.src = src;

    return () => {
      alive = false;
      cleanup();
    };
  }, [src, isVideo, spec]);

  if (!spec) return null;
  const dims = isVideo ? videoDims : imageDims;
  if (!dims) return null;
  const result = checkAspect(dims.width, dims.height, spec);
  return result.ok ? null : result.message;
}

/** One preview tile, either a stored asset or a freshly picked file. */
function Preview({
  src,
  aspect,
  video,
  spec,
}: {
  src: string;
  aspect?: string;
  video?: boolean;
  /** Stored previews only; picked files are checked at pick time. */
  spec?: MediaSpec;
}) {
  const mismatch = useStoredMismatch(src, spec, Boolean(video));
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
      {mismatch && (
        <p role="alert" className="absolute inset-x-0 bottom-0 bg-primary/90 p-1 text-[10px] font-bold leading-tight text-white">
          مقاس غير مطابق — يحتاج استبدال
          <span className="block font-normal">{mismatch}</span>
        </p>
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
  onValidity,
}: {
  field: AdminField;
  id: string;
  /** URLs already stored on the document, in slot order. */
  existing: string[];
  /** Files currently staged for upload. */
  files: File[];
  onFiles: (files: File[]) => void;
  invalid?: boolean;
  /** Whether the current pick is clean; the form disables Save while it is not. */
  onValidity?: (ok: boolean) => void;
}) {
  const multiple = field.type === 'images';
  const max = multiple ? field.count ?? 8 : 1;
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  // Non-blocking warning when a file's dimensions could not be read.
  const [notice, setNotice] = useState<string | null>(null);
  const [previews, setPreviews] = useState<string[]>([]);

  // Revoke on change/unmount, or the file stays in memory for the life of the tab.
  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    // Clear stale messages when the form resets the staged files after a save.
    if (files.length === 0) {
      setNotice(null);
      setError((e) => (e && e.startsWith('اخترت ') ? null : e));
    }
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  // Report clean on unmount so a removed field cannot leave Save locked.
  const onValidityRef = useRef(onValidity);
  useEffect(() => {
    onValidityRef.current = onValidity;
  });
  useEffect(() => () => onValidityRef.current?.(true), []);

  const accept = field.accept === 'media' ? 'image/*,video/*' : IMAGE_MIME.join(',');

  // Generation counter so an older pick that resolves late is ignored.
  const pickGen = useRef(0);

  const pick = async (list: FileList | null) => {
    if (!list?.length) return;
    const gen = ++pickGen.current;
    const picked = Array.from(list).slice(0, max);

    const reject = (message: string) => {
      setError(message);
      // Reset so re-picking the same file still fires change.
      if (inputRef.current) inputRef.current.value = '';
      onValidity?.(false);
    };

    for (const file of picked) {
      const problem = checkFile(file, field);
      if (problem) {
        reject(problem);
        return;
      }
    }

    // The first bad file blocks the whole pick, so a multi-image slot never stages a partial batch.
    let unreadable: string | null = null;
    for (const file of picked) {
      const specKey = specKeyFor(field, file);
      const spec = specKey && MEDIA_SPECS[specKey];
      if (!spec) continue;
      try {
        const { width, height } = await readDimensions(file);
        if (gen !== pickGen.current) return;
        const result = checkAspect(width, height, spec);
        if (!result.ok) {
          reject(`«${file.name}» — ${result.message}`);
          return;
        }
      } catch {
        if (gen !== pickGen.current) return;
        // Unreadable metadata: skip the size gate but tell the admin.
        unreadable = `تعذّر قراءة مقاس «${file.name}» — تأكد من المقاس يدوياً (المطلوب ${spec.width}×${spec.height}، ولا يقل عن ${spec.minWidth}×${spec.minHeight}).`;
      }
    }
    if (gen !== pickGen.current) return;

    setNotice(unreadable);
    if (multiple && list.length > max) {
      setError(`اخترت ${list.length} ملفاً — سيتم رفع أول ${max} فقط.`);
    } else {
      setError(null);
    }
    onValidity?.(true);
    onFiles(picked);
  };

  const clear = () => {
    pickGen.current++; // a pick still in flight must not stage anything after this
    onFiles([]);
    setError(null);
    setNotice(null);
    onValidity?.(true);
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
        onChange={(e) => void pick(e.target.files)}
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
            {storedTiles.map((url) => {
              const isVideo = isVideoUrl(url);
              const specKey = storedSpecKeyFor(field, isVideo);
              return (
                <Preview
                  key={url}
                  src={url}
                  aspect={field.aspect}
                  video={isVideo}
                  spec={specKey ? MEDIA_SPECS[specKey] : undefined}
                />
              );
            })}
          </div>
        ) : (
          !hasStaged && <EmptyFrame aspect={field.aspect} />
        )}
      </div>

      {error && (
        <p role="alert" className="text-xs font-bold text-primary">{error}</p>
      )}

      {notice && (
        <p role="status" className="text-xs font-bold text-fg-muted">⚠ {notice}</p>
      )}

      {field.replaceWarning && (
        <p className="text-xs text-fg-dim">⚠ {field.replaceWarning}</p>
      )}
    </div>
  );
}
