import { ArrowRight, Download } from 'lucide-react';
import Button from '@/components/ui/Buttons';
import Portrait from '@/components/about/Portrait';
import { splitParagraphs } from '@/utils/aboutContent';
import { isRealUrl } from '@/utils/projectContent';

/**
 * About intro: the story and the portrait. Everything comes from Admin ->
 * Profile; a field that is empty is simply left out (no invented facts).
 *  - `jump` lists the sections that exist further down, as in-page links.
 *  - The name uses the same italic-serif last word as the Home hero.
 */
export default function About({ profile, jump = [] }) {
  const name = profile?.full_name || 'About';
  const words = name.trim().split(/\s+/);
  const paragraphs = splitParagraphs(profile?.bio);
  const [lede, ...rest] = paragraphs;
  const years = Number(profile?.years_experience) > 0 ? Number(profile.years_experience) : 0;
  const hasResumeFile = isRealUrl(profile?.resume_url);

  const facts = [
    profile?.title && ['Role', profile.title],
    profile?.location && ['Based in', profile.location],
    years > 0 && ['Experience', `${years} ${years === 1 ? 'year' : 'years'}`],
  ].filter(Boolean);

  return (
    <section id="about" aria-labelledby="about-title" className="scroll-mt-24">
      <div className="container-page grid gap-12 pb-16 lg:grid-cols-12 lg:items-center lg:gap-10 lg:pb-24">
        <div className="lg:col-span-7">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <p className="section-label">About</p>
            {profile?.available_for_work && (
              <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 font-mono text-xs uppercase tracking-[0.12em] text-ink">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-success" />
                Available for new projects
              </span>
            )}
          </div>

          <h1 id="about-title" className="mt-5 text-balance break-words font-display text-5xl font-normal leading-[0.95] tracking-tight md:text-6xl">
            {words.map((word, i) => (
              <span key={`${word}-${i}`}>
                {i === words.length - 1 && words.length > 1 ? <em>{word}</em> : word}
                {i < words.length - 1 ? ' ' : ''}
              </span>
            ))}
          </h1>

          {lede ? (
            <div className="mt-8 max-w-measure space-y-5">
              <p className="whitespace-pre-line font-display text-2xl leading-snug text-ink md:text-3xl">{lede}</p>
              {rest.map((p, i) => (
                <p key={i} className="whitespace-pre-line text-base leading-relaxed">{p}</p>
              ))}
            </div>
          ) : (
            <p className="mt-8 max-w-measure font-display text-2xl leading-snug text-muted md:text-3xl">
              {profile?.tagline || 'More about me is on its way.'}
            </p>
          )}

          {facts.length > 0 && (
            <dl className="mt-10 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3">
              {facts.map(([k, v]) => (
                <div key={k} className="border-t border-line pt-3">
                  <dt className="section-label">{k}</dt>
                  <dd className="m-0 mt-1.5 text-base">{v}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-10 flex flex-wrap items-center gap-3 md:gap-4">
            <Button
              href={profile?.email ? `mailto:${profile.email}` : '/contact'}
              size="lg"
              icon={<ArrowRight size={18} aria-hidden="true" />}
            >
              Start a project
            </Button>
            {hasResumeFile ? (
              <Button href={profile.resume_url} variant="secondary" size="lg" icon={<Download size={16} aria-hidden="true" />}>
                Download resume
              </Button>
            ) : (
              <Button href="/resume" variant="secondary" size="lg">
                View resume
              </Button>
            )}
            <Button href="/projects" variant="ghost" size="lg">
              See the work
            </Button>
          </div>

          {jump.length > 0 && (
            <nav aria-label="On this page" className="mt-10">
              <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                {jump.map((j) => (
                  <li key={j.id}>
                    <a
                      href={`#${j.id}`}
                      className="inline-flex min-h-11 items-center rounded-full border border-line px-4 font-mono text-xs uppercase tracking-[0.12em] text-muted transition-colors duration-fast hover:border-control hover:text-ink"
                    >
                      {j.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>

        <div className="mx-auto w-full max-w-xs sm:max-w-sm lg:col-span-5 lg:max-w-md lg:justify-self-end">
          <Portrait name={profile?.full_name} src={isRealUrl(profile?.avatar_url) ? profile.avatar_url : ''} />
        </div>
      </div>
    </section>
  );
}
