/**
 * Generic loading placeholder (calm opacity pulse, see `.skeleton` in
 * index.css; static for reduced motion). Pass a className for size/shape.
 */
export default function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded-lg ${className}`} aria-hidden="true" />;
}
