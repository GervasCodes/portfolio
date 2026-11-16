import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useMagnetic } from '@/hooks/usePointerEffects';

// Variants: primary (accent, gradient glow on hover) / secondary (outlined) /
// ghost / danger. Pill-shaped, >= 44px tall on touch, focus ring comes from the
// global :focus-visible rule. `magnetic` (default on for primary + secondary)
// makes the button drift toward a fine pointer; it is a no-op on touch and
// for reduced motion.
const BASE =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium select-none whitespace-nowrap ' +
  'transition-[background-color,border-color,color,box-shadow,transform] duration-base ease-standard ' +
  'active:scale-[0.98] [@media(pointer:coarse)]:min-h-11 ' +
  'disabled:opacity-50 disabled:pointer-events-none aria-disabled:opacity-50 aria-disabled:pointer-events-none';

const VARIANTS = {
  primary: 'btn-primary bg-accent text-accent-ink border border-accent',
  secondary: 'bg-transparent text-ink border border-control hover:border-ink hover:bg-ink/5',
  ghost: 'text-muted border border-transparent hover:text-ink hover:bg-ink/5',
  danger: 'bg-transparent text-danger border border-danger hover:bg-danger hover:text-accent-ink',
};

const SIZES = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

// External / absolute URLs (http, mailto, tel, #) stay plain <a> tags;
// react-router <Link> is only for internal routes.
const isExternalHref = (href) => /^([a-z]+:|#)/i.test(href);

export function Button({
  children, variant = 'primary', size = 'md', href, type = 'button',
  onClick, disabled, loading = false, className = '', icon, magnetic, ...rest
}) {
  const ref = useRef(null);
  const isDisabled = disabled || loading;
  const isMagnetic = (magnetic ?? (variant === 'primary' || variant === 'secondary')) && !isDisabled;
  useMagnetic(ref, isMagnetic);

  const classes = `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${isMagnetic ? 'magnetic' : ''} ${className}`;

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
          ref={ref}
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
      <Link ref={ref} to={href} className={classes} aria-disabled={isDisabled || undefined} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button ref={ref} type={type} onClick={onClick} disabled={isDisabled} className={classes} {...rest}>
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
      className={`surface surface-hover w-11 h-11 rounded-full inline-flex items-center justify-center text-muted hover:text-ink hover:border-control ${className}`}
      {...rest}
    >
      {icon}
    </button>
  );
}

export default Button;
