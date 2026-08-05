import Link from 'next/link';
import { ArrowLeft, Github, ExternalLink } from 'lucide-react';
import ProjectGallery from '@/components/projects/ProjectGallery';
import Button from '@/components/ui/Buttons';
import { PortfolioAPI } from '@/services/api';
import { sampleProjects } from '@/utils/sampleData';

export async function generateMetadata({ params }) {
  const { data } = await PortfolioAPI.getProjectBySlug(params.slug);
  const project = data || sampleProjects.find((p) => p.slug === params.slug);
  return { title: project ? `${project.title} — Portfolio` : 'Project — Portfolio' };
}

export default async function ProjectDetailPage({ params }) {
  const { data } = await PortfolioAPI.getProjectBySlug(params.slug);
  const project = data || sampleProjects.find((p) => p.slug === params.slug) || sampleProjects[0];

  return (
    <div className="pt-28 pb-24">
      <div className="container-page max-w-4xl">
        <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-white mb-8">
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

        <div className="prose prose-invert max-w-none text-white/70 leading-relaxed whitespace-pre-line">
          {project.description}
        </div>

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
