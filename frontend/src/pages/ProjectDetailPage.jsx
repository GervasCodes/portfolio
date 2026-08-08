import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Github, ExternalLink } from 'lucide-react';
import ProjectGallery from '@/components/projects/ProjectGallery';
import Button from '@/components/ui/Buttons';
import Markdown from '@/components/ui/Markdown';
import Seo from '@/components/seo/Seo';
import { PortfolioAPI } from '@/services/api';
import { sampleProjects } from '@/utils/sampleData';
import { useSiteSettings, buildTitle } from '@/hooks/useSiteSettings';
import { absoluteUrl, truncate, resolveImage } from '@/utils/seo';

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const fallback = sampleProjects.find((p) => p.slug === slug) || sampleProjects[0];
  const [project, setProject] = useState(fallback);

  const settings = useSiteSettings();
  const pageTitle = buildTitle(project ? project.title : 'Project', settings);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await PortfolioAPI.getProjectBySlug(slug);
      if (!mounted) return;
      setProject(data || sampleProjects.find((p) => p.slug === slug) || sampleProjects[0]);
    })();
    return () => { mounted = false; };
  }, [slug]);

  if (!project) return null;

  const description = truncate(project.summary || project.description || '');
  const image = resolveImage(project.cover_image_url, project.gallery?.[0]);
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
    <div className="pt-28 pb-24">
      <Seo
        title={pageTitle}
        description={description}
        path={`/projects/${project.slug}`}
        image={image}
        type="article"
        siteName={settings?.site_title}
        structuredData={structuredData}
      />
      <div className="container-page max-w-4xl">
        <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-8">
          <ArrowLeft size={16} /> Back to Projects
        </Link>

        {project.category && (
          <span className="text-xs uppercase tracking-widest text-accent-light">{project.category}</span>
        )}
        <h1 className="font-display text-3xl md:text-4xl font-bold mt-3 mb-4">{project.title}</h1>
        <p className="text-white/60 text-lg mb-8">{project.summary}</p>

        <div className="flex flex-wrap gap-3 mb-10">
          {project.live_url && project.live_url !== '#' && (
            <Button href={project.live_url} icon={<ExternalLink size={16} />}>Live Demo</Button>
          )}
          {project.repo_url && project.repo_url !== '#' && (
            <Button href={project.repo_url} variant="secondary" icon={<Github size={16} />}>Source Code</Button>
          )}
        </div>

        {((Array.isArray(project.media) && project.media.length > 0) ||
          (Array.isArray(project.gallery) && project.gallery.length > 0)) && (
          <div className="mb-10">
            <ProjectGallery media={project.media} images={project.gallery} />
          </div>
        )}

        {project.case_study_enabled ? (
          <CaseStudy project={project} />
        ) : (
          <div className="prose prose-invert max-w-none text-white/70 leading-relaxed whitespace-pre-line">
            {project.description}
          </div>
        )}

        {Array.isArray(project.tech_stack) && project.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-white/10">
            {project.tech_stack.map((tech) => (
              <span key={tech} className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-white/60 border border-white/10">
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Problem -> Approach -> Architecture -> Results, in that reading order.
// Sections with no content (admin left the field blank) are skipped
// entirely rather than rendering an empty heading.
const CASE_STUDY_SECTIONS = [
  { key: 'case_study_problem', label: 'Problem' },
  { key: 'case_study_approach', label: 'Approach' },
  { key: 'case_study_architecture', label: 'Architecture' },
  { key: 'case_study_results', label: 'Results' },
];

function CaseStudy({ project }) {
  const sections = CASE_STUDY_SECTIONS.filter(({ key }) => project[key]?.trim());
  if (!sections.length) return null;

  return (
    <div className="space-y-10">
      {sections.map(({ key, label }) => (
        <section key={key}>
          <h2 className="section-label mb-3">{label}</h2>
          <Markdown>{project[key]}</Markdown>
        </section>
      ))}
    </div>
  );
}
