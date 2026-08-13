import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PortfolioAPI } from '@/services/api';

/**
 * Records one real page view per public route change. Admin routes are
 * skipped so the site owner browsing their own dashboard never inflates
 * the public visitor count — see backend/src/controllers/misc.controller.js
 * (recordPageView) for the matching server-side guard.
 */
export default function PageViewTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname.startsWith('/admin')) return;
    PortfolioAPI.recordPageView(pathname).catch(() => {}); // never block/break navigation
  }, [pathname]);

  return null;
}
