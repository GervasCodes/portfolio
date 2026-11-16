import { useCallback, useEffect, useState } from 'react';
import { PortfolioAPI } from '@/services/api';

// Every published project, fetched once and shared (module cache) by the Work
// index and the case-study "next project" footer. The index filters on the
// client, so it needs the full list; the page size below only bounds each request.
const PAGE = 50;
let cache = null;
let inflight = null;

async function fetchAll() {
  const first = await PortfolioAPI.getProjects({ page: 1, limit: PAGE });
  if (first.error) throw new Error(first.error);
  const items = [...(first.data || [])];
  const total = first.meta?.total ?? items.length;
  const pages = Math.ceil(total / PAGE);
  if (pages > 1) {
    const rest = await Promise.all(
      Array.from({ length: pages - 1 }, (_, i) => PortfolioAPI.getProjects({ page: i + 2, limit: PAGE }))
    );
    rest.forEach((r) => {
      if (r.error) throw new Error(r.error);
      items.push(...(r.data || []));
    });
  }
  return items;
}

/** { status: 'loading' | 'ready' | 'error', projects, reload } */
export function useAllProjects() {
  const [state, setState] = useState(
    cache ? { status: 'ready', projects: cache } : { status: 'loading', projects: [] }
  );

  const load = useCallback(() => {
    let live = true;
    if (cache) {
      setState({ status: 'ready', projects: cache });
      return () => { live = false; };
    }
    setState({ status: 'loading', projects: [] });
    inflight = inflight || fetchAll();
    inflight
      .then((items) => {
        cache = items;
        if (live) setState({ status: 'ready', projects: items });
      })
      .catch(() => {
        // Failures are never cached, so "Try again" really retries.
        if (live) setState({ status: 'error', projects: [] });
      })
      .finally(() => { inflight = null; });
    return () => { live = false; };
  }, []);

  useEffect(() => load(), [load]);

  const reload = useCallback(() => {
    cache = null;
    load();
  }, [load]);

  return { ...state, reload };
}

export default useAllProjects;
