import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PortfolioAPI } from '@/services/api';

/**
 * Guards admin dashboard pages: verifies the JWT with the backend and
 * redirects to /admin/login if it's missing or invalid.
 */
export function useAdminAuth() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { error } = await PortfolioAPI.me();
      if (!mounted) return;
      if (error) {
        navigate('/admin/login', { replace: true });
      } else {
        setChecking(false);
      }
    })();
    return () => { mounted = false; };
  }, [navigate]);

  return { checking };
}

export default useAdminAuth;
