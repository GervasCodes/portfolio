/**
 * A skill level as a plain CSS bar (no chart library). The baseline is the
 * full scale; the accent fill is the level. The number is in the text
 * alternative, so the bar never carries meaning by colour or length alone.
 * The fill grows once when an ancestor `Reveal` becomes visible (see
 * `.level-bar-fill` in index.css) and is simply full-length under reduced motion.
 */
export default function LevelBar({ value, className = '' }) {
  const level = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <>
      <span aria-hidden="true" className={`level-bar ${className}`} style={{ '--level': level / 100 }}>
        <span className="level-bar-fill" />
      </span>
      <span className="sr-only">, level {level} out of 100</span>
    </>
  );
}
