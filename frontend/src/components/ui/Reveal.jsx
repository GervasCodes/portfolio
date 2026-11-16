import { useEffect, useRef } from 'react';

/**
 * Scroll reveal, once. Adds `.is-visible` the first time the element enters
 * the viewport (transform + opacity only, so no layout shift). Reduced motion
 * and browsers without IntersectionObserver show the content immediately.
 */
export default function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
      el.classList.add('is-visible');
      return undefined;
    }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.classList.add('is-visible');
        io.disconnect();
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal-on-scroll ${className}`}
      style={delay ? { '--reveal-delay': `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}
