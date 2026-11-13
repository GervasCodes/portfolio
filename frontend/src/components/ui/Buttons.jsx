import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// Flat buttons: solid fill or 1px outline, colour change on hover, no
// gradients, glow, shine or scale. Focus ring comes from the global
// :focus-visible rule.
const BASE =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium select-none ' +
  'transition-colors duration-base ease-standard ' +
  'disabled:opacity-50 disabled:pointer-events-none aria-disabled:opacity-50 aria-disabled:pointer-events-none';

const VARIANTS = {
  primary: 'bg-accent text-accent-ink border border-accent hover:bg-ink hover:border-ink',
  secondary: 'bg-transparent text-ink border border-ink/40 hover:border-ink hover:bg-ink hover:text-bg',
  ghost: 'text-muted border border-transparent hover:text-ink hover:bg-ink/5',
  danger: 'bg-transparent text-danger border border-danger hover:bg-danger hover:text-accent-ink',
};

const SIZES = {
  sm: 'px-3.5 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

// External / absolute URLs (http, mailto, tel, #) should stay as plain <a>
// tags rather than react-router <Link>, which is only for internal routes.
const isExternalHref = (href) => /^([a-z]+:|#)/i.test(href);

export function Button({
  children, variant = 'primary', size = 'md', href, type = 'button',
  onClick, disabled, loading = false, className = '', icon, ...rest
}) {
  const isDisabled = disabled || loading;
  const classes = `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  const content = (
    <>
      {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : icon}
      <span>{children}</span>
    </>
  );

  if (href) {
    if (isExternalHref(href)) {
      const opensNewTab = !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:');
      return (
        <a
          href={href}
          {...(opensNewTab ? { target: '_blank', rel: 'noreferrer' } : {})}
          className={classes}
          aria-disabled={isDisabled || undefined}
          {...rest}
        >
          {content}
        </a>
      );
    }
    return (
      <Link to={href} className={classes} aria-disabled={isDisabled || undefined} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={isDisabled} className={classes} {...rest}>
      {content}
    </button>
  );
}

export function IconButton({ icon, onClick, label, className = '', ...rest }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`surface surface-hover w-10 h-10 rounded-full flex items-center justify-center text-muted hover:text-ink ${className}`}
      {...rest}
    >
      {icon}
    </button>
  );
}

export default Button;
