import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ProjectCards from '@/components/projects/ProjectCards';
import Pagination from '@/components/ui/Pagination';
import { PortfolioAPI } from '@/services/api';
import { sampleProjects } from '@/utils/sampleData';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useSiteSettings, buildTitle } from '@/hooks/useSiteSettings';

const LIMIT = 9;

export default function ProjectsPage() {
  const settings = useSiteSettings();
  useDocumentTitle(buildTitle('Projects', settings));

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get('q') || undefined;
  const category = searchParams.get('category') || undefined;
  const page = Math.max(parseInt(searchParams.get('page'), 10) || 1, 1);

  const [projects, setProjects] = useState(page === 1 ? sampleProjects : []);
  const [total, setTotal] = useState(sampleProjects.length);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, meta } = await PortfolioAPI.getProjects({ q, category, page, limit: LIMIT });
      if (!mounted) return;
      const resolved = data?.length ? data : (page === 1 ? sampleProjects : []);
      setProjects(resolved);
      setTotal(meta?.total ?? resolved.length);
    })();
    return () => { mounted = false; };
  }, [q, category, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    const formQ = new FormData(e.currentTarget).get('q');
    const params = new URLSearchParams();
    if (formQ) params.set('q', String(formQ));
    if (category) params.set('category', category);
    navigate(`/projects?${params.toString()}`);
  };

  return (
    <div className="pt-28 pb-24">
      <div className="container-page">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="section-label">Portfolio</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            All <span className="text-gradient">Projects</span>
          </h1>
          <p className="text-white/55 mt-4">
            A collection of things I&apos;ve designed, built, and shipped.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 justify-center mb-12">
          <input
            name="q"
            defaultValue={q || ''}
            placeholder="Search projects..."
            className="input-field px-4 py-2.5 text-sm w-full sm:w-72"
          />
          <button className="glass glass-hover rounded-xl px-5 py-2.5 text-sm">Search</button>
        </form>

        {projects.length ? (
          <>
            <ProjectCards projects={projects} />
            <Pagination
              basePath="/projects"
              page={page}
              limit={LIMIT}
              total={total}
              extraParams={{ ...(q ? { q } : {}), ...(category ? { category } : {}) }}
            />
          </>
        ) : (
          <p className="text-center text-white/50">No projects found.</p>
        )}
      </div>
    </div>
  );
}
