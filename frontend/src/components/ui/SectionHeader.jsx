/** Eyebrow + heading + optional description, used at the top of every section. */
export default function SectionHeader({ eyebrow, title, description, as: Heading = 'h2', className = '' }) {
  return (
    <header className={`mb-10 ${className}`}>
      {eyebrow && <p className="section-label">{eyebrow}</p>}
      <Heading className="font-display text-3xl md:text-4xl font-normal leading-tight tracking-tight">{title}</Heading>
      {description && <p className="mt-4 text-muted max-w-2xl">{description}</p>}
    </header>
  );
}
