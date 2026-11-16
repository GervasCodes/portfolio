import PlaceholderArt from './PlaceholderArt';

/**
 * Designed empty state: placeholder art + a short line + an optional action.
 * Used whenever the CMS has no data yet. Never a blank gap, never fake content.
 */
export default function EmptyState({ title, description, action, seed, className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded-3xl border border-dashed border-line bg-surface text-center ${className}`}>
      <PlaceholderArt seed={seed || title || 'empty'} className="absolute inset-0 w-full h-full opacity-50" />
      <div className="relative px-6 py-14 md:py-20">
        <p className="font-display text-2xl md:text-3xl tracking-tight">{title}</p>
        {description && <p className="mt-3 text-muted max-w-md mx-auto text-balance">{description}</p>}
        {action && <div className="mt-6 flex justify-center">{action}</div>}
      </div>
    </div>
  );
}
