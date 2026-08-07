import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Next.js scrolls to the top on every route change automatically.
 * react-router doesn't, so this restores that behavior.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
