import { Award, Trophy, ExternalLink } from 'lucide-react';
import ProjectGallery from '@/components/projects/ProjectGallery';

export default function CertificatesAchievements({ certificates = [], achievements = [] }) {
  if (!certificates.length && !achievements.length) return null;

  return (
    <section className="py-16">
      <div className="container-page grid md:grid-cols-2 gap-10">
        {certificates.length > 0 && (
          <div>
            <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
              <Award size={18} className="text-accent" /> Certifications
            </h2>
            <div className="space-y-3">
              {certificates.map((c, i) => (
                <div
                  key={c.id || i}
                  className="card surface-hover p-4 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="font-medium text-sm">{c.title}</p>
                    <p className="text-xs text-muted">{c.issuer}</p>
                  </div>
                  {c.credential_url && (
                    <a href={c.credential_url} target="_blank" rel="noreferrer" className="text-muted hover:text-ink">
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {achievements.length > 0 && (
          <div>
            <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
              <Trophy size={18} className="text-accent" /> Achievements
            </h2>
            <div className="space-y-3">
              {achievements.map((a, i) => (
                <div
                  key={a.id || i}
                  className="card surface-hover p-4"
                >
                  <p className="font-medium text-sm">{a.title}</p>
                  {a.description && <p className="text-xs text-muted mt-1">{a.description}</p>}
                  {Array.isArray(a.gallery) && a.gallery.length > 0 && (
                    <div className="mt-3">
                      <ProjectGallery images={a.gallery} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
