import { useEffect, useState } from 'react';
import { PortfolioAPI } from '@/services/api';

// Shared across components, same pattern as useProfile.
let cache = null;
let inflight = null;

/**
 * Number of published blog posts, or null while unknown / if the request
 * fails. Used to hide "Writing" from the navigation until there is enough
 * to read (see docs/rebuild/01-ia-and-content.md).
 */
export function usePostCount() {
  const [count, setCount] = useState(cache);

  useEffect(() => {
    let mounted = true;
    if (cache !== null) return undefined;

    inflight = inflight || PortfolioAPI.getPosts({ page: 1, limit: 1 });
    inflight
      .then(({ meta }) => {
        cache = Number.isFinite(meta?.total) ? meta.total : 0;
        if (mounted) setCount(cache);
      })
      .catch(() => {
        inflight = null;
      });

    return () => {
      mounted = false;
    };
  }, []);

  return count;
}

export default usePostCount;
