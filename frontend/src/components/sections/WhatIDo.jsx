import Card from '@/components/ui/Card';
import Tag from '@/components/ui/Tag';
import SectionHeader from '@/components/ui/SectionHeader';
import PlaceholderArt from '@/components/ui/PlaceholderArt';
import Button from '@/components/ui/Buttons';
import Reveal from '@/components/ui/Reveal';

// Bento placement for up to 3 cards: one tall lead card + two stacked.
const SPANS = [
  'lg:col-span-2 lg:row-span-2',
  'lg:col-span-2',
  'lg:col-span-2',
];

/**
 * "What I do": the three skill categories with the most skills, from the CMS.
 * (There is no services field yet; see the proposal in CHANGES.md.)
 */
export default function WhatIDo({ categories = [], number }) {
  return (
    <section className="py-section">
      <div className="container-page">
        <SectionHeader
          number={number}
          eyebrow="What I do"
          title={<>Where I can <em>help</em></>}
        />
        {categories.length ? (
          <div className="bento">
            {categories.map((c, i) => (
              <Reveal key={c.name} delay={i * 80} className={SPANS[i]}>
                <Card spotlight raised={i === 0} className="h-full p-6 md:p-8">
                  <h3 className={`font-display font-normal leading-[1.05] tracking-tight ${i === 0 ? 'text-4xl md:text-5xl' : 'text-3xl'}`}>
                    {c.name}
                  </h3>
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {c.skills.slice(0, i === 0 ? 14 : 8).map((s) => (
                      <li key={s}><Tag>{s}</Tag></li>
                    ))}
                  </ul>
                </Card>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="card grid items-center gap-8 p-6 md:grid-cols-2 md:p-10">
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-line">
              <PlaceholderArt seed="what-i-do" className="absolute inset-0 h-full w-full" />
            </div>
            <div>
              <h3 className="font-display text-3xl font-normal tracking-tight">Skills are being added</h3>
              <p className="mt-3 max-w-prose text-muted">
                The areas I work in will be listed here. You can still see what I have built.
              </p>
              <div className="mt-6"><Button href="/projects" variant="secondary">See the work</Button></div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
