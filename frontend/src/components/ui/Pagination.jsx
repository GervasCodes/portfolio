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
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2 mt-12">
      <Link
        to={buildHref(Math.max(page - 1, 1))}
        aria-disabled={page <= 1}
        aria-label="Previous page"
        className={`surface w-11 h-11 rounded-full flex items-center justify-center ${page <= 1 ? 'opacity-30 pointer-events-none' : 'surface-hover'}`}
      >
        <ChevronLeft size={16} aria-hidden="true" />
      </Link>

      {pages.map((p) =>
        typeof p === 'number' ? (
          <Link
            key={p}
            to={buildHref(p)}
            aria-current={p === page ? 'page' : undefined}
            className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-mono transition-colors ${
              p === page ? 'bg-accent text-accent-ink' : 'surface surface-hover text-muted'
            }`}
          >
            {p}
          </Link>
        ) : (
          <span key={p} className="w-11 h-11 flex items-center justify-center text-muted text-sm select-none">
            …
          </span>
        )
      )}

      <Link
        to={buildHref(Math.min(page + 1, totalPages))}
        aria-disabled={page >= totalPages}
        aria-label="Next page"
        className={`surface w-11 h-11 rounded-full flex items-center justify-center ${page >= totalPages ? 'opacity-30 pointer-events-none' : 'surface-hover'}`}
      >
        <ChevronRight size={16} aria-hidden="true" />
      </Link>
    </nav>
  );
}
