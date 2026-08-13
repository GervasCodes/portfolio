import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Code2, Layers, Gauge } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

export default function Skills({ grouped = {} }) {
  const categories = Object.keys(grouped);
  const allSkills = useMemo(() => categories.flatMap((c) => grouped[c]), [grouped, categories]);

  const stats = useMemo(() => {
    const total = allSkills.length;
    const avg = total ? Math.round(allSkills.reduce((s, k) => s + (Number(k.proficiency) || 0), 0) / total) : 0;
    return { total, avg, categoryCount: categories.length };
  }, [allSkills, categories]);

  const radarData = useMemo(
    () =>
      categories.map((category) => {
        const items = grouped[category];
        const avg = items.length
          ? Math.round(items.reduce((s, k) => s + (Number(k.proficiency) || 0), 0) / items.length)
          : 0;
        return { category, avg };
      }),
    [grouped, categories]
  );

  return (
    <section id="skills" className="py-24">
      <div className="container-page">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="section-label">Skills</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold">
            Technologies I <span className="text-gradient">work with</span>
          </h2>
        </div>

        {allSkills.length > 0 && (
          <div className="grid sm:grid-cols-3 gap-4 mb-10 max-w-3xl mx-auto">
            <StatCard icon={<Code2 size={16} />} label="Skills" value={stats.total} />
            <StatCard icon={<Layers size={16} />} label="Categories" value={stats.categoryCount} />
            <StatCard icon={<Gauge size={16} />} label="Avg. Proficiency" value={`${stats.avg}%`} />
          </div>
        )}

        {radarData.length > 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="card-premium glass-hover p-6 mb-10 max-w-2xl mx-auto"
          >
            <h3 className="font-display font-semibold mb-2 text-center text-sm text-white/70">Category Strength Overview</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="70%">
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="category" tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9 }} />
                  <Radar dataKey="avg" stroke="#c9a267" fill="#6f8f6b" fillOpacity={0.45} />
                  <Tooltip
                    contentStyle={{ background: 'rgba(15,15,20,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {categories.map((category, i) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="card-premium glass-hover p-6"
            >
              <h3 className="font-display font-semibold mb-5 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Code2 size={14} className="text-accent-light" />
                </span>
                {category}
              </h3>
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

function StatCard({ icon, label, value }) {
  return (
    <div className="glass rounded-2xl p-4 flex items-center gap-3">
      <span className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-accent-light">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-lg font-display font-bold leading-tight">{value}</p>
        <p className="text-xs text-white/50 truncate">{label}</p>
      </div>
    </div>
  );
}
