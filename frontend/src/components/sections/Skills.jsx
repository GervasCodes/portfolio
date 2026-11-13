import SectionHeader from '@/components/ui/SectionHeader';
import Tag from '@/components/ui/Tag';

/**
 * Skills as grouped lists. No percentages, bars or radar: a self-rated
 * number says little, so each group simply names the technologies.
 */
export default function Skills({ grouped = {} }) {
  const categories = Object.keys(grouped).filter((c) => grouped[c]?.length);
  if (!categories.length) return null;

  return (
    <section id="skills" className="py-16">
      <div className="container-page">
        <SectionHeader eyebrow="Skills" title="Technologies I work with" />
        <dl className="divide-y divide-line border-y border-line">
          {categories.map((category) => (
            <div key={category} className="grid gap-3 py-5 md:grid-cols-[1fr_3fr] md:gap-10">
              <dt className="font-display text-lg">{category}</dt>
              <dd className="m-0 flex flex-wrap gap-2">
                {grouped[category].map((skill) => (
                  <Tag key={skill.id || skill.name}>{skill.name}</Tag>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
