import { motion } from 'framer-motion';
import { MapPin, Briefcase, Mail } from 'lucide-react';

export default function About({ profile }) {
  const stats = [
    { label: 'Years of Experience', value: `${profile?.years_experience ?? 3}+` },
    { label: 'Projects Shipped', value: '3+' },
    { label: 'Happy Clients', value: '3+' },
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
          <p className="section-label">About Me</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
            Turning ideas into <span className="text-gradient">reliable software</span>
          </h2>
          <p className="text-white/60 leading-relaxed mb-6">
            {profile?.bio ||
              'Full-Stack Software Engineer passionate about building scalable, high-performance web applications with modern technologies, clean architecture, and intuitive user experiences. Dedicated to creating secure, maintainable, and impactful digital solutions that solve real-world problems.'}
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
        >
          <div className="relative rounded-2xl overflow-hidden border border-white/10 mb-4 aspect-[16/10]">
            <img
              src="https://images.pexels.com/photos/34803978/pexels-photo-34803978.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Developer workspace with a laptop showing code, a plant, and a cup of coffee"
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-background/0 to-background/0" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.08 }}
                className="card-premium glass-hover p-6 text-center"
              >
                <p className="font-display text-3xl font-bold text-gradient">{stat.value}</p>
                <p className="text-xs text-white/50 mt-2 tracking-wide">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
