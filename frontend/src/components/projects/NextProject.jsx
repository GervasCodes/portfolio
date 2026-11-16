import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import ProjectCover from '@/components/projects/ProjectCover';
import Skeleton from '@/components/ui/Skeleton';

/** Footer of a case study: the next project as a large card, the previous one as a quiet link. */
export default function NextProject({ status, prev, next }) {
  if (status === 'error') return null;
  if (status === 'loading') {
    return <Skeleton className="mt-20 h-56 w-full !rounded-3xl md:h-64" />;
  }
  if (!next) return null;

  return (
    <nav aria-label="More projects" className="mt-20 md:mt-28">
      <Card as={Link} to={`/projects/${next.slug}`} interactive aria-label={`Next project: ${next.title}`} className="group grid md:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col justify-center p-6 md:p-10">
          <p className="text-sm text-muted">Next project</p>
          <p className="mt-4 font-display text-4xl font-normal leading-[1.05] tracking-tight transition-colors duration-fast group-hover:text-accent md:text-5xl">
            {next.title}
          </p>
          {next.summary && <p className="mt-4 line-clamp-2 max-w-md text-muted">{next.summary}</p>}
          <span className="mt-6 inline-flex items-center gap-2 text-sm text-accent">
            {next.case_study_enabled ? 'Read the case study' : 'View project'}
            <ArrowRight size={16} aria-hidden="true" className="transition-transform duration-base ease-standard group-hover:translate-x-1 motion-reduce:transition-none" />
          </span>
        </div>
        <ProjectCover project={next} className="order-first md:order-last md:h-full md:!aspect-auto" imgClassName="transition-transform duration-slow ease-standard group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
      </Card>
      {prev && prev.slug !== next.slug && (
        <Link to={`/projects/${prev.slug}`} className="mt-5 inline-flex items-center gap-2 text-sm text-muted hover:text-ink [@media(pointer:coarse)]:min-h-11">
          <ArrowLeft size={16} aria-hidden="true" />
          <span><span className="sr-only">Previous project: </span>{prev.title}</span>
        </Link>
      )}
    </nav>
  );
}
