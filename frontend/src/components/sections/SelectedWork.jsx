import { useId } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import Card from '@/components/ui/Card';
import Tag from '@/components/ui/Tag';
import SectionHeader from '@/components/ui/SectionHeader';
import PlaceholderArt from '@/components/ui/PlaceholderArt';
import Button from '@/components/ui/Buttons';
import Reveal from '@/components/ui/Reveal';
import { useHoverVideo } from '@/hooks/useHoverVideo';
import { formatYear } from '@/utils/homeContent';
import ProgressiveImage from '@/components/ui/ProgressiveImage';

// Card widths on a 6-column grid (static strings so Tailwind keeps them).
// First card is a full-width feature; the rest share the second row.
const REST_SPAN = { 1: 'lg:col-span-6', 2: 'lg:col-span-3', 3: 'lg:col-span-2' };

/** Cover image, or generated art when the project has none. Plays a muted loop on hover if one exists. */
function Cover({ project, video }) {
  const { src, visible, videoRef, onPlaying } = video;
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-2">
      {project.cover_image_url ? (
        <ProgressiveImage
          src={project.cover_image_url}
          width="1600"
          height="1000"
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-slow ease-standard group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      ) : (
        <PlaceholderArt seed={project.slug || project.title} className="absolute inset-0 h-full w-full" />
      )}
      {src && (
        <video
          ref={videoRef}
          src={src}
          muted
          loop
          playsInline
          preload="none"
          tabIndex={-1}
          aria-hidden="true"
          onPlaying={onPlaying}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-base ease-standard ${visible ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  );
}

function WorkCard({ project, index, feature, className = '' }) {
  const titleId = useId();
  const video = useHoverVideo(project.id);
  const stack = Array.isArray(project.tech_stack) ? project.tech_stack.slice(0, feature ? 5 : 3) : [];
  const year = formatYear(project.created_at);

  return (
    <Reveal delay={index * 80} className={className}>
      <Card
        as={Link}
        to={`/projects/${project.slug}`}
        interactive
        aria-labelledby={titleId}
        className={`group block h-full ${feature ? 'lg:grid lg:grid-cols-[1.35fr_1fr]' : ''}`}
        {...video.handlers}
      >
        <Cover project={project} video={video} />
        <div className="flex flex-col p-6 md:p-8">
          <div className="flex items-center justify-between gap-4 font-mono text-xs uppercase tracking-[0.12em] text-muted">
            <span>
              <span aria-hidden="true">{String(index + 1).padStart(2, '0')} / </span>
              {project.category || 'Project'}
            </span>
            {year && <span>{year}</span>}
          </div>
          <h3
            id={titleId}
            className={`mt-4 font-display font-normal leading-[1.05] tracking-tight transition-colors duration-fast group-hover:text-accent ${feature ? 'text-4xl md:text-5xl' : 'text-3xl'}`}
          >
            {project.title}
          </h3>
          {project.summary && (
            <p className={`mt-4 text-muted ${feature ? 'line-clamp-4' : 'line-clamp-3'}`}>{project.summary}</p>
          )}
          {stack.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {stack.map((t) => <Tag key={t}>{t}</Tag>)}
            </div>
          )}
          <p className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm text-accent">
            {project.case_study_enabled ? 'Read the case study' : 'View project'}
            <ArrowUpRight size={16} aria-hidden="true" className="transition-transform duration-base ease-standard group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </p>
        </div>
      </Card>
    </Reveal>
  );
}

/** Designed empty state: shown until the first project is published and marked featured. */
function WorkEmpty() {
  return (
    <div className="card grid items-center gap-8 p-6 md:grid-cols-2 md:p-10">
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-line">
        <PlaceholderArt seed="selected-work" className="absolute inset-0 h-full w-full" />
      </div>
      <div>
        <h3 className="font-display text-3xl font-normal tracking-tight">Case studies are on the way</h3>
        <p className="mt-3 max-w-prose text-muted">
          Featured projects will appear here as soon as they are published. In the meantime, you can browse everything else.
        </p>
        <div className="mt-6">
          <Button href="/projects" variant="secondary">Browse projects</Button>
        </div>
      </div>
    </div>
  );
}

/** Selected work: 1 feature card + up to 3 more. Real covers only; generated art when a cover is missing. */
export default function SelectedWork({ projects = [], number }) {
  const [first, ...rest] = projects;
  const restSpan = REST_SPAN[rest.length] || 'lg:col-span-2';

  return (
    <section id="work" className="scroll-mt-24 py-section">
      <div className="container-page">
        <SectionHeader
          number={number}
          eyebrow="Work"
          title={<>Selected <em>work</em></>}
          description={first ? 'A few projects I am proud of, and how they came together.' : undefined}
        />
        {first ? (
          <>
            <div className="grid gap-5 lg:grid-cols-6 lg:gap-6">
              <WorkCard project={first} index={0} feature className="lg:col-span-6" />
              {rest.map((p, i) => (
                <WorkCard key={p.id || p.slug} project={p} index={i + 1} feature={false} className={restSpan} />
              ))}
            </div>
            <div className="mt-10">
              <Button href="/projects" variant="secondary" icon={<ArrowRight size={16} aria-hidden="true" />}>
                All projects
              </Button>
            </div>
          </>
        ) : (
          <WorkEmpty />
        )}
      </div>
    </section>
  );
}
