/** Long-form content wrapper (case studies, static copy). Markdown output uses the same styles. */
export default function Prose({ className = '', children }) {
  return <div className={`prose ${className}`}>{children}</div>;
}
