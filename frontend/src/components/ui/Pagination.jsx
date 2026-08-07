import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/** Builds a windowed page-number sequence with ellipses, e.g. [1, '…', 4, 5, 6, '…', 20]. */
function buildPageRange(page, totalPages, siblings = 1) {
  const range = [];
  const start = Math.max(2, page - siblings);
  const end = Math.min(totalPages - 1, page + siblings);

  range.push(1);
  if (start > 2) range.push('ellipsis-start');
  for (let p = start; p <= end; p += 1) range.push(p);
  if (end < totalPages - 1) range.push('ellipsis-end');
  if (totalPages > 1) range.push(totalPages);

  return range;
}

/** Simple prev/next + page-number pagination that preserves other query params. */
export default function Pagination({ basePath, page, limit, total, extraParams = {} }) {
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  if (totalPages <= 1) return null;

  const buildHref = (p) => {
    const params = new URLSearchParams({ ...extraParams, page: String(p) });
    return `${basePath}?${params.toString()}`;
  };

  const pages = buildPageRange(page, totalPages);

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <Link
        to={buildHref(Math.max(page - 1, 1))}
        aria-disabled={page <= 1}
        className={`glass w-10 h-10 rounded-xl flex items-center justify-center ${page <= 1 ? 'opacity-30 pointer-events-none' : 'glass-hover'}`}
      >
        <ChevronLeft size={16} />
      </Link>

      {pages.map((p) =>
        typeof p === 'number' ? (
          <Link
            key={p}
            to={buildHref(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm transition-colors ${
              p === page ? 'bg-gradient-to-r from-accent to-cyan-accent text-white' : 'glass glass-hover text-white/60'
            }`}
          >
            {p}
          </Link>
        ) : (
          <span key={p} className="w-10 h-10 flex items-center justify-center text-white/30 text-sm select-none">
            …
          </span>
        )
      )}

      <Link
        to={buildHref(Math.min(page + 1, totalPages))}
        aria-disabled={page >= totalPages}
        className={`glass w-10 h-10 rounded-xl flex items-center justify-center ${page >= totalPages ? 'opacity-30 pointer-events-none' : 'glass-hover'}`}
      >
        <ChevronRight size={16} />
      </Link>
    </div>
  );
}
