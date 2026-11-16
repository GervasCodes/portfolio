import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ProjectGallery from '@/components/projects/ProjectGallery';
import CaseStudyMeta from '@/components/projects/CaseStudyMeta';
import NextProject from '@/components/projects/NextProject';
import Markdown from '@/components/ui/Markdown';
import PlaceholderArt from '@/components/ui/PlaceholderArt';
import ErrorState from '@/components/ui/ErrorState';
import Skeleton from '@/components/ui/Skeleton';
import Reveal from '@/components/ui/Reveal';
import Seo from '@/components/seo/Seo';
import NotFoundPage from '@/pages/NotFoundPage';
import { PortfolioAPI } from '@/services/api';
import { useAllProjects } from '@/hooks/useAllProjects';
import { useSiteSettings, buildTitle } from '@/hooks/useSiteSettings';
import { absoluteUrl, truncate, resolveImage } from '@/utils/seo';
import { neighbours, projectScreens, projectYear } from '@/utils/projectContent';

// Reading order from the case-study template in docs/rebuild/01-ia-and-content.md.
// Database fields keep their names; only the labels change. Empty sections are skipped.
const CASE_STUDY_SECTIONS = [
  { key: 'case_study_problem', label: 'Problem' },
  { key: 'case_study_approach', label: 'Decisions and trade-offs' },
  { key: 'case_study_architecture', label: 'Architecture' },
  { key: 'case_study_results', label: 'Result' },
  { key: 'case_study_lessons', label: 'What I would change' },
];

const TOP = { paddingTop: 'calc(var(--navbar-h) + 2rem)' };

/** Same boxes as the loaded page (header, 16:10 screen, side facts), so nothing jumps. */
function DetailSkeleton() {
  return (
    <div className="pb-24" style={TOP} aria-hidden="true">
      <div className="container-page">
        <Skeleton className="mb-10 h-5 w-24" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-5 h-16 w-3/4 max-w-3xl" />
        <Skeleton className="mt-5 h-6 w-full max-w-2xl" />
        <Skeleton className="mt-12 aspect-[16/10] w-full !rounded-2xl" />
        <div className="mt-14 grid gap-10 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <Skeleton className="h-64 !rounded-2xl" />
          <div className="space-y-4"><Skeleton className="h-8 w-1/3" /><Skeleton className="h-32 w-full" /></div>
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const [state, setState] = useState({ status: 'loading', project: null });
  const [attempt, setAttempt] = useState(0);
  const settings = useSiteSettings();
  const all = useAllProjects();

  useEffect(() => {
    let mounted = true;
    setState({ status: 'loading', project: null });
    (async () => {
      const { data, error } = await PortfolioAPI.getProjectBySlug(slug);
      if (!mounted) return;
      if (data) setState({ status: 'ready', project: data });
      // Only a real "not found" answer is a 404; a network or server failure gets a retry instead.
      else if (error && !/not found/i.test(error)) setState({ status: 'error', project: null });
      else setState({ status: 'missing', project: null });
    })();
    return () => { mounted = false; };
  }, [slug, attempt]);

  const project = state.project;
  const screens = useMemo(() => projectScreens(project), [project]);
  const near = useMemo(() => neighbours(all.projects, slug), [all.projects, slug]);

  if (state.status === 'missing') return <NotFoundPage />;
  if (state.status === 'loading') return <DetailSkeleton />;
  if (state.status === 'error') {
    return (
      <div className="pb-24" style={TOP}>
        <div className="container-page max-w-3xl">
          <ErrorState title="This project could not be loaded" message="Check your connection, then try again." onRetry={() => setAttempt((n) => n + 1)} />
          <Link to="/projects" className="mt-8 inline-flex items-center gap-2 text-sm text-muted hover:text-ink"><ArrowLeft size={16} aria-hidden="true" /> All work</Link>
        </div>
      </div>
    );
  }

  const description = truncate(project.summary || project.description || '');
  const image = resolveImage(project.cover_image_url, project.gallery?.[0]);
  const year = projectYear(project);
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
    <div className="pb-24" style={TOP}>
      <Seo
        title={buildTitle(project.title, settings)}
        description={description}
        path={`/projects/${project.slug}`}
        image={image}
        type="article"
        siteName={settings?.site_title}
        structuredData={structuredData}
      />
      <div className="container-page">
        <Link to="/projects" className="mb-10 inline-flex items-center gap-2 text-sm text-muted hover:text-ink [@media(pointer:coarse)]:min-h-11">
          <ArrowLeft size={16} aria-hidden="true" /> All work
        </Link>

        <header className="max-w-4xl">
          <p className="section-label">
            {[project.category, year].filter(Boolean).join(' · ') || 'Project'}
          </p>
          <h1 className="mt-4 font-display text-5xl font-normal leading-[0.98] tracking-tight text-balance md:text-6xl">
            {project.title}
          </h1>
          {project.summary && (
            <p className="mt-6 max-w-3xl font-display text-xl leading-relaxed text-muted md:text-2xl">{project.summary}</p>
          )}
        </header>

        {/* Hero shot: full width in a device frame. No screenshot = generated art, shown as art, not as a fake device. */}
        <div className="mt-10 md:mt-14">
          {screens.length > 0 ? (
            <ProjectGallery items={screens} variant="devices" from={0} to={1} columns={1} priority label={`${project.title} screens`} />
          ) : (
            <div className="relative aspect-[16/7] w-full overflow-hidden rounded-2xl border border-line bg-surface-2">
              <PlaceholderArt seed={project.slug || project.title} className="absolute inset-0 h-full w-full" />
            </div>
          )}
        </div>

        <div className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-16">
          <CaseStudyMeta project={project} sections={sections} />

          <div className="min-w-0 max-w-[72ch] space-y-14 md:space-y-16">
            {project.case_study_enabled && sections.length > 0 ? (
              sections.map(({ key, label }, i) => {
                const isResult = key === 'case_study_results';
                return (
                  <Reveal as="section" key={key} id={key} className="scroll-mt-28" aria-labelledby={`${key}-h`}>
                    <p className="font-mono text-xs uppercase tracking-[0.12em] text-muted" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')} / {label}
                    </p>
                    <h2 id={`${key}-h`} className="mt-3 font-display text-3xl font-normal leading-tight tracking-tight">{label}</h2>
                    <div className={isResult ? 'card card-raised mt-5 border-accent/30 p-5 md:p-7' : 'mt-5'}>
                      <Markdown>{project[key]}</Markdown>
                    </div>
                  </Reveal>
                );
              })
            ) : (
              project.description && (
                <section aria-label="About this project">
                  <p className="text-lg leading-relaxed whitespace-pre-line">{project.description}</p>
                </section>
              )
            )}
          </div>
        </div>

        {screens.length > 1 && (
          <section aria-labelledby="screens-h" className="mt-20 md:mt-28">
            <p className="section-label">Screens</p>
            <h2 id="screens-h" className="mb-8 mt-3 font-display text-3xl font-normal leading-tight tracking-tight md:mb-10">
              More <em>screens</em>
            </h2>
            <ProjectGallery items={screens} variant="devices" from={1} label={`${project.title} screens`} />
          </section>
        )}

        <NextProject status={all.status} prev={near.prev} next={near.next} />
      </div>
    </div>
  );
}
