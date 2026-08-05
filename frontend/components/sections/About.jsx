'use client';

import { motion } from 'framer-motion';
import { MapPin, Briefcase, Mail } from 'lucide-react';

export default function About({ profile }) {
  const stats = [
    { label: 'Years of Experience', value: `${profile?.years_experience ?? 3}+` },
    { label: 'Projects Shipped', value: '20+' },
    { label: 'Happy Clients', value: '10+' },
  ];

  return (
    <section id="about" className="py-24">
      <div className="container-page grid md:grid-cols-2 gap-14 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm uppercase tracking-widest text-accent-light mb-3">About Me</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            Turning ideas into <span className="text-gradient">reliable software</span>
          </h2>
          <p className="text-white/60 leading-relaxed mb-6">
            {profile?.bio ||
              'A passionate software engineer specializing in modern full-stack development, clean architecture, and delightful user experiences.'}
          </p>

          <div className="flex flex-col gap-3 text-sm text-white/70">
            {profile?.location && (
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-accent-light" /> {profile.location}
              </div>
            )}
            <div className="flex items-center gap-3">
              <Briefcase size={16} className="text-accent-light" />
              {profile?.title || 'Full-Stack Software Engineer'}
            </div>
            {profile?.email && (
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-accent-light" /> {profile.email}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="glass glass-hover rounded-2xl p-6 text-center">
              <p className="font-display text-3xl font-bold text-gradient">{stat.value}</p>
              <p className="text-xs text-white/50 mt-2">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
