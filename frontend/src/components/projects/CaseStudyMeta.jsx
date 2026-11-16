import { ArrowUpRight, Github } from 'lucide-react';
import Tag from '@/components/ui/Tag';
import { isRealUrl, projectYear } from '@/utils/projectContent';

const ROW = 'border-t border-line py-4 first:border-t-0 first:pt-0';
const LABEL = 'font-mono text-xs uppercase tracking-[0.12em] text-muted';
const LINK =
  'inline-flex items-center gap-1.5 text-sm text-ink underline-offset-4 hover:text-accent hover:underline [@media(pointer:coarse)]:min-h-11';

/**
 * Side facts for a case study (sticky on large screens). Only fields the CMS
 * really has are shown: category, year, stack, links. A row with no data is skipped.
 */
export default function CaseStudyMeta({ project, sections = [] }) {
  const year = projectYear(project);
  const stack = Array.isArray(project.tech_stack) ? project.tech_stack : [];
  const live = isRealUrl(project.live_url);
  const repo = isRealUrl(project.repo_url);
  if (!project.category && !year && !stack.length && !live && !repo && !sections.length) return null;

  return (
    <aside
      aria-label="Project details"
      className="card p-5 md:p-6 lg:sticky lg:top-[calc(var(--navbar-h)+1.5rem)] lg:self-start"
    >
      <dl>
        {project.category && (
          <div className={ROW}><dt className={LABEL}>Category</dt><dd className="mt-1.5">{project.category}</dd></div>
        )}
        {year && (
          <div className={ROW}><dt className={LABEL}>Year</dt><dd className="mt-1.5">{year}</dd></div>
        )}
        {stack.length > 0 && (
          <div className={ROW}>
            <dt className={LABEL}>Stack</dt>
            <dd className="mt-2 flex flex-wrap gap-2">{stack.map((t) => <Tag key={t}>{t}</Tag>)}</dd>
          </div>
        )}
        {(live || repo) && (
          <div className={ROW}>
            <dt className={LABEL}>Links</dt>
            <dd className="mt-1.5 flex flex-col items-start gap-1">
              {live && (
                <a href={project.live_url} target="_blank" rel="noreferrer" className={LINK}>
                  Visit live site <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              )}
              {repo && (
                <a href={project.repo_url} target="_blank" rel="noreferrer" className={LINK}>
                  <Github size={14} aria-hidden="true" /> View code
                </a>
              )}
            </dd>
          </div>
        )}
      </dl>

      {sections.length > 1 && (
        <nav aria-label="In this case study" className="mt-1 hidden border-t border-line pt-4 lg:block">
          <p className={LABEL}>In this case study</p>
          <ol className="mt-2 space-y-0.5">
            {sections.map(({ key, label }, i) => (
              <li key={key}>
                <a href={`#${key}`} className="flex gap-2 py-1 text-sm text-muted transition-colors duration-fast hover:text-ink">
                  <span aria-hidden="true" className="font-mono text-xs leading-6">{String(i + 1).padStart(2, '0')}</span>
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}
    </aside>
  );
}
