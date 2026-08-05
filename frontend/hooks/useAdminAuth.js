'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PortfolioAPI } from '@/services/api';

/**
 * Guards admin dashboard pages: verifies the JWT with the backend and
 * redirects to /admin/login if it's missing or invalid.
 */
export function useAdminAuth() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { error } = await PortfolioAPI.me();
      if (!mounted) return;
      if (error) {
        router.replace('/admin/login');
      } else {
        setChecking(false);
      }
    })();
    return () => { mounted = false; };
  }, [router]);

  return { checking };
}

export default useAdminAuth;
