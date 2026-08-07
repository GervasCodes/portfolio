import { useEffect, useState } from 'react';
import { PortfolioAPI } from '@/services/api';

// Module-level cache so every page that calls this hook shares one
// request instead of re-fetching /settings on every route change.
let cache = null;
let inflight = null;

/**
 * Site-wide settings (currently: site_title, site_description) as
 * configured in Admin → Settings. Previously that "Site Title" field
 * saved to the backend but nothing on the front end ever read it back,
 * so the browser tab always showed hardcoded placeholder text no
 * matter what was saved. This hook is what makes that field do
 * something — see useDocumentTitle usage in the page components.
 */
export function useSiteSettings() {
  const [settings, setSettings] = useState(cache || {});

  useEffect(() => {
    let mounted = true;
    if (cache) return undefined;

    inflight = inflight || PortfolioAPI.getSettings();
    inflight.then(({ data }) => {
      cache = data || {};
      if (mounted) setSettings(cache);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return settings;
}

/**
 * Builds a "<page label> — <site name>" title, falling back gracefully
 * when the admin hasn't set a Site Title yet.
 */
export function buildTitle(pageLabel, settings, fallbackName) {
  const siteName = settings?.site_title || fallbackName || 'Portfolio';
  return pageLabel ? `${pageLabel} — ${siteName}` : siteName;
}

export default useSiteSettings;
