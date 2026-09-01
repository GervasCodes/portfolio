import { useEffect, useState } from 'react';
import { PortfolioAPI } from '@/services/api';

// Module-level cache so every component that calls this hook shares one
// request instead of re-fetching /profile on every route change — same
// pattern as useSiteSettings.
let cache = null;
let inflight = null;

/**
 * The single profile record (name, contact info, social links) as
 * configured in Admin → Profile. Lets layout components like Footer read
 * real contact/social data instead of hardcoding it, so updating a phone
 * number or social handle only requires an admin-panel edit.
 */
export function useProfile() {
  const [profile, setProfile] = useState(cache || null);

  useEffect(() => {
    let mounted = true;
    if (cache) return undefined;

    inflight = inflight || PortfolioAPI.getProfile();
    inflight.then(({ data }) => {
      cache = data || {};
      if (mounted) setProfile(cache);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return profile;
}

export default useProfile;
