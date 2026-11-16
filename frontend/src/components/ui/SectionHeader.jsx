/**
 * Section header: small label + heading.
 *   <SectionHeader eyebrow="Work" title="Selected work" />
 *  - sticky: pins under the navbar on desktop (use inside a two-column layout)
 *  - `number` is still accepted so existing callers keep working, but is no longer shown.
 */
export default function SectionHeader({
  number, eyebrow, title, description, as: Heading = 'h2', sticky = false, className = '',
}) {
  return (
    <header
      className={`mb-10 md:mb-14 ${sticky ? 'md:sticky md:top-[calc(var(--navbar-h)+1rem)] md:self-start' : ''} ${className}`}
    >
      {(number || eyebrow) && (
        <div className="mb-3">
          {eyebrow && (
            <p className="section-label">
              {eyebrow}
            </p>
          )}
        </div>
      )}
      <Heading className="font-display text-3xl md:text-4xl font-normal leading-[1.05] tracking-tight text-balance">
        {title}
      </Heading>
      {description && <p className="mt-4 text-muted max-w-2xl">{description}</p>}
    </header>
  );
}
