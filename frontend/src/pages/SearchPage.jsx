import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, X } from 'lucide-react';
import Pagination from '@/components/ui/Pagination';
import SectionHeader from '@/components/ui/SectionHeader';
import Card from '@/components/ui/Card';
import Tag from '@/components/ui/Tag';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Button from '@/components/ui/Buttons';
import Seo from '@/components/seo/Seo';
import { PortfolioAPI } from '@/services/api';
import { useSiteSettings, buildTitle } from '@/hooks/useSiteSettings';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { formatLongDate, postTags, resultsLabel } from '@/utils/blogContent';

const LIMIT = 9;
const TYPES = [
  { value: 'all', label: 'All' },
  { value: 'projects', label: 'Projects' },
  { value: 'blog', label: 'Writing' },
];

function ResultCard({ item }) {
  const isProject = item.resultType === 'project';
  const href = isProject ? `/projects/${item.slug}` : `/blog/${item.slug}`;
  const summary = isProject ? item.summary : item.excerpt;
  const tags = (isProject ? (Array.isArray(item.tech_stack) ? item.tech_stack : []) : postTags(item)).slice(0, 5);
  const date = !isProject ? formatLongDate(item.published_at) : '';

  return (
    <Card as={Link} to={href} interactive className="flex h-full flex-col p-6">
      <p className="m-0 flex flex-wrap items-center gap-x-3 font-mono text-xs uppercase tracking-[0.12em]">
        <span className="text-accent">{isProject ? 'Project' : 'Writing'}</span>
        {date && <span className="text-muted">{date}</span>}
      </p>
      <h2 className="mt-3 font-display text-2xl font-normal leading-tight tracking-tight">{item.title}</h2>
      {summary && <p className="mt-3 line-clamp-3 flex-1 text-muted">{summary}</p>}
      {tags.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {tags.map((t) => <Tag key={t}>{t}</Tag>)}
        </div>
      )}
    </Card>
  );
}

