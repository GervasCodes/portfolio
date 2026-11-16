import { useEffect } from 'react';

// Pointer effects only make sense with a real hovering pointer and when the
// visitor has not asked for reduced motion. Evaluated once per attach.
const canUsePointerEffects = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Pointer-follow spotlight. Writes --mx/--my (px, relative to the element) on
 * pointermove; the `.spotlight` CSS draws the highlight. No React state.
 */
export function useSpotlight(ref, enabled = true) {
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el || !canUsePointerEffects()) return undefined;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    };
    el.addEventListener('pointermove', onMove, { passive: true });
    return () => el.removeEventListener('pointermove', onMove);
  }, [ref, enabled]);
}

/**
 * Magnetic hover: the element drifts a few px toward the pointer.
 * Writes --tx/--ty; the `.magnetic` CSS applies them. Resets on leave/blur.
 */
export function useMagnetic(ref, enabled = true, strength = 0.25, max = 10) {
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el || !canUsePointerEffects()) return undefined;
    const clamp = (v) => Math.max(-max, Math.min(max, v));
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--tx', `${clamp((e.clientX - (r.left + r.width / 2)) * strength)}px`);
      el.style.setProperty('--ty', `${clamp((e.clientY - (r.top + r.height / 2)) * strength)}px`);
    };
    const reset = () => {
      el.style.setProperty('--tx', '0px');
      el.style.setProperty('--ty', '0px');
    };
    el.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerleave', reset);
    el.addEventListener('blur', reset);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', reset);
      el.removeEventListener('blur', reset);
    };
  }, [ref, enabled, strength, max]);
}
