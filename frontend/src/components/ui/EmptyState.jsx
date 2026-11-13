/** Shown when a list or page has no content yet. Says what is missing and what to do next. */
export default function EmptyState({ title, description, action, className = '' }) {
  return (
    <div className={`border border-dashed border-line rounded-md px-6 py-14 text-center ${className}`}>
      <p className="font-display text-xl">{title}</p>
      {description && <p className="mt-2 text-muted max-w-md mx-auto">{description}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
