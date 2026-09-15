import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, PlayCircle } from 'lucide-react';

/**
 * Normalizes either shape into { id, media_type, url, caption }:
 *  - `media`  — the new project_media rows (images AND videos)
 *  - `images` — legacy array of plain URL strings (images only)
 */
function normalize(media, images) {
  if (Array.isArray(media) && media.length) {
    return media.map((m, i) => ({
      id: m.id ?? i,
      media_type: m.media_type || 'image',
      url: m.url,
      caption: m.caption || '',
    }));
  }
  if (Array.isArray(images)) {
    return images.map((url, i) => ({ id: i, media_type: 'image', url, caption: '' }));
  }
  return [];
}

export default function ProjectGallery({ media, images = [] }) {
  const items = normalize(media, images);
  const [activeIndex, setActiveIndex] = useState(null);

  if (!items.length) return null;

  const close = () => setActiveIndex(null);
  const prev = () => setActiveIndex((i) => (i - 1 + items.length) % items.length);
  const next = () => setActiveIndex((i) => (i + 1) % items.length);
  const active = activeIndex !== null ? items[activeIndex] : null;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((item, i) => (
          <button
            key={item.id}
            onClick={() => setActiveIndex(i)}
            className="relative aspect-video rounded-xl overflow-hidden glass glass-hover group"
          >
            {item.media_type === 'video' ? (
              <video
                src={item.url}
                className="absolute inset-0 w-full h-full object-cover"
                muted
                playsInline
                preload="metadata"
              />
            ) : (
              <img
                src={item.url}
                alt={item.caption || `Screenshot ${i + 1}`}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            )}
            {item.media_type === 'video' && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                <PlayCircle size={32} className="text-ink/90" />
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm p-6"
            onClick={close}
          >
            <button
              onClick={close}
              className="absolute top-5 right-5 z-10 p-2 rounded-full text-ink/70 hover:text-ink hover:bg-white/10 transition-colors"
              aria-label="Close gallery"
            >
              <X size={24} />
            </button>

            {items.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 p-2 rounded-full text-ink/60 hover:text-ink hover:bg-white/10 transition-colors"
                aria-label="Previous item"
              >
                <ChevronLeft size={32} />
              </button>
            )}

            <motion.div
              key={active.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-full max-w-4xl flex flex-col items-center gap-4 px-10 md:px-16"
              onClick={(e) => e.stopPropagation()}
            >
              {active.media_type === 'video' ? (
                <video
                  src={active.url}
                  className="max-w-full max-h-[78vh] rounded-lg"
                  controls
                  autoPlay
                />
              ) : (
                <img
                  src={active.url}
                  alt={active.caption || ''}
                  decoding="async"
                  className="max-w-full max-h-[78vh] w-auto h-auto object-contain rounded-lg"
                />
              )}
              {active.caption && (
                <p className="text-center text-sm text-ink/60 max-w-2xl">{active.caption}</p>
              )}
            </motion.div>

            {items.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 p-2 rounded-full text-ink/60 hover:text-ink hover:bg-white/10 transition-colors"
                aria-label="Next item"
              >
                <ChevronRight size={32} />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
