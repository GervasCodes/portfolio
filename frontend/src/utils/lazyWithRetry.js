import { lazy } from 'react';

/**
 * Drop-in replacement for React.lazy() that recovers from stale-chunk
 * 404s instead of leaving the app on a blank/broken screen.
 *
 * Every route is code-split into its own hashed JS file (e.g.
 * ProjectsPage-mcu236RR.js). Each time the site is redeployed those
 * hashes change. If a visitor's browser has an older index.html cached
 * (or just an older tab left open) and then navigates to / refreshes a
 * lazy route, the browser asks the server for a chunk file that no
 * longer exists on disk -> 404 -> "Failed to load resource: the server
 * responded with a status of 404" and the dynamic import rejects.
 *
 * The fix: on a failed dynamic import, force one full reload so the
 * browser re-fetches the current index.html and its up-to-date chunk
 * map. A sessionStorage flag guards against a reload loop if the
 * import keeps failing for some other reason (e.g. offline).
 */
export function lazyWithRetry(importFn) {
  return lazy(async () => {
    const storageKey = 'chunk-reload-attempted';
    try {
      const mod = await importFn();
      // Successful load — clear any stale retry flag.
      window.sessionStorage.removeItem(storageKey);
      return mod;
    } catch (error) {
      const alreadyRetried = window.sessionStorage.getItem(storageKey) === 'true';
      const isChunkError =
        /Failed to fetch dynamically imported module/i.test(error?.message || '') ||
        /error loading dynamically imported module/i.test(error?.message || '') ||
        /Loading chunk .* failed/i.test(error?.message || '');

      if (!alreadyRetried && isChunkError) {
        window.sessionStorage.setItem(storageKey, 'true');
        window.location.reload();
        // Never resolves — the reload takes over before React needs this.
        return new Promise(() => {});
      }

      // Either not a chunk error, or we already tried reloading once —
      // let it surface normally instead of looping forever.
      throw error;
    }
  });
}

export default lazyWithRetry;
