import { motion } from 'framer-motion';
import { ArrowRight, Download, Sparkles, ChevronDown } from 'lucide-react';
import Button from '@/components/ui/Buttons';

export default function Hero({ profile }) {
  const name = profile?.full_name || 'GERVAS ARISTARIC';
  const title = profile?.title || 'Full-Stack Software Engineer';
  const tagline = profile?.tagline || 'I design and build production-grade web applications.';

  return (
    <section className="relative min-h-screen overflow-hidden bg-grid bg-noise">
      {/* Ambient glow — layered + slowly drifting for a less static hero */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/30 rounded-full blur-[140px] pointer-events-none animate-float-slow" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-cyan-accent/20 rounded-full blur-[120px] pointer-events-none animate-float-slower" />
      <div className="absolute top-10 right-1/4 w-[220px] h-[220px] bg-accent-light/10 rounded-full blur-[100px] pointer-events-none animate-float-slow" />

      <div className="container-page relative z-10 pt-32 pb-20">
        {profile?.avatar_url && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full p-[3px] bg-gradient-to-br from-accent to-cyan-accent shadow-glow">
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-background bg-white/5">
                <img
                  src={profile.avatar_url}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs text-white/70 mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <Sparkles size={14} className="text-accent-light" />
          {profile?.available_for_work ? 'Available for new opportunities' : 'Software Engineer'}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight max-w-4xl"
        >
          Hi, I&apos;m <span className="text-gradient">{name}</span>
          <br />
          {title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 text-lg text-white/60 max-w-xl leading-relaxed"
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

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ opacity: { delay: 1, duration: 0.6 }, y: { delay: 1.2, duration: 1.8, repeat: Infinity } }}
        className="hidden md:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-1 text-white/30 z-10"
      >
        <span className="text-[11px] uppercase tracking-widest">Scroll</span>
        <ChevronDown size={16} />
      </motion.div>
    </section>
  );
}
