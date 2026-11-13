import { ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Buttons';

/**
 * Home hero: who, what, one proof line, two actions. Everything comes from
 * Admin → Profile; nothing is invented here. The availability line shows
 * only when the profile says so, and uses the profile's own location.
 */
export default function Hero({ profile }) {
  const name = profile?.full_name;
  const title = profile?.title;
  const tagline = profile?.tagline;

  return (
    <section>
      <div
        className="container-page pb-20"
        style={{ paddingTop: 'calc(var(--navbar-h) + 4rem)' }}
      >
        {profile?.avatar_url && (
          <img
            src={profile.avatar_url}
            alt=""
            decoding="async"
            className="w-20 h-20 rounded-full object-cover border border-line mb-8"
          />
        )}

        {title && <p className="section-label">{title}</p>}

        <h1 className="font-display text-5xl md:text-6xl font-normal leading-[1.05] tracking-tight max-w-4xl">
          {name || 'Portfolio'}
        </h1>

        {tagline && (
          <p className="mt-6 text-xl text-ink max-w-xl leading-relaxed font-display">{tagline}</p>
        )}

        {(profile?.location || profile?.available_for_work) && (
          <p className="mt-6 text-sm text-muted">
            {profile.location && <>Based in {profile.location}. </>}
            {profile.available_for_work && <>Open to new work.</>}
          </p>
        )}

        <div className="mt-10 flex flex-wrap gap-4">
          <Button href="/projects" size="lg" icon={<ArrowRight size={18} />}>
            See the work
          </Button>
          <Button href="/contact" variant="secondary" size="lg">
            Get in touch
          </Button>
        </div>
      </div>
    </section>
  );
}
