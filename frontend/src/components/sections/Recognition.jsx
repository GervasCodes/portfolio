import { ArrowUpRight, Award } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Buttons';

/**
 * Certificates + achievements strip. Rendered only when there is real data.
 * Horizontal scroll with snap; the scroller is keyboard-focusable and labelled.
 */
export default function Recognition({ items = [], number }) {
  if (!items.length) return null;
  return (
    <section className="py-section">
      <div className="container-page">
        <SectionHeader
          number={number}
          eyebrow="Recognition"
          title={<>Certificates &amp; <em>achievements</em></>}
        />
      </div>
      <div className="container-page">
        <ul
          tabIndex={0}
          aria-label="Certificates and achievements, scrollable"
          className="strip-scroll m-0 flex list-none snap-x snap-mandatory gap-4 overflow-x-auto p-0 pb-4"
        >
          {items.map((it) => {
            const body = (
              <Card spotlight className="flex h-full w-72 shrink-0 snap-start flex-col p-5 sm:w-80">
                <div className="flex h-16 items-center">
                  {it.image ? (
                    <img
                      src={it.image}
                      alt=""
                      width="64"
                      height="64"
                      loading="lazy"
                      decoding="async"
                      className="h-14 w-14 rounded-lg border border-line bg-surface-2 object-contain"
                    />
                  ) : (
                    <span className="flex h-14 w-14 items-center justify-center rounded-lg border border-line bg-surface-2 text-accent">
                      <Award size={22} aria-hidden="true" />
                    </span>
                  )}
                </div>
                <p className="mt-4 text-sm text-muted">{it.kind}</p>
                <h3 className="mt-2 font-display text-2xl font-normal leading-tight tracking-tight">{it.title}</h3>
                {it.meta && <p className="mt-2 line-clamp-2 text-sm text-muted">{it.meta}</p>}
                {it.href && (
                  <p className="mt-auto inline-flex items-center gap-1 pt-4 text-sm text-accent">
                    View credential <ArrowUpRight size={14} aria-hidden="true" />
                  </p>
                )}
              </Card>
            );
            return (
              <li key={it.key} className="flex shrink-0">
                {it.href ? (
                  <a
                    href={it.href}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-2xl"
                    aria-label={`${it.title}, view credential (opens in a new tab)`}
                  >
                    {body}
                  </a>
                ) : (
                  body
                )}
              </li>
            );
          })}
        </ul>
        <div className="mt-6">
          <Button href="/about" variant="secondary">More about me</Button>
        </div>
      </div>
    </section>
  );
}
