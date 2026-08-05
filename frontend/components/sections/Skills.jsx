'use client';

import { motion } from 'framer-motion';

export default function Skills({ grouped = {} }) {
  const categories = Object.keys(grouped);

  return (
    <section id="skills" className="py-24">
      <div className="container-page">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm uppercase tracking-widest text-accent-light mb-3">Skills</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Technologies I <span className="text-gradient">work with</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {categories.map((category, i) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="glass glass-hover rounded-2xl p-6"
            >
              <h3 className="font-display font-semibold mb-5">{category}</h3>
              <div className="space-y-4">
                {grouped[category].map((skill) => (
                  <div key={skill.id || skill.name}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-white/80">{skill.name}</span>
                      <span className="text-white/40">{skill.proficiency ?? 80}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.proficiency ?? 80}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-accent to-cyan-accent"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
