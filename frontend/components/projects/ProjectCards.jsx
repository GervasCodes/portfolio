'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Github } from 'lucide-react';

export default function ProjectCards({ projects = [] }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project, i) => (
        <ProjectCard key={project.id || project.slug} project={project} index={i} />
      ))}
    </div>
  );
}

export function ProjectCard({ project, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className="card-premium glass-hover overflow-hidden group flex flex-col"
    >
      <Link href={`/projects/${project.slug}`} className="block">
        <div className="relative h-48 bg-gradient-to-br from-accent/30 to-cyan-accent/20 overflow-hidden">
          {project.cover_image_url ? (
            <Image
              src={project.cover_image_url}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-display text-2xl text-white/20">
              {project.title?.slice(0, 2).toUpperCase()}
            </div>
          )}
          {/* Gradient overlay + hover scrim so title/category always stay legible */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
          {project.featured && (
            <span className="absolute top-3 right-3 text-[10px] font-medium px-2.5 py-1 rounded-full bg-gradient-to-r from-accent to-cyan-accent text-white shadow-glow">
              Featured
            </span>
          )}
        </div>
      </Link>

      <div className="p-5 flex flex-col flex-1">
        {project.category && (
          <span className="text-xs uppercase tracking-wide text-accent-light mb-2">{project.category}</span>
        )}
        <Link href={`/projects/${project.slug}`}>
          <h3 className="font-display font-semibold text-lg mb-2 group-hover:text-gradient transition-colors">
            {project.title}
          </h3>
        </Link>
        <p className="text-sm text-white/55 mb-4 flex-1">{project.summary}</p>

        {Array.isArray(project.tech_stack) && project.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tech_stack.slice(0, 4).map((tech) => (
              <span key={tech} className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 text-white/60 border border-white/10">
                {tech}
              </span>
            ))}
            {project.tech_stack.length > 4 && (
              <span className="text-[11px] px-2.5 py-1 rounded-full bg-white/5 text-white/40 border border-white/10">
                +{project.tech_stack.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 pt-3 border-t border-white/5">
          <Link
            href={`/projects/${project.slug}`}
            className="text-sm text-white/70 hover:text-white flex items-center gap-1"
          >
            Details <ArrowUpRight size={14} />
          </Link>
          {project.repo_url && project.repo_url !== '#' && (
            <a
              href={project.repo_url}
              target="_blank"
              rel="noreferrer"
              className="ml-auto text-white/40 hover:text-white"
              aria-label="View source code"
            >
              <Github size={16} />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
