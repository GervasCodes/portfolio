import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Search as SearchIcon } from 'lucide-react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSiteSettings, buildTitle } from '@/hooks/useSiteSettings';
import { useNavLinks } from '@/hooks/useNavLinks';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Buttons';

const BLURBS = {
  '/projects': 'Selected projects and case studies.',
  '/about': 'Who is behind this, and how I work.',
  '/blog': 'Notes and articles.',
  '/resume': 'Experience at a glance.',
  '/contact': 'Start a conversation.',
};

export default function NotFoundPage() {
  const settings = useSiteSettings();
  const links = useNavLinks();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  useDocumentTitle(buildTitle('Page not found', settings));

  const onSubmit = (e) => {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/search?q=${encodeURIComponent(term)}` : '/search');
  };

  return (
    <div className="relative isolate overflow-hidden">
      <div
        className="container-page relative z-[1] pb-24"
        style={{ paddingTop: 'calc(var(--navbar-h) + clamp(2rem, 6vw, 5rem))' }}
      >
        <p className="section-label">Error 404</p>
        <h1 className="mt-3 max-w-3xl font-display text-5xl leading-[0.95] tracking-tight md:text-6xl">
          This page <em>doesn’t</em> exist.
        </h1>
        <p className="mt-5 max-w-prose text-muted">
          The link may be old or mistyped. Search for what you were after, or jump to one of the places below.
        </p>

        <form role="search" onSubmit={onSubmit} className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
          <label htmlFor="notfound-search" className="sr-only">Search the site</label>
          <input
            id="notfound-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search projects and writing…"
            autoComplete="off"
            className="input-field h-12 w-full min-w-0 px-4 sm:flex-1"
          />
          <Button type="submit" size="lg" icon={<SearchIcon size={16} aria-hidden="true" />}>Search</Button>
        </form>

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((l) => (
            <li key={l.href}>
              <Card as={Link} to={l.href} interactive className="block h-full p-6">
                <span className="flex items-start justify-end">
                  <ArrowUpRight size={18} className="text-muted" aria-hidden="true" />
                </span>
                <span className="mt-6 block font-display text-3xl leading-none tracking-tight">{l.label}</span>
                <span className="mt-2 block text-sm text-muted">{BLURBS[l.href]}</span>
              </Card>
            </li>
          ))}
        </ul>

        <p className="mt-10">
          <Button href="/" variant="ghost">← Back to home</Button>
        </p>
      </div>
    </div>
  );
}
