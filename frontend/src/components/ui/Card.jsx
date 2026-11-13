/**
 * Flat card: solid surface, 1px border, no blur or shadow. Pass `interactive`
 * when the whole card is a link/button so the border responds to hover.
 */
export default function Card({ as: Tag = 'div', interactive = false, className = '', children, ...rest }) {
  return (
    <Tag className={`card ${interactive ? 'surface-hover' : ''} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
