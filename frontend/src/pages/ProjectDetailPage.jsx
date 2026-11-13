import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ProjectGallery from '@/components/projects/ProjectGallery';
import Button from '@/components/ui/Buttons';
import Markdown from '@/components/ui/Markdown';
import Tag from '@/components/ui/Tag';
import Skeleton from '@/components/ui/Skeleton';
import Seo from '@/components/seo/Seo';
import NotFoundPage from '@/pages/NotFoundPage';
import { PortfolioAPI } from '@/services/api';
import { useSiteSettings, buildTitle } from '@/hooks/useSiteSettings';
import { absoluteUrl, truncate, resolveImage } from '@/utils/seo';

// Reading order from the case-study template in docs/rebuild/01-ia-and-content.md.
// Database fields keep their names; only the labels change. Empty sections are skipped.
const CASE_STUDY_SECTIONS = [
  { key: 'case_study_problem', label: 'Problem' },
  { key: 'case_study_approach', label: 'Decisions and trade-offs' },
  { key: 'case_study_architecture', label: 'Architecture' },
  { key: 'case_study_results', label: 'Result' },
  { key: 'case_study_lessons', label: 'What I would change' },
];

const isRealUrl = (u) => u && u !== '#';

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const [state, setState] = useState({ status: 'loading', project: null });
  const settings = useSiteSettings();

  useEffect(() => {
    let mounted = true;
    setState({ status: 'loading', project: null });
    (async () => {
      const { data } = await PortfolioAPI.getProjectBySlug(slug);
      if (!mounted) return;
      setState(data ? { status: 'ready', project: data } : { status: 'missing', project: null });
    })();
    return () => { mounted = false; };
  }, [slug]);

  if (state.status === 'missing') return <NotFoundPage />;

  const top = { paddingTop: 'calc(var(--navbar-h) + 3rem)' };

  if (state.status === 'loading') {
    return (
      <div className="pb-24" style={top}>
        <div className="container-page max-w-3xl space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  const { project } = state;
  const description = truncate(project.summary || project.description || '');
  const image = resolveImage(project.cover_image_url, project.gallery?.[0]);
  const hasMedia =
    (Array.isArray(project.media) && project.media.length > 0) ||
    (Array.isArray(project.gallery) && project.gallery.length > 0);
  const sections = project.case_study_enabled
    ? CASE_STUDY_SECTIONS.filter(({ key }) => project[key]?.trim())
    : [];
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description,
    url: absoluteUrl(`/projects/${project.slug}`),
    ...(image ? { image } : {}),
    ...(Array.isArray(project.tech_stack) && project.tech_stack.length
      ? { keywords: project.tech_stack.join(', ') }
      : {}),
    ...(project.category ? { genre: project.category } : {}),
  };

  return (
    <div className="pb-24" style={top}>
      <Seo
        title={buildTitle(project.title, settings)}
        description={description}
        path={`/projects/${project.slug}`}
        image={image}
        type="article"
        siteName={settings?.site_title}
        structuredData={structuredData}
      />
      <div className="container-page max-w-3xl">
        <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink mb-10">
          <ArrowLeft size={16} /> All work
        </Link>

        {project.category && <p className="section-label">{project.category}</p>}
        <h1 className="font-display text-4xl md:text-5xl font-normal leading-tight tracking-tight">
          {project.title}
        </h1>
        {project.summary && <p className="mt-5 text-xl text-ink leading-relaxed font-display">{project.summary}</p>}

        {(isRealUrl(project.live_url) || isRealUrl(project.repo_url)) && (
          <div className="mt-8 flex flex-wrap gap-3">
            {isRealUrl(project.live_url) && <Button href={project.live_url}>Visit live site</Button>}
            {isRealUrl(project.repo_url) && <Button href={project.repo_url} variant="secondary">View code</Button>}
          </div>
        )}

        {Array.isArray(project.tech_stack) && project.tech_stack.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2" aria-label="Technologies">
            {project.tech_stack.map((tech) => <Tag key={tech}>{tech}</Tag>)}
          </div>
        )}

        {hasMedia && (
          <div className="mt-12">
            <ProjectGallery media={project.media} images={project.gallery} />
          </div>
        )}

        <div className="mt-14 space-y-12">
          {project.case_study_enabled ? (
            sections.map(({ key, label }) => (
              <section key={key}>
                <h2 className="font-display text-2xl font-normal mb-4">{label}</h2>
                <Markdown>{project[key]}</Markdown>
              </section>
            ))
          ) : (
            project.description && (
              <p className="text-lg leading-relaxed whitespace-pre-line">{project.description}</p>
            )
          )}
        </div>
      </div>
    </div>
  );
}
