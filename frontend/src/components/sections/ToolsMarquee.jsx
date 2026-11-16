import { useState } from 'react';
import { Pause, Play } from 'lucide-react';

const MIN_PER_HALF = 14; // enough items that one half is wider than any viewport

/**
 * Tools strip built from the skills in the CMS. Scrolls slowly, pauses on
 * hover/focus and with the Pause button (WCAG 2.2.2), is static and wrapped
 * under reduced motion. Fewer than 6 skills render as a plain static row, since a
 * loop of a handful of words looks broken. Duplicated items are aria-hidden
 * and hidden again under reduced motion, so each skill is announced once.
 */
export default function ToolsMarquee({ skills = [] }) {
  const [paused, setPaused] = useState(false);
  if (!skills.length) return null;

  if (skills.length < 6) {
    return (
      <section aria-label="Tools and technologies" className="border-y border-line py-6">
        <ul className="container-page flex flex-wrap gap-x-10 gap-y-3 font-mono text-sm uppercase tracking-[0.12em] text-muted">
          {skills.map((s) => <li key={s}>{s}</li>)}
        </ul>
      </section>
    );
  }

  const reps = Math.max(1, Math.ceil(MIN_PER_HALF / skills.length));
  const copies = Array.from({ length: reps * 2 }, (_, c) => c);

  return (
    <section aria-label="Tools and technologies" className="border-y border-line py-6">
      <div className={`marquee ${paused ? 'is-paused' : ''}`}>
        <ul className="marquee-track" style={{ gap: 0 }}>
          {copies.map((c) =>
            skills.map((s) => (
              <li
                key={`${c}-${s}`}
                aria-hidden={c > 0 ? 'true' : undefined}
                className={`flex items-center gap-10 pr-10 font-mono text-sm uppercase tracking-[0.12em] text-muted ${c > 0 ? 'marquee-dup' : ''}`}
              >
                {s}
                <span aria-hidden="true" className="h-1.5 w-1.5 rotate-45 bg-accent" />
              </li>
            ))
          )}
        </ul>
      </div>
      <div className="container-page mt-3 flex justify-end">
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 font-mono text-xs uppercase tracking-[0.12em] text-muted transition-colors duration-fast hover:text-ink motion-reduce:hidden"
        >
          {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
          {paused ? 'Play motion' : 'Pause motion'}
        </button>
      </div>
    </section>
  );
}
