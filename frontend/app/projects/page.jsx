import ProjectCards from '@/components/projects/ProjectCards';
import Pagination from '@/components/ui/Pagination';
import { PortfolioAPI } from '@/services/api';
import { sampleProjects } from '@/utils/sampleData';

export const metadata = { title: 'Projects — Portfolio' };

const LIMIT = 9;

export default async function ProjectsPage({ searchParams }) {
  const { q, category } = searchParams || {};
  const page = Math.max(parseInt(searchParams?.page, 10) || 1, 1);

  const { data, meta } = await PortfolioAPI.getProjects({ q, category, page, limit: LIMIT });
  const projects = data?.length ? data : (page === 1 ? sampleProjects : []);
  const total = meta?.total ?? projects.length;

  return (
    <div className="pt-28 pb-24">
      <div className="container-page">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm uppercase tracking-widest text-accent-light mb-3">Portfolio</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            All <span className="text-gradient">Projects</span>
          </h1>
          <p className="text-white/55 mt-4">
            A collection of things I&apos;ve designed, built, and shipped.
          </p>
        </div>

        <form className="flex flex-wrap gap-3 justify-center mb-12" action="/projects">
          <input
            name="q"
            defaultValue={q || ''}
            placeholder="Search projects..."
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent-light w-full sm:w-72"
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
