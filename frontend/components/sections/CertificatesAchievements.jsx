'use client';

import { motion } from 'framer-motion';
import { Award, Trophy, ExternalLink } from 'lucide-react';

export default function CertificatesAchievements({ certificates = [], achievements = [] }) {
  if (!certificates.length && !achievements.length) return null;

  return (
    <section className="py-16">
      <div className="container-page grid md:grid-cols-2 gap-10">
        {certificates.length > 0 && (
          <div>
            <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
              <Award size={18} className="text-accent-light" /> Certifications
            </h2>
            <div className="space-y-3">
              {certificates.map((c, i) => (
                <motion.div
                  key={c.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="card-premium glass-hover p-4 flex items-center justify-between gap-3"
                >
                  <div>
                    <p className="font-medium text-sm">{c.title}</p>
                    <p className="text-xs text-white/45">{c.issuer}</p>
                  </div>
                  {c.credential_url && (
                    <a href={c.credential_url} target="_blank" rel="noreferrer" className="text-white/40 hover:text-white">
                      <ExternalLink size={14} />
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {achievements.length > 0 && (
          <div>
            <h2 className="font-display text-xl font-semibold mb-6 flex items-center gap-2">
              <Trophy size={18} className="text-accent-light" /> Achievements
            </h2>
            <div className="space-y-3">
              {achievements.map((a, i) => (
                <motion.div
                  key={a.id || i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="card-premium glass-hover p-4"
                >
                  <p className="font-medium text-sm">{a.title}</p>
                  {a.description && <p className="text-xs text-white/45 mt-1">{a.description}</p>}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
