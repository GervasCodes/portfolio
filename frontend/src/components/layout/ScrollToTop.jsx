import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Route-change housekeeping for a single-page app:
 *  - moves focus to <main> so keyboard and screen-reader users start at the new
 *    page, not back in the navbar (skipped on the very first load);
 *  - scrolls to a #hash target once the new page has rendered it.
 * Scrolling back to the top happens in App.jsx (AnimatePresence onExitComplete),
 * after the old page has faded out, so the old page never visibly jumps.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const first = useRef(true);

  useEffect(() => {
    if (!first.current) document.getElementById('main-content')?.focus({ preventScroll: true });
    first.current = false;
  }, [pathname]);

  useEffect(() => {
    if (!hash) return undefined;
    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      let el = null;
      try { el = document.getElementById(decodeURIComponent(hash.slice(1))); } catch { /* malformed hash */ }
      if (el || tries > 15) {
        window.clearInterval(timer);
        el?.scrollIntoView();
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [pathname, hash]);

  return null;
}
