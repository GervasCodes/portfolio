import { useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useDialog } from '@/hooks/useDialog';

const NAV =
  'absolute top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full ' +
  'bg-scrim/50 text-on-scrim transition-colors duration-fast hover:bg-scrim/70';

/**
 * Full-screen viewer. Keyboard: Esc closes, Left/Right move, Tab stays inside,
 * focus returns to the thumbnail that opened it. The counter is announced politely.
 * `index` is null when closed.
 */
export default function Lightbox({ items, index, onClose, onIndex, label = 'Project gallery' }) {
  const open = index !== null && index !== undefined;
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const count = items.length;

  useDialog(open, ref, onClose);

  const step = useCallback(
    (d) => onIndex((index + d + count) % count),
    [index, count, onIndex]
  );

  useEffect(() => {
    if (!open || count < 2) return undefined;
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, count, step]);

  const item = open ? items[index] : null;
  const fade = reduce ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.2 } };

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          tabIndex={-1}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-scrim/90 p-4 outline-none sm:p-8"
          onClick={onClose}
          {...fade}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close gallery"
            className="absolute right-3 top-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-scrim/50 text-on-scrim transition-colors duration-fast hover:bg-scrim/70 sm:right-6 sm:top-6"
          >
            <X size={20} aria-hidden="true" />
          </button>

          {count > 1 && (
            <>
              <button type="button" aria-label="Previous screen" className={`${NAV} left-2 sm:left-6`} onClick={(e) => { e.stopPropagation(); step(-1); }}>
                <ChevronLeft size={22} aria-hidden="true" />
              </button>
              <button type="button" aria-label="Next screen" className={`${NAV} right-2 sm:right-6`} onClick={(e) => { e.stopPropagation(); step(1); }}>
                <ChevronRight size={22} aria-hidden="true" />
              </button>
            </>
          )}

          <figure className="flex max-h-full max-w-full flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            {item.media_type === 'video' ? (
              <video key={item.id} src={item.url} controls autoPlay playsInline className="max-h-[78vh] max-w-full rounded-lg" />
            ) : (
              <img key={item.id} src={item.url} alt={item.caption || `Screen ${index + 1} of ${count}`} decoding="async" className="max-h-[78vh] max-w-full rounded-lg object-contain" />
            )}
            <figcaption className="max-w-2xl text-center text-sm text-on-scrim/85">
              {item.caption && <span className="block">{item.caption}</span>}
              {count > 1 && (
                <span className="mt-1 block font-mono text-xs uppercase tracking-[0.12em]" aria-live="polite">
                  {index + 1} / {count}
                </span>
              )}
            </figcaption>
          </figure>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
