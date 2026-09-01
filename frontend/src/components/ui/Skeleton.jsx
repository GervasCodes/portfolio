/**
 * Generic skeleton loading block — uses the `.skeleton` shimmer CSS
 * already defined in index.css. Pass a className for size/shape
 * (width, height, rounded-*) the same way you would any other element.
 */
export default function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded-lg ${className}`} aria-hidden="true" />;
}
