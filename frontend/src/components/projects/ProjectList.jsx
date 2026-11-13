import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Tag from '@/components/ui/Tag';

/** Projects as plain rows (title + category | summary, tags, link). Shared by Home and /projects. */
export default function ProjectList({ projects }) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {projects.map((p) => (
        <li key={p.id || p.slug}>
          <Link to={`/projects/${p.slug}`} className="group grid gap-2 py-6 md:grid-cols-[1fr_2fr] md:gap-10">
            <div>
              <h3 className="font-display text-xl group-hover:text-accent">{p.title}</h3>
              {p.category && <p className="text-sm text-muted mt-1">{p.category}</p>}
            </div>
            <div>
              {p.summary && <p className="text-ink">{p.summary}</p>}
              {Array.isArray(p.tech_stack) && p.tech_stack.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {p.tech_stack.slice(0, 5).map((t) => <Tag key={t}>{t}</Tag>)}
                </div>
              )}
              <p className="mt-3 text-sm text-accent inline-flex items-center gap-1">
                {p.case_study_enabled ? 'Read the case study' : 'View project'} <ArrowRight size={14} />
              </p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
