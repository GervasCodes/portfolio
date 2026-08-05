'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Download, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Buttons';

export default function Hero({ profile }) {
  const name = profile?.full_name || 'GERVAS GERVAS';
  const title = profile?.title || 'Full-Stack Software Engineer';
  const tagline = profile?.tagline || 'I design and build production-grade web applications.';

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-grid">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/30 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-accent/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="container-page relative z-10 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs text-white/70 mb-8"
        >
          <Sparkles size={14} className="text-accent-light" />
          {profile?.available_for_work ? 'Available for new opportunities' : 'Software Engineer'}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-5xl md:text-7xl font-bold leading-[1.05] max-w-4xl"
        >
          Hi, I&apos;m <span className="text-gradient">{name}</span>
          <br />
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 text-lg text-white/60 max-w-xl"
        >
          {tagline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <Button href="/projects" size="lg" icon={<ArrowRight size={18} />}>
            View My Work
          </Button>
          <Button href="/resume" variant="secondary" size="lg" icon={<Download size={18} />}>
            Download Resume
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
