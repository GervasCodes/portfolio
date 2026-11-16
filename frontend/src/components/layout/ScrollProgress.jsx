import { motion, useScroll } from 'framer-motion';

/**
 * Thin accent bar showing how far down the page the visitor is. It is a
 * reading aid, not decoration, so it stays under reduced motion (it just
 * tracks the scroll position; nothing animates on its own).
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX: scrollYProgress, transformOrigin: '0 50%' }}
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] bg-accent"
    />
  );
}
