import SectionHeader from '@/components/ui/SectionHeader';
import Card from '@/components/ui/Card';
import Tag from '@/components/ui/Tag';
import Reveal from '@/components/ui/Reveal';
import LevelBar from '@/components/ui/LevelBar';
import { bentoSpans, hasMeaningfulLevels, skillCategories, skillLevel } from '@/utils/aboutContent';

// Literal class names so Tailwind can see them. Two-column grid (md): any
// span of 2 or more takes the full row; four-column grid (lg): the real span.
const SPAN = {
  1: 'lg:col-span-1',
  2: 'md:col-span-2 lg:col-span-2',
  4: 'md:col-span-2 lg:col-span-4',
};

/**
 * Skills as a bento grid, one tile per category (largest first), tile sizes
 * chosen so every row is full. Levels are drawn as simple CSS bars, but only
 * when the owner has actually rated skills differently (see
 * hasMeaningfulLevels); otherwise each tile just lists the technologies.
 */
export default function Skills({ grouped = {}, number }) {
  const categories = skillCategories(grouped);
  if (!categories.length) return null;
  const showLevels = hasMeaningfulLevels(categories);
  const spans = bentoSpans(categories.length);

  return (
    <section id="skills" aria-labelledby="skills-title" className="scroll-mt-24 py-16 md:py-24">
      <div className="container-page">
        <SectionHeader
          number={number}
          eyebrow="Skills"
          title={<span id="skills-title">Technologies I <em>work with</em></span>}
          description={showLevels ? 'The bars are my own rating of how comfortable I am with each one.' : undefined}
        />
        <ul className="bento m-0 list-none p-0">
          {categories.map((category, i) => {
            const span = spans[i] || 1;
            const wide = span > 1;
            return (
              <Reveal as="li" key={category.name} delay={Math.min(i, 5) * 60} className={`flex ${SPAN[span]}`}>
                <Card className="flex w-full flex-col p-6 md:p-8">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-2xl font-normal leading-tight tracking-tight md:text-3xl">{category.name}</h3>
                    <p className="shrink-0 font-mono text-xs uppercase tracking-[0.12em] text-muted">
                      {category.skills.length} {category.skills.length === 1 ? 'skill' : 'skills'}
                    </p>
                  </div>

                  {showLevels ? (
                    <ul className={`m-0 mt-6 grid list-none gap-x-10 gap-y-5 p-0 ${wide ? 'sm:grid-cols-2' : ''}`}>
                      {category.skills.map((skill) => {
                        const level = skillLevel(skill);
                        return (
                          <li key={skill.id || skill.name}>
                            <p className="m-0 flex items-center gap-2 text-sm">
                              {skill.icon_url && (
                                <img src={skill.icon_url} alt="" width="20" height="20" loading="lazy" decoding="async" className="h-5 w-5 shrink-0 object-contain" />
                              )}
                              <span>{skill.name}</span>
                            </p>
                            {level !== null && (
                              <span className="mt-2 block"><LevelBar value={level} /></span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <ul className="m-0 mt-6 flex list-none flex-wrap gap-2 p-0">
                      {category.skills.map((skill) => (
                        <li key={skill.id || skill.name}>
                          <Tag className="gap-1.5">
                            {skill.icon_url && (
                              <img src={skill.icon_url} alt="" width="14" height="14" loading="lazy" decoding="async" className="h-3.5 w-3.5 object-contain" />
                            )}
                            {skill.name}
                          </Tag>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
