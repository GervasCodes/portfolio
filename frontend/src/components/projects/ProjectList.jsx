import { AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Tag from '@/components/ui/Tag';
import ProjectCover from '@/components/projects/ProjectCover';
import { FilterItem } from '@/components/projects/ProjectCards';
import { projectYear } from '@/utils/projectContent';

/** Compact list view of projects: thumbnail, title, summary, tags. Used by the Work index. */
export default function ProjectList({ projects = [], eagerCount = 3, headingAs: Heading = 'h3' }) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      <AnimatePresence mode="popLayout" initial={false}>
        {projects.map((p, i) => {
          const year = projectYear(p);
          const stack = Array.isArray(p.tech_stack) ? p.tech_stack : [];
          return (
            <FilterItem as="li" key={p.id || p.slug}>
              <Link
                to={`/projects/${p.slug}`}
                className="group grid grid-cols-[6.5rem_1fr] items-center gap-4 py-5 sm:grid-cols-[9rem_1fr] md:grid-cols-[11rem_1fr_auto] md:gap-8 md:py-6"
              >
                <ProjectCover project={p} eager={i < eagerCount} className="rounded-lg border border-line" />
                <div className="min-w-0">
                  <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
                    <span aria-hidden="true">{String(i + 1).padStart(2, '0')} / </span>
                    {p.category || 'Project'}{year ? ` · ${year}` : ''}
                  </p>
                  <Heading className="mt-1.5 font-display text-2xl font-normal leading-tight tracking-tight transition-colors duration-fast group-hover:text-accent">
                    {p.title}
                  </Heading>
                  {p.summary && <p className="mt-2 line-clamp-2 text-sm text-muted">{p.summary}</p>}
                  {stack.length > 0 && (
                    <div className="mt-3 hidden flex-wrap gap-2 sm:flex">
                      {stack.slice(0, 5).map((t) => <Tag key={t}>{t}</Tag>)}
                    </div>
                  )}
                </div>
                <span className="hidden items-center gap-1.5 text-sm text-accent md:inline-flex">
                  {p.case_study_enabled ? 'Case study' : 'View'}
                  <ArrowUpRight size={16} aria-hidden="true" className="transition-transform duration-base ease-standard group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </Link>
            </FilterItem>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
