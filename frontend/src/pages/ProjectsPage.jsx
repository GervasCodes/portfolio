import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProjectList from '@/components/projects/ProjectList';
import Pagination from '@/components/ui/Pagination';
import SectionHeader from '@/components/ui/SectionHeader';
import Button from '@/components/ui/Buttons';
import Field, { Input } from '@/components/ui/Field';
import Skeleton from '@/components/ui/Skeleton';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import { PortfolioAPI } from '@/services/api';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSiteSettings, buildTitle } from '@/hooks/useSiteSettings';

const LIMIT = 9;

export default function ProjectsPage() {
  const settings = useSiteSettings();
  useDocumentTitle(buildTitle('Work', settings));

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get('q') || undefined;
  const category = searchParams.get('category') || undefined;
  const page = Math.max(parseInt(searchParams.get('page'), 10) || 1, 1);

  const [state, setState] = useState({ status: 'loading', projects: [], total: 0 });

  useEffect(() => {
    let mounted = true;
    setState((s) => ({ ...s, status: 'loading' }));
    (async () => {
      const { data, meta, error } = await PortfolioAPI.getProjects({ q, category, page, limit: LIMIT });
      if (!mounted) return;
      if (error) setState({ status: 'error', projects: [], total: 0 });
      else setState({ status: 'ready', projects: data || [], total: meta?.total ?? (data || []).length });
    })();
    return () => { mounted = false; };
  }, [q, category, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    const formQ = new FormData(e.currentTarget).get('q');
    const params = new URLSearchParams();
    if (formQ) params.set('q', String(formQ));
    if (category) params.set('category', category);
    navigate(`/projects${params.toString() ? `?${params}` : ''}`);
  };

  const { status, projects, total } = state;

  return (
    <div className="pb-24" style={{ paddingTop: 'calc(var(--navbar-h) + 3rem)' }}>
      <div className="container-page">
        <SectionHeader
          as="h1"
          eyebrow="Work"
          title="Selected work"
          description="What I built, what I decided, and how it turned out."
        />

        <form onSubmit={handleSearch} role="search" className="flex flex-wrap items-end gap-3 mb-10">
          <div className="w-full sm:w-72">
            <Field label="Search projects"><Input name="q" defaultValue={q || ''} /></Field>
          </div>
          <Button type="submit" variant="secondary">Search</Button>
        </form>

        {status === 'loading' && <Skeleton className="h-48 w-full" />}
        {status === 'error' && (
          <ErrorState title="Projects could not be loaded" message="Check your connection, then try again." onRetry={() => window.location.reload()} />
        )}
        {status === 'ready' && projects.length === 0 && (
          <EmptyState title="No projects found" description={q ? `Nothing matches “${q}”.` : 'Nothing has been published yet.'} />
        )}
        {status === 'ready' && projects.length > 0 && (
          <>
            <ProjectList projects={projects} />
            <Pagination
              basePath="/projects"
              page={page}
              limit={LIMIT}
              total={total}
              extraParams={{ ...(q ? { q } : {}), ...(category ? { category } : {}) }}
            />
          </>
        )}
      </div>
    </div>
  );
}
