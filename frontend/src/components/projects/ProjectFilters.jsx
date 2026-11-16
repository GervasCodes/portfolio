import { useState } from 'react';
import { LayoutGrid, List, Search, X } from 'lucide-react';
import Button from '@/components/ui/Buttons';

const CHIP =
  'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider ' +
  'transition-colors duration-fast [@media(pointer:coarse)]:min-h-11 ';
const CHIP_OFF = 'border-line text-muted hover:border-control hover:text-ink';
const CHIP_ON = 'border-accent bg-accent text-accent-ink';

function Chip({ pressed, onClick, children, count }) {
  return (
    <button type="button" aria-pressed={pressed} onClick={onClick} className={`${CHIP}${pressed ? CHIP_ON : CHIP_OFF}`}>
      {children}
      {count != null && <span aria-hidden="true" className="opacity-70">{count}</span>}
    </button>
  );
}

const TECH_VISIBLE = 8;

/**
 * Filters for the Work index. Everything is a real button with aria-pressed (so it works with a
 * keyboard and a screen reader); results are announced through a polite live region.
 */
export default function ProjectFilters({
  categories, tech, q, onQ, category, onCategory, techValue, onTech, view, onView,
  shown, total, onClear,
}) {
  const [allTech, setAllTech] = useState(false);
  const techList = allTech ? tech : tech.slice(0, TECH_VISIBLE);
  const active = Boolean(q || category || techValue);

  return (
    <div className="mb-8 space-y-5 md:mb-10">
      <div className="flex flex-wrap items-center gap-3">
        <div role="search" className="relative w-full sm:w-80">
          <label htmlFor="work-search" className="sr-only">Search projects</label>
          <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            id="work-search"
            type="search"
            value={q}
            onChange={(e) => onQ(e.target.value)}
            placeholder="Search projects"
            autoComplete="off"
            className="input-field w-full !rounded-full !pl-10"
          />
        </div>

        <div role="group" aria-label="Layout" className="ml-auto inline-flex rounded-full border border-line p-1">
          {[
            { id: 'grid', label: 'Grid', Icon: LayoutGrid },
            { id: 'list', label: 'List', Icon: List },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={view === id}
              onClick={() => onView(id)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition-colors duration-fast [@media(pointer:coarse)]:min-h-11 ${view === id ? 'bg-ink/10 text-ink' : 'text-muted hover:text-ink'}`}
            >
              <Icon size={16} aria-hidden="true" /> {label}
            </button>
          ))}
        </div>
      </div>

      {categories.length > 1 && (
        <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
          <Chip pressed={!category} onClick={() => onCategory('')}>All</Chip>
          {categories.map((c) => (
            <Chip key={c.name} pressed={category === c.name} onClick={() => onCategory(category === c.name ? '' : c.name)} count={c.count}>
              {c.name}
            </Chip>
          ))}
        </div>
      )}

      {tech.length > 1 && (
        <div role="group" aria-label="Filter by technology" className="flex flex-wrap items-center gap-2">
          {techList.map((t) => (
            <Chip key={t.name} pressed={techValue === t.name} onClick={() => onTech(techValue === t.name ? '' : t.name)}>
              {t.name}
            </Chip>
          ))}
          {tech.length > TECH_VISIBLE && (
            <button
              type="button"
              onClick={() => setAllTech((v) => !v)}
              aria-expanded={allTech}
              className="px-2 py-1.5 text-sm text-muted underline-offset-4 hover:text-ink hover:underline [@media(pointer:coarse)]:min-h-11"
            >
              {allTech ? 'Show fewer' : `Show all ${tech.length}`}
            </button>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <p role="status" aria-live="polite" className="font-mono text-xs uppercase tracking-[0.12em] text-muted">
          {active ? `${shown} of ${total} projects` : `${total} ${total === 1 ? 'project' : 'projects'}`}
        </p>
        {active && (
          <Button variant="ghost" size="sm" onClick={onClear} icon={<X size={14} aria-hidden="true" />} magnetic={false}>
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
