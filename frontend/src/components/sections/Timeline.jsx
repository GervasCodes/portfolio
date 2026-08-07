import { motion } from 'framer-motion';

function formatDate(date) {
  if (!date) return 'Present';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

export default function Timeline({ title, items = [] }) {
  return (
    <div>
      <h2 className="font-display text-xl font-semibold mb-8">{title}</h2>
      <div className="relative pl-6 border-l border-white/10 space-y-8">
        {items.map((item, i) => (
          <motion.div
            key={item.id || i}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="relative"
          >
            <span className="absolute -left-[29px] top-1.5 flex h-3 w-3">
              {item.is_current && (
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent-light opacity-60 animate-ping" />
              )}
              <span className="relative inline-flex w-3 h-3 rounded-full bg-gradient-to-r from-accent to-cyan-accent" />
            </span>
            <div className="card-premium glass-hover p-5">
              <p className="text-xs text-white/40 mb-1">
                {formatDate(item.start_date)} — {item.is_current ? 'Present' : formatDate(item.end_date)}
              </p>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-accent-light mb-2">{item.organization}</p>
              {item.description && <p className="text-sm text-white/55">{item.description}</p>}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
