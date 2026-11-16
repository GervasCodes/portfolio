import { useRef } from 'react';
import { motion, useReducedMotion, useScroll } from 'framer-motion';
import SectionHeader from '@/components/ui/SectionHeader';
import Reveal from '@/components/ui/Reveal';
import Tag from '@/components/ui/Tag';
import { dateRange, durationLabel } from '@/utils/aboutContent';

/**
 * One vertical timeline. A thin accent line fills as the list scrolls
 * through the viewport (a transform driven by a motion value, so it never
 * re-renders React). Under reduced motion the line is simply drawn in full.
 * Each entry reveals once and carries its own dot.
 */
export function Timeline({ items = [], label }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 55%'] });
  if (!items.length) return null;

  return (
    <ol ref={ref} aria-label={label} className="relative m-0 list-none p-0 pl-8 md:pl-10">
      <span aria-hidden="true" className="tl-track absolute bottom-2 left-0 top-2 w-px" />
      <motion.span
        aria-hidden="true"
        style={reduce ? undefined : { scaleY: scrollYProgress }}
        className="absolute bottom-2 left-0 top-2 w-px origin-top bg-accent"
      />
      {items.map((item, i) => {
        const range = dateRange(item);
        const span = durationLabel(item);
        // MySQL returns booleans as 0/1: coerce, or React prints a stray "0".
        const current = Boolean(item.is_current);
        return (
          <Reveal as="li" key={item.id || i} delay={Math.min(i, 3) * 60} className="relative pb-12 last:pb-0">
            <span aria-hidden="true" className="tl-dot -ml-8 md:-ml-10" />
            {(range || span || current) && (
              <p className="m-0 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs uppercase tracking-[0.12em] text-muted">
                {range && <span>{range}</span>}
                {span && <span>{span}</span>}
                {current && <Tag tone="accent">Current</Tag>}
              </p>
            )}
            <h4 className="mt-2 font-display text-3xl font-normal leading-tight tracking-tight">{item.title}</h4>
            {(item.organization || item.location) && (
              <p className="mt-1 text-muted">{[item.organization, item.location].filter(Boolean).join(' · ')}</p>
            )}
            {item.description && (
              <p className="mt-3 max-w-measure whitespace-pre-line">{item.description}</p>
            )}
          </Reveal>
        );
      })}
    </ol>
  );
}

/**
 * Experience and education on one numbered section: sticky heading on the
 * left (desktop), the two timelines on the right. Either list may be empty;
 * the section is skipped when both are. `#experience` and `#education` both
 * work as anchors (the old /experience URL redirects to the first).
 */
export default function ExperienceSection({ work = [], education = [], number }) {
  if (!work.length && !education.length) return null;
  // The heading only claims what the CMS actually has.
  const heading = work.length && education.length
    ? <>Where I have <em>worked</em> and studied</>
    : work.length
      ? <>Where I have <em>worked</em></>
      : <>Where I have <em>studied</em></>;
  return (
    <section id="experience" aria-labelledby="experience-title" className="scroll-mt-24 border-t border-line py-16 md:py-24">
      <div className="container-page grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeader
            number={number}
            eyebrow={work.length ? 'Experience' : 'Education'}
            title={<span id="experience-title">{heading}</span>}
            sticky
            className="mb-0 md:mb-0"
          />
        </div>
        <div className="space-y-16 lg:col-span-8">
          {work.length > 0 && (
            <div>
              <h3 className={education.length > 0 ? 'section-label mb-8' : 'sr-only'}>Work</h3>
              <Timeline items={work} label="Work experience" />
            </div>
          )}
          {education.length > 0 && (
            <div id="education" className="scroll-mt-24">
              <h3 className={work.length > 0 ? 'section-label mb-8' : 'sr-only'}>Education</h3>
              <Timeline items={education} label="Education" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
