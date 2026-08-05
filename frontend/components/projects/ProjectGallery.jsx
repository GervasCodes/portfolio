'use client';

import { useState } from 'react';
import Image from 'next/image';
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
                className="w-full h-full object-cover"
                muted
                playsInline
                preload="metadata"
              />
            ) : (
              <Image src={item.url} alt={item.caption || `Screenshot ${i + 1}`} fill className="object-cover" />
            )}
            {item.media_type === 'video' && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                <PlayCircle size={32} className="text-white/90" />
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
              className="absolute top-6 right-6 text-white/70 hover:text-white"
              aria-label="Close gallery"
            >
              <X size={24} />
            </button>

            {items.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-4 md:left-10 text-white/60 hover:text-white"
                aria-label="Previous item"
              >
                <ChevronLeft size={32} />
              </button>
            )}

            <motion.div
              key={active.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-full max-w-4xl aspect-video"
              onClick={(e) => e.stopPropagation()}
            >
              {active.media_type === 'video' ? (
                <video src={active.url} className="w-full h-full object-contain" controls autoPlay />
              ) : (
                <Image src={active.url} alt={active.caption || ''} fill className="object-contain" />
              )}
              {active.caption && (
                <p className="absolute -bottom-8 inset-x-0 text-center text-sm text-white/60">{active.caption}</p>
              )}
            </motion.div>

            {items.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-4 md:right-10 text-white/60 hover:text-white"
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
