import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProjectCards from '@/components/projects/ProjectCards';
import ProjectList from '@/components/projects/ProjectList';
import ProjectFilters from '@/components/projects/ProjectFilters';
import SectionHeader from '@/components/ui/SectionHeader';
import Button from '@/components/ui/Buttons';
import Skeleton from '@/components/ui/Skeleton';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import { useAllProjects } from '@/hooks/useAllProjects';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSiteSettings, buildTitle } from '@/hooks/useSiteSettings';
import { filterProjects, listCategories, listTech } from '@/utils/projectContent';

/** Same box as a card, so the page does not jump when the projects arrive. */
function WorkSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="mb-8 flex gap-3 md:mb-10">
        <Skeleton className="h-11 w-full sm:w-80 !rounded-full" />
        <Skeleton className="ml-auto hidden h-11 w-40 !rounded-full sm:block" />
      </div>
      <div className="mb-8 flex flex-wrap gap-2 md:mb-10">
        {[20, 28, 24, 32].map((w) => <Skeleton key={w} className="h-9 !rounded-full" style={{ width: `${w * 4}px` }} />)}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-[26rem] !rounded-2xl" />)}
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const settings = useSiteSettings();
  useDocumentTitle(buildTitle('Work', settings));

  const { status, projects, reload } = useAllProjects();
  const [params, setParams] = useSearchParams();

  // Everything lives in the URL (?q=&category=&tech=&view=), so a filtered view can be shared or
  // bookmarked. Old links with ?page= still work (all projects are on one page now).
  const category = params.get('category') || '';
  const tech = params.get('tech') || '';
  const view = params.get('view') === 'list' ? 'list' : 'grid';
  const urlQ = params.get('q') || '';

  const [q, setQ] = useState(urlQ);
  const debouncedQ = useDebouncedValue(q, 250);

  const patch = (changes) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(changes).forEach(([k, v]) => {
        if (v) next.set(k, v); else next.delete(k);
      });
      next.delete('page');
      return next;
    }, { replace: true });
  };

  // Typing updates the URL after a short pause; a URL change from outside (back button) updates the box.
  useEffect(() => {
    if (debouncedQ.trim() !== urlQ) patch({ q: debouncedQ.trim() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ]);
  useEffect(() => { setQ(urlQ); }, [urlQ]);

  const categories = useMemo(() => listCategories(projects), [projects]);
  const techList = useMemo(() => listTech(projects), [projects]);
  const visible = useMemo(
    () => filterProjects(projects, { q: urlQ, category, tech }),
    [projects, urlQ, category, tech]
  );

  const clear = () => { setQ(''); setParams({ ...(view === 'list' ? { view: 'list' } : {}) }, { replace: true }); };

  return (
    <div className="pb-24" style={{ paddingTop: 'calc(var(--navbar-h) + 3rem)' }}>
      <div className="container-page">
        <SectionHeader
          as="h1"
          eyebrow="Work"
          title={<>Selected <em>work</em></>}
          description="What I built, what I decided, and how it turned out."
        />

        {status === 'loading' && <WorkSkeleton />}

        {status === 'error' && (
          <ErrorState title="Projects could not be loaded" message="Check your connection, then try again." onRetry={reload} />
        )}

        {status === 'ready' && projects.length === 0 && (
          <EmptyState
            seed="work-empty"
            title="Case studies are on the way"
            description="Projects will appear here as soon as they are published."
            action={<Button href="/contact" variant="secondary">Start a project</Button>}
          />
        )}

        {status === 'ready' && projects.length > 0 && (
          <>
            <ProjectFilters
              categories={categories}
              tech={techList}
              q={q}
              onQ={setQ}
              category={category}
              onCategory={(v) => patch({ category: v })}
              techValue={tech}
              onTech={(v) => patch({ tech: v })}
              view={view}
              onView={(v) => patch({ view: v === 'list' ? 'list' : '' })}
              shown={visible.length}
              total={projects.length}
              onClear={clear}
            />
            {visible.length === 0 ? (
              <EmptyState
                seed="work-no-match"
                title="No projects match"
                description="Try a different word, or clear the filters to see everything."
                action={<Button variant="secondary" onClick={clear}>Clear filters</Button>}
              />
            ) : view === 'list' ? (
              <ProjectList projects={visible} headingAs="h2" />
            ) : (
              <ProjectCards projects={visible} headingAs="h2" />
            )}
          </>
        )}
      </div>
    </div>
  );
}