export default function SearchPage() {
  const settings = useSiteSettings();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlQ = searchParams.get('q') || '';
  const type = TYPES.some((t) => t.value === searchParams.get('type')) ? searchParams.get('type') : 'all';
  const page = Math.max(parseInt(searchParams.get('page'), 10) || 1, 1);

  // Local input state, debounced before it drives the actual query: the URL
  // (and therefore the request) only updates once typing pauses.
  const [inputValue, setInputValue] = useState(urlQ);
  const debouncedQ = useDebouncedValue(inputValue, 350);

  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [attempt, setAttempt] = useState(0);

  // Only focus the field by itself where there is no on-screen keyboard to pop up.
  const autoFocus = typeof window !== 'undefined' && window.matchMedia?.('(pointer: fine)').matches;

  // Keep the input in sync if the URL changes from outside (back/forward nav).
  useEffect(() => { setInputValue(urlQ); }, [urlQ]);

  // Push debounced input into the URL (resetting to page 1), replacing
  // history so every keystroke does not add an entry.
  useEffect(() => {
    if (debouncedQ === urlQ) return;
    const next = new URLSearchParams(searchParams);
    if (debouncedQ) next.set('q', debouncedQ);
    else next.delete('q');
    next.delete('page');
    setSearchParams(next, { replace: true });
    // Runs only when the debounced input changes; urlQ/searchParams are read fresh each time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);

  const activeQuery = useMemo(() => urlQ.trim(), [urlQ]);

  useEffect(() => {
    if (!activeQuery) {
      setResults([]);
      setTotal(0);
      setStatus('idle');
      return undefined;
    }
    let mounted = true;
    setStatus('loading');
    (async () => {
      const { data, meta, error } = await PortfolioAPI.search({ q: activeQuery, type, page, limit: LIMIT });
      if (!mounted) return;
      if (error) {
        setStatus('error');
        return;
      }
      setResults(data || []);
      setTotal(meta?.total ?? (data || []).length);
      setStatus('ready');
    })();
    return () => { mounted = false; };
  }, [activeQuery, type, page, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  const setParam = (mutate) => {
    const next = new URLSearchParams(searchParams);
    mutate(next);
    next.delete('page');
    setSearchParams(next);
  };
  const handleTypeChange = (nextType) => setParam((n) => (nextType === 'all' ? n.delete('type') : n.set('type', nextType)));
  const handleSubmit = (e) => {
    e.preventDefault();
    setParam((n) => (inputValue.trim() ? n.set('q', inputValue.trim()) : n.delete('q')));
  };
  const clear = () => { setInputValue(''); setParam((n) => n.delete('q')); };

  return (
    <div className="pb-24" style={{ paddingTop: 'calc(var(--navbar-h) + 3rem)' }}>
      <Seo title={buildTitle(urlQ ? `Search: ${urlQ}` : 'Search', settings)} noindex path="/search" />
      <div className="container-page">
        <SectionHeader as="h1" eyebrow="Search" title={<>Find a <em>project</em> or post</>} />

        <form role="search" onSubmit={handleSubmit} className="flex max-w-3xl flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <label htmlFor="site-search" className="sr-only">Search projects and writing</label>
            <SearchIcon size={18} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              id="site-search"
              type="search"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search projects and writing…"
              autoComplete="off"
              autoFocus={autoFocus}
              className="input-field min-h-12 w-full pl-12 pr-12 text-base"
            />
            {inputValue && (
              <button
                type="button"
                onClick={clear}
                aria-label="Clear search"
                className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-muted transition-colors duration-fast hover:text-ink"
              >
                <X size={18} aria-hidden="true" />
              </button>
            )}
          </div>
          <Button type="submit" size="lg">Search</Button>
        </form>

        <div role="group" aria-label="Filter results by type" className="mt-5 flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              aria-pressed={type === t.value}
              onClick={() => handleTypeChange(t.value)}
              className={`inline-flex min-h-11 items-center rounded-full border px-5 text-sm transition-colors duration-fast ${
                type === t.value
                  ? 'border-accent bg-accent text-accent-ink'
                  : 'border-line text-muted hover:border-control hover:text-ink'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Announced to screen readers whenever the results change. */}
        <p role="status" aria-live="polite" className="mt-8 font-mono text-xs uppercase tracking-[0.12em] text-muted">
          {status === 'loading' && 'Searching…'}
          {status === 'ready' && total > 0 && resultsLabel(total, activeQuery)}
          {status === 'ready' && total === 0 && `No results for “${activeQuery}”`}
        </p>

        <div className="mt-6">
          {status === 'idle' && (
            <EmptyState
              title="What are you looking for?"
              description="Type a technology, a project name or a topic to search my work and writing."
              seed="search"
              action={(
                <div className="flex flex-wrap justify-center gap-3">
                  <Button href="/projects" variant="secondary">Browse the work</Button>
                  <Button href="/blog" variant="ghost">Read the writing</Button>
                </div>
              )}
            />
          )}

          {status === 'loading' && (
            <div aria-hidden="true" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => <Skeleton key={i} className="h-56 w-full rounded-3xl" />)}
            </div>
          )}

          {status === 'error' && (
            <ErrorState title="Search is not working right now" message="Check your connection, then try again." onRetry={retry} />
          )}

          {status === 'ready' && results.length === 0 && (
            <EmptyState
              title="Nothing found"
              description={type === 'all' ? 'Try a different word, or a shorter one.' : 'Try a different word, or search everything.'}
              seed={`none-${activeQuery}`}
              action={type !== 'all' ? <Button variant="secondary" onClick={() => handleTypeChange('all')}>Search everything</Button> : undefined}
            />
          )}

          {status === 'ready' && results.length > 0 && (
            <>
              <ul className="m-0 grid list-none gap-6 p-0 md:grid-cols-2 lg:grid-cols-3">
                {results.map((item) => (
                  <li key={`${item.resultType}-${item.id || item.slug}`}><ResultCard item={item} /></li>
                ))}
              </ul>
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
    </div>
  );
}
