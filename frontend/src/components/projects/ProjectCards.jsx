import { forwardRef, useId } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import Tag from '@/components/ui/Tag';
import ProjectCover from '@/components/projects/ProjectCover';
import { projectYear } from '@/utils/projectContent';

/**
 * Wraps a grid/list item so filtering animates: items fade and the rest glide
 * into place (transform only). With reduced motion it is a plain element.
 */
export const FilterItem = forwardRef(function FilterItem({ as = 'div', children }, ref) {
  const reduce = useReducedMotion();
  if (reduce) {
    const Plain = as;
    return <Plain ref={ref}>{children}</Plain>;
  }
  const Animated = motion[as];
  return (
    <Animated
      ref={ref}
      layout="position"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.15, ease: 'easeOut' } }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Animated>
  );
});

/** Responsive grid of project cards. Used by the Work index; `eagerCount` covers load the first row eagerly. */
export default function ProjectCards({ projects = [], eagerCount = 3, headingAs = 'h3' }) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      <AnimatePresence mode="popLayout" initial={false}>
        {projects.map((project, i) => (
          <FilterItem as="li" key={project.id || project.slug}>
            <ProjectCard project={project} index={i} eager={i < eagerCount} headingAs={headingAs} />
          </FilterItem>
        ))}
      </AnimatePresence>
    </ul>
  );
}

export function ProjectCard({ project, index = 0, eager = false, headingAs: Heading = 'h3' }) {
  const titleId = useId();
  const year = projectYear(project);
  const stack = Array.isArray(project.tech_stack) ? project.tech_stack : [];

  return (
    <Card
      as={Link}
      to={`/projects/${project.slug}`}
      interactive
      aria-labelledby={titleId}
      className="group flex h-full flex-col"
    >
      <div className="relative">
        <ProjectCover
          project={project}
          eager={eager}
          imgClassName="transition-transform duration-slow ease-standard group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        {project.featured && (
          <span className="absolute left-3 top-3 inline-flex items-center rounded-md border border-accent/40 bg-bg/90 px-2 py-0.5 text-xs font-medium text-accent">Featured</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <div className="flex items-center justify-between gap-3 text-sm text-muted">
          <span>{project.category || 'Project'}</span>
          {year && <span>{year}</span>}
        </div>
        <Heading
          id={titleId}
          className="mt-3 font-display text-2xl font-normal leading-[1.1] tracking-tight transition-colors duration-fast group-hover:text-accent"
        >
          {project.title}
        </Heading>
        {project.summary && <p className="mt-3 line-clamp-3 text-sm text-muted">{project.summary}</p>}
        {stack.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {stack.slice(0, 3).map((t) => <Tag key={t}>{t}</Tag>)}
            {stack.length > 3 && <Tag>+{stack.length - 3}</Tag>}
          </div>
        )}
        <p className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm text-accent">
          {project.case_study_enabled ? 'Read the case study' : 'View project'}
          <ArrowUpRight size={16} aria-hidden="true" className="transition-transform duration-base ease-standard group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </p>
      </div>
    </Card>
  );
}
