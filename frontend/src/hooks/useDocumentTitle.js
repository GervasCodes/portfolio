import { useEffect } from 'react';

/**
 * Replaces Next's `export const metadata = { title }` / `generateMetadata`.
 * Pass null/undefined to skip (e.g. while data is still loading).
 */
export function useDocumentTitle(title) {
  useEffect(() => {
    if (title) document.title = title;
  }, [title]);
}

export default useDocumentTitle;
