import { ArrowRight } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import Button from '@/components/ui/Buttons';
import Reveal from '@/components/ui/Reveal';
import PlaceholderArt from '@/components/ui/PlaceholderArt';
import { formatMonthYear } from '@/utils/homeContent';

/** Last three roles on a vertical timeline. Full history lives on /about. */
export default function ExperienceSnapshot({ items = [], number }) {
  return (
    <section className="py-section">
      <div className="container-page grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHeader
            number={number}
            eyebrow="Experience"
            title={<>Where I have <em>worked</em></>}
            sticky
            className="mb-0 md:mb-0"
          />
        </div>
        <div className="lg:col-span-8">
          {items.length ? (
            <>
              <ol className="relative m-0 list-none border-l border-line p-0">
                {items.map((item, i) => (
                  <li key={item.id || i} className="relative pb-10 pl-8 last:pb-0 md:pl-10">
                    <Reveal delay={i * 80}>
                      <p className="text-sm text-muted">
                        {formatMonthYear(item.start_date)}
                        {' – '}
                        {item.is_current ? 'Present' : formatMonthYear(item.end_date) || 'Present'}
                      </p>
                      <h3 className="mt-2 font-display text-3xl font-normal leading-tight tracking-tight">
                        {item.title}
                      </h3>
                      {(item.organization || item.location) && (
                        <p className="mt-1 text-muted">
                          {[item.organization, item.location].filter(Boolean).join(' · ')}
                        </p>
                      )}
                      {item.description && (
                        <p className="mt-3 line-clamp-3 max-w-prose">{item.description}</p>
                      )}
                    </Reveal>
                  </li>
                ))}
              </ol>
              <div className="mt-10">
                <Button href="/about#experience" variant="secondary" icon={<ArrowRight size={16} aria-hidden="true" />}>
                  Full experience
                </Button>
              </div>
            </>
          ) : (
            <div className="card flex items-center gap-6 p-6 md:p-8">
              <div className="relative hidden h-24 w-32 shrink-0 overflow-hidden rounded-xl border border-line sm:block">
                <PlaceholderArt seed="experience" className="absolute inset-0 h-full w-full" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-normal tracking-tight">Experience coming soon</h3>
                <p className="mt-2 text-muted">Roles and dates will be listed here once they are added.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
