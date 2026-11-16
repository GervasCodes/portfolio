import { useState } from 'react';
import { ArrowUpRight, Award, Images, Trophy } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import Card from '@/components/ui/Card';
import Reveal from '@/components/ui/Reveal';
import Lightbox from '@/components/projects/Lightbox';
import { achievementImages, credentialDates, yearOf } from '@/utils/aboutContent';
import { isRealUrl } from '@/utils/projectContent';

const IMAGE_BUTTON = 'group absolute inset-0 block h-full w-full focus-visible:outline-offset-[-4px]';

/**
 * Certificates and achievements with their real images, in one numbered
 * section. A picture opens the keyboard-accessible lightbox; a credential
 * link opens in a new tab. A card with no image shows a designed icon tile
 * (certificates) or is text-only (achievements); nothing is invented.
 */
export default function CertificatesAchievements({ certificates = [], achievements = [], number }) {
  const [view, setView] = useState({ items: [], index: null, label: '' });
  if (!certificates.length && !achievements.length) return null;

  const open = (items, index, label) => setView({ items, index, label });

  return (
    <section id="recognition" aria-labelledby="recognition-title" className="scroll-mt-24 border-t border-line py-16 md:py-24">
      <div className="container-page">
        <SectionHeader
          number={number}
          eyebrow="Recognition"
          title={<span id="recognition-title">Certificates &amp; <em>achievements</em></span>}
        />

        {certificates.length > 0 && (
          <div>
            <h3 className="section-label mb-6">Certificates</h3>
            <ul className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
              {certificates.map((c, i) => {
                const image = isRealUrl(c.badge_image_url) ? c.badge_image_url : '';
                const dates = credentialDates(c);
                const caption = [c.title, c.issuer].filter(Boolean).join(' · ');
                return (
                  <Reveal as="li" key={c.id || i} delay={Math.min(i, 5) * 60} className="flex">
                    <Card className="flex w-full flex-col">
                      <div className="relative aspect-[16/10] border-b border-line bg-surface-2">
                        {image ? (
                          <button
                            type="button"
                            className={IMAGE_BUTTON}
                            aria-label={`Enlarge image: ${c.title}`}
                            onClick={() => open([{ id: `c-${c.id ?? i}`, media_type: 'image', url: image, caption }], 0, 'Certificate image')}
                          >
                            <img
                              src={image}
                              alt=""
                              width="320"
                              height="200"
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-contain p-5 transition-transform duration-base ease-standard group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                            />
                          </button>
                        ) : (
                          <span className="absolute inset-0 flex items-center justify-center text-accent">
                            <Award size={36} aria-hidden="true" />
                          </span>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col p-5 md:p-6">
                        {c.issuer && <p className="m-0 text-sm text-muted">{c.issuer}</p>}
                        <h4 className="mt-1 font-display text-2xl font-normal leading-tight tracking-tight">{c.title}</h4>
                        {dates && <p className="mt-2 font-mono text-xs uppercase tracking-[0.12em] text-muted">{dates}</p>}
                        {isRealUrl(c.credential_url) && (
                          <a
                            href={c.credential_url}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`${c.title}, view credential (opens in a new tab)`}
                            className="mt-auto inline-flex min-h-11 items-center gap-1 pt-3 text-sm text-accent hover:underline"
                          >
                            View credential <ArrowUpRight size={14} aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    </Card>
                  </Reveal>
                );
              })}
            </ul>
          </div>
        )}

        {achievements.length > 0 && (
          <div className={certificates.length > 0 ? 'mt-16' : ''}>
            <h3 className="section-label mb-6">Achievements</h3>
            <ul className="m-0 grid list-none items-start gap-4 p-0 md:grid-cols-2">
              {achievements.map((a, i) => {
                const images = achievementImages(a).filter((img) => isRealUrl(img.url));
                const year = yearOf(a.date);
                return (
                  <Reveal as="li" key={a.id || i} delay={Math.min(i, 3) * 60}>
                    <Card className="flex w-full flex-col">
                      {images.length > 0 && (
                        <div className="relative aspect-video border-b border-line bg-surface-2">
                          <button
                            type="button"
                            className={IMAGE_BUTTON}
                            aria-label={`${images.length > 1 ? `Open ${images.length} photos` : 'Enlarge image'}: ${a.title}`}
                            onClick={() => open(images, 0, `${a.title} photos`)}
                          >
                            <img
                              src={images[0].url}
                              alt=""
                              width="640"
                              height="360"
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover transition-transform duration-slow ease-standard group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                            />
                            {images.length > 1 && (
                              <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-scrim/70 px-3 py-1 font-mono text-xs text-on-scrim">
                                <Images size={14} aria-hidden="true" /> {images.length} photos
                              </span>
                            )}
                          </button>
                        </div>
                      )}
                      <div className="flex flex-1 flex-col p-5 md:p-6">
                        {images.length === 0 && <Trophy size={22} aria-hidden="true" className="mb-4 text-accent" />}
                        {year && <p className="m-0 font-mono text-xs uppercase tracking-[0.12em] text-muted">{year}</p>}
                        <h4 className="mt-2 font-display text-2xl font-normal leading-tight tracking-tight">{a.title}</h4>
                        {a.description && <p className="mt-3 max-w-measure whitespace-pre-line text-sm text-muted">{a.description}</p>}
                      </div>
                    </Card>
                  </Reveal>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <Lightbox
        items={view.items}
        index={view.index}
        label={view.label}
        onIndex={(i) => setView((v) => ({ ...v, index: i }))}
        onClose={() => setView((v) => ({ ...v, index: null }))}
      />
    </section>
  );
}
