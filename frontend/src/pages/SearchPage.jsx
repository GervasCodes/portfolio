import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Calendar, Eye } from 'lucide-react';
import Pagination from '@/components/ui/Pagination';
import Seo from '@/components/seo/Seo';
import { PortfolioAPI } from '@/services/api';
import { useSiteSettings, buildTitle } from '@/hooks/useSiteSettings';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

const LIMIT = 9;
const TYPES = [
  { value: 'all', label: 'All' },
  { value: 'projects', label: 'Projects' },
  { value: 'blog', label: 'Blog' },
];

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function ResultCard({ item }) {
  const isProject = item.resultType === 'project';
  const href = isProject ? `/projects/${item.slug}` : `/blog/${item.slug}`;
  const summary = isProject ? item.summary : item.excerpt;
  const tags = isProject ? item.tech_stack : item.tags;

  return (
    <Link to={href} className="glass glass-hover rounded-2xl p-6 flex flex-col h-full">
      <div className="flex items-center gap-3 text-xs text-white/40 mb-3">
        <span className="uppercase tracking-widest text-accent-light">{isProject ? 'Project' : 'Blog'}</span>
        {!isProject && item.published_at && (
          <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(item.published_at)}</span>
        )}
        {!isProject && (
          <span className="flex items-center gap-1"><Eye size={12} /> {item.views ?? 0}</span>
        )}
      </div>
      <h2 className="font-display font-semibold text-lg mb-2">{item.title}</h2>
      {summary && <p className="text-sm text-white/55 flex-1 line-clamp-3">{summary}</p>}
      {Array.isArray(tags) && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {tags.slice(0, 6).map((t) => (
            <span key={t} className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 text-white/60 border border-white/10">
              {t}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

export default function SearchPage() {
  const settings = useSiteSettings();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlQ = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'all';
  const page = Math.max(parseInt(searchParams.get('page'), 10) || 1, 1);

  // Local input state, debounced before it drives the actual query — the
  // URL (and therefore the request) only updates once typing pauses.
  const [inputValue, setInputValue] = useState(urlQ);
  const debouncedQ = useDebouncedValue(inputValue, 350);

  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const pageTitle = buildTitle(urlQ ? `Search: ${urlQ}` : 'Search', settings);

  // Keep the input in sync if the URL changes from outside (back/forward nav).
  useEffect(() => {
    setInputValue(urlQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQ]);

  // Push debounced input into the URL (resetting to page 1), replacing
  // history instead of pushing so every keystroke doesn't add an entry.
  useEffect(() => {
    if (debouncedQ === urlQ) return;
    const next = new URLSearchParams(searchParams);
    if (debouncedQ) next.set('q', debouncedQ);
    else next.delete('q');
    next.delete('page');
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  const activeQuery = useMemo(() => urlQ.trim(), [urlQ]);

  useEffect(() => {
    if (!activeQuery) {
      setResults([]);
      setTotal(0);
      setHasSearched(false);
      return undefined;
    }
    let mounted = true;
    setLoading(true);
    (async () => {
      const { data, meta } = await PortfolioAPI.search({ q: activeQuery, type, page, limit: LIMIT });
      if (!mounted) return;
      setResults(data || []);
      setTotal(meta?.total ?? 0);
      setLoading(false);
      setHasSearched(true);
    })();
    return () => { mounted = false; };
  }, [activeQuery, type, page]);

  const handleTypeChange = (nextType) => {
    const next = new URLSearchParams(searchParams);
    if (nextType === 'all') next.delete('type');
    else next.set('type', nextType);
    next.delete('page');
    setSearchParams(next);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (inputValue) next.set('q', inputValue);
    else next.delete('q');
    next.delete('page');
    setSearchParams(next);
  };

  return (
    <div className="pt-28 pb-24">
      <Seo title={pageTitle} noindex path="/search" />
      <div className="container-page">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="section-label">Search</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            Find <span className="text-gradient">Projects &amp; Posts</span>
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 justify-center mb-6">
          <div className="relative w-full sm:w-96">
            <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search projects and blog posts..."
              className="input-field pl-11 pr-4 py-2.5 text-sm w-full"
              autoFocus
            />
          </div>
          <button className="glass glass-hover rounded-xl px-5 py-2.5 text-sm">Search</button>
        </form>

        <div className="flex items-center justify-center gap-2 mb-12">
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => handleTypeChange(t.value)}
              className={`px-4 py-2 rounded-xl text-sm transition-colors ${
                type === t.value ? 'bg-gradient-to-r from-accent to-cyan-accent text-white' : 'glass glass-hover text-white/60'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {!activeQuery && (
          <p className="text-center text-white/50">Start typing to search projects and blog posts.</p>
        )}

        {activeQuery && loading && (
          <p className="text-center text-white/50">Searching…</p>
        )}

        {activeQuery && !loading && hasSearched && results.length === 0 && (
          <p className="text-center text-white/50">No results for &quot;{activeQuery}&quot;.</p>
        )}

        {activeQuery && !loading && results.length > 0 && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((item) => (
                <ResultCard key={`${item.resultType}-${item.id || item.slug}`} item={item} />
              ))}
            </div>
            <Pagination
              basePath="/search"
              page={page}
              limit={LIMIT}
              total={total}
              extraParams={{ q: activeQuery, ...(type !== 'all' ? { type } : {}) }}
            />
          </>
        )}
      </div>
    </div>
  );
}
