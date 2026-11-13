/** About intro: bio, portrait, and the facts the profile actually contains. No invented stats. */
export default function About({ profile }) {
  const facts = [
    profile?.title && ['Role', profile.title],
    profile?.location && ['Based in', profile.location],
    profile?.years_experience ? ['Experience', `${profile.years_experience} years`] : null,
  ].filter(Boolean);

  return (
    <section id="about">
      <div className="container-page pb-12 grid gap-10 md:grid-cols-[2fr_1fr]">
        <div>
          <p className="section-label">About</p>
          <h1 className="font-display text-4xl md:text-5xl font-normal leading-tight tracking-tight">
            {profile?.full_name || 'About'}
          </h1>
          {profile?.bio && (
            <p className="mt-6 text-lg leading-relaxed max-w-prose whitespace-pre-line">{profile.bio}</p>
          )}
          {facts.length > 0 && (
            <dl className="mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              {facts.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-muted">{k}</dt>
                  <dd className="m-0">{v}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        {profile?.avatar_url && (
          <img
            src={profile.avatar_url}
            alt={profile.full_name ? `Portrait of ${profile.full_name}` : 'Portrait'}
            loading="lazy"
            decoding="async"
            className="w-full max-w-xs aspect-square object-cover border border-line rounded-md md:justify-self-end"
          />
        )}
      </div>
    </section>
  );
}
