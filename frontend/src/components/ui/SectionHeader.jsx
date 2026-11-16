/**
 * Section header: oversized decorative number + mono label + heading.
 *   <SectionHeader number="01" eyebrow="Work" title={<>Selected <em>work</em></>} />
 * renders a big "01" followed by the mono label "/ WORK". Wrap one or two words of the title in <em> for the
 * italic serif accent. Backwards compatible: `eyebrow` alone still works.
 *  - sticky: pins under the navbar on desktop (use inside a two-column layout)
 *  - The number is decorative: it is drawn with CSS (data-n + ::before), so it is not text for
 *    screen readers or contrast checkers; the label carries the meaning.
 */
export default function SectionHeader({
  number, eyebrow, title, description, as: Heading = 'h2', sticky = false, className = '',
}) {
  return (
    <header
      className={`mb-10 md:mb-14 ${sticky ? 'md:sticky md:top-[calc(var(--navbar-h)+1rem)] md:self-start' : ''} ${className}`}
    >
      {(number || eyebrow) && (
        <div className="flex items-end gap-4 mb-4">
          {number && <span aria-hidden="true" data-n={number} className="section-number" />}
          {eyebrow && (
            <p className="section-label pb-1">
              {number && <span aria-hidden="true">/ </span>}
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
