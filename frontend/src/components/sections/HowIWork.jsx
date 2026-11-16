import Card from '@/components/ui/Card';
import SectionHeader from '@/components/ui/SectionHeader';
import Reveal from '@/components/ui/Reveal';

/**
 * "How I work": up to 4 steps from the settings key/value store
 * (process_step_N_title / process_step_N_text). Visitors see the section only
 * when at least one step is filled in. A signed-in admin also sees clearly
 * marked placeholder cards so they know which keys to fill; those never
 * render for the public.
 */
export default function HowIWork({ steps = [], number, ownerPlaceholders = false }) {
  const items = steps.length
    ? steps
    : ownerPlaceholders
      ? [1, 2, 3, 4].map((n) => ({ placeholder: n }))
      : [];
  if (!items.length) return null;

  return (
    <section className="py-section">
      <div className="container-page">
        <SectionHeader
          number={number}
          eyebrow="Process"
          title={<>How I <em>work</em></>}
        />
        {!steps.length && (
          <p className="mb-6 rounded-xl border border-dashed border-control p-4 text-sm text-muted" role="note">
            Only you can see this: no process steps are set yet. Add the settings keys{' '}
            <code className="font-mono text-ink">process_step_1_title</code> and{' '}
            <code className="font-mono text-ink">process_step_1_text</code> (up to step 4) to publish this section.
          </p>
        )}
        <ol className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((s, i) => (
            <li key={s.title || `p-${i}`}>
              <Reveal delay={i * 80} className="h-full">
                <Card spotlight={Boolean(s.title)} className={`h-full p-6 ${s.placeholder ? 'border-dashed' : ''}`}>
                  <span className="step-number" aria-hidden="true" data-n={String(i + 1).padStart(2, '0')} />
                  <h3 className="mt-6 font-display text-2xl font-normal leading-tight tracking-tight">
                    {s.title || `Step ${i + 1} (placeholder)`}
                  </h3>
                  {s.text && <p className="mt-3 text-muted">{s.text}</p>}
                </Card>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
