import { forwardRef, useRef } from 'react';
import { useSpotlight } from '@/hooks/usePointerEffects';

/**
 * Standard panel: surface fill, 1px hairline, layered soft shadow, 22px radius.
 *  - spotlight   pointer-follow accent highlight (fine pointers only, off for reduced motion)
 *  - interactive the whole card is a link/button: lifts and gets an accent edge on hover/focus
 *  - raised      one surface step higher (surface-2)
 * `as` may be a tag name or a component that forwards its ref (e.g. react-router Link).
 */
const Card = forwardRef(function Card(
  { as: Tag = 'div', interactive = false, spotlight = true, raised = false, className = '', children, ...rest },
  forwardedRef
) {
  const innerRef = useRef(null);
  const setRef = (node) => {
    innerRef.current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };
  useSpotlight(innerRef, spotlight);

  const classes = [
    'card',
    raised && 'card-raised',
    spotlight && 'spotlight',
    interactive && 'card-lift',
    className,
  ].filter(Boolean).join(' ');

  return <Tag ref={setRef} className={classes} {...rest}>{children}</Tag>;
});

export default Card;
