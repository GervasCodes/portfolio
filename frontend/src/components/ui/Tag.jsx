/** Small label for technologies, categories, statuses. Outlined, not filled. */
const TONES = {
  neutral: 'text-muted border-line',
  accent: 'text-accent border-accent/40',
  danger: 'text-danger border-danger/40',
  warning: 'text-warning border-warning/40',
  success: 'text-success border-success/40',
};

export default function Tag({ tone = 'neutral', className = '', children }) {
  return (
    <span className={`inline-flex items-center border rounded-md px-2 py-0.5 text-xs font-medium ${TONES[tone]} ${className}`}>
      {children}
    </span>
  );
}
