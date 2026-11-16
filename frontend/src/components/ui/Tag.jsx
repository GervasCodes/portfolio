/** Small mono label for technologies, categories, statuses. Tinted, never a loud fill. */
const TONES = {
  neutral: 'text-muted border-line bg-ink/5',
  accent: 'text-accent border-accent/30 bg-accent/[var(--tint-alpha)]',
  danger: 'text-danger border-danger/30 bg-danger/10',
  warning: 'text-warning border-warning/30 bg-warning/10',
  success: 'text-success border-success/30 bg-success/10',
};

export default function Tag({ tone = 'neutral', className = '', children }) {
  return (
    <span
      className={`inline-flex items-center border rounded-md px-2 py-0.5 text-xs font-medium ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
