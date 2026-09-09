'use client';

import { useEffect } from 'react';

/**
 * "You have unsaved changes" guard for the dashboard.
 *
 * The browser's own `beforeunload` covers reloads, tab closes and the back button; this
 * module covers in-app navigation, which `beforeunload` never fires for.
 */
let dirty = false;

/** True while an editor form holds edits that have not been saved. */
export const hasUnsavedChanges = (): boolean => dirty;

/** Ask before discarding unsaved edits. Returns true when it is safe to proceed. */
export function confirmDiscardChanges(): boolean {
  if (!dirty) return true;
  return window.confirm('لديك تعديلات لم تُحفظ. هل تريد المغادرة وفقدانها؟');
}

/** Registers a form's dirty state; cleared on unmount. */
export function useUnsavedGuard(isDirty: boolean): void {
  useEffect(() => {
    dirty = isDirty;

    if (!isDirty) return;

    const warn = (e: BeforeUnloadEvent) => {
      // Assigning returnValue is what triggers the browser prompt.
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  useEffect(
    () => () => {
      dirty = false;
    },
    [],
  );
}
