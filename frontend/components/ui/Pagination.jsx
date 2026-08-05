'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/** Simple prev/next + page-number pagination that preserves other query params. */
export default function Pagination({ basePath, page, limit, total, extraParams = {} }) {
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  if (totalPages <= 1) return null;

  const buildHref = (p) => {
    const params = new URLSearchParams({ ...extraParams, page: String(p) });
    return `${basePath}?${params.toString()}`;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <Link
        href={buildHref(Math.max(page - 1, 1))}
        aria-disabled={page <= 1}
        className={`glass w-10 h-10 rounded-xl flex items-center justify-center ${page <= 1 ? 'opacity-30 pointer-events-none' : 'glass-hover'}`}
      >
        <ChevronLeft size={16} />
      </Link>

      {pages.map((p) => (
        <Link
          key={p}
          href={buildHref(p)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm ${
            p === page ? 'bg-gradient-to-r from-accent to-cyan-accent text-white' : 'glass glass-hover text-white/60'
          }`}
        >
          {p}
        </Link>
      ))}

      <Link
        href={buildHref(Math.min(page + 1, totalPages))}
        aria-disabled={page >= totalPages}
        className={`glass w-10 h-10 rounded-xl flex items-center justify-center ${page >= totalPages ? 'opacity-30 pointer-events-none' : 'glass-hover'}`}
      >
        <ChevronRight size={16} />
      </Link>
    </div>
  );
}
