import { ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Buttons';
import PlaceholderArt from '@/components/ui/PlaceholderArt';
import { useLocalTime } from '@/hooks/useLocalTime';

const STAGGER_MS = 70;

/**
 * Home hero. Everything comes from Admin → Profile; nothing is invented.
 *  - Name: each word rises out of a mask (CSS only).
 *  - Portrait: the real avatar as is. With no avatar, placeholder art is shown.
 *  - Clock: the owner's local time. The place name appears only if the profile has a location.
 *  - Availability: shown only when the profile says available_for_work.
 */
export default function Hero({ profile, siteTitle }) {
  const time = useLocalTime();
  const name = profile?.full_name || siteTitle || 'Portfolio';
  const words = name.trim().split(/\s+/);
  const email = profile?.email;
  const years = Number(profile?.years_experience) > 0 ? Number(profile.years_experience) : 0;

  return (
    <section className="relative isolate overflow-hidden" aria-labelledby="hero-title">
      <div
        className="container-page relative z-[2] grid gap-12 pb-20 lg:min-h-[min(calc(100svh-4rem),56rem)] lg:grid-cols-12 lg:items-center lg:gap-8 lg:pb-24"
        style={{ paddingTop: 'calc(var(--navbar-h) + 2.5rem)' }}
      >
        <div className="lg:col-span-8">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
            {profile?.available_for_work && <span className="text-ink">Available for new projects</span>}
            {time && (
              <span className="tabular-nums">
                {profile?.location ? `${profile.location}, ` : ''}
                <time>{time}</time> EAT
              </span>
            )}
          </div>

          {profile?.title && <p className="section-label mt-8">{profile.title}</p>}

          <h1
            id="hero-title"
            className="font-display text-display mt-4 text-balance break-words"
          >
            {words.map((word, i) => {
              const last = i === words.length - 1;
              return (
                <span key={`${word}-${i}`}>
                  <span className="word-mask">
                    <span className="word-rise" style={{ animationDelay: `${i * STAGGER_MS}ms` }}>
                      {word}
                    </span>
                  </span>
                  {last ? '' : ' '}
                </span>
              );
            })}
          </h1>

          {profile?.tagline && (
            <p className="mt-8 max-w-xl text-xl leading-snug text-muted md:text-2xl">
              {profile.tagline}
            </p>
          )}

          <div className="mt-10 flex flex-wrap items-center gap-3 md:gap-4">
            <Button
              href={email ? `mailto:${email}` : '/contact'}
              size="lg"
              icon={<ArrowRight size={18} aria-hidden="true" />}
            >
              Start a project
            </Button>
            <Button href="/projects" variant="secondary" size="lg">
              See the work
            </Button>
            <Button href={profile?.resume_url || '/resume'} variant="ghost" size="lg">
              Resume
            </Button>
          </div>

          {years > 0 && (
            <p className="mt-10 text-sm text-muted">
              <span className="font-display text-3xl text-ink">{years}</span>{' '}
              {years === 1 ? 'year' : 'years'} building for the web
            </p>
          )}
        </div>

        <div className="mx-auto w-full max-w-xs sm:max-w-sm lg:col-span-4 lg:max-w-none">
          <figure className="relative m-0">
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-line bg-surface-2">
              {profile?.avatar_url ? (
                <>
                  <img
                    src={profile.avatar_url}
                    alt={`Portrait of ${name}`}
                    width="800"
                    height="1000"
                    decoding="async"
                    {...{ fetchpriority: 'high' }}
                    className="absolute inset-0 h-full w-full object-cover object-top"
                  />
                </>
              ) : (
                <>
                  <PlaceholderArt seed={name} className="absolute inset-0 h-full w-full" />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center font-display text-8xl text-ink/70"
                  >
                    {words.map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                </>
              )}
            </div>
          </figure>
        </div>
      </div>

    </section>
  );
}
