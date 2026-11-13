/**
 * Generic loading placeholder (calm opacity pulse, see `.skeleton` in
 * index.css). Pass a className for size/shape the same way as any element.
 */
export default function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded-md ${className}`} aria-hidden="true" />;
}
