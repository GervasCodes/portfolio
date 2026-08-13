import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const BASE = 'relative inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none overflow-hidden select-none';

const VARIANTS = {
  primary: 'bg-gradient-to-r from-accent to-cyan-accent text-white shadow-glow hover:shadow-[0_0_50px_-8px_rgba(111,143,107,0.7)]',
  secondary: 'glass glass-hover text-white',
  ghost: 'text-white/70 hover:text-white hover:bg-white/5',
  danger: 'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20',
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
  onClick, disabled, loading = false, className = '', icon,
}) {
  const isDisabled = disabled || loading;
  const classes = `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  const content = (
    <motion.span
      whileHover={{ scale: isDisabled ? 1 : 1.03 }}
      whileTap={{ scale: isDisabled ? 1 : 0.97 }}
      className={classes}
    >
      {/* Diagonal shine sweep on hover, primary buttons only */}
      {variant === 'primary' && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700"
        />
      )}
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
      <span className="relative">{children}</span>
    </motion.span>
  );

  if (href) {
    if (isExternalHref(href)) {
      return (
        <a href={href} target="_blank" rel="noreferrer" className="inline-block group" aria-disabled={isDisabled}>
          {content}
        </a>
      );
    }
    return (
      <Link to={href} className="inline-block group" aria-disabled={isDisabled}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={isDisabled} className="inline-block group">
      {content}
    </button>
  );
}

export function IconButton({ icon, onClick, label, className = '' }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={`glass glass-hover w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white active:scale-95 transition-transform ${className}`}
    >
      {icon}
    </button>
  );
}

export default Button;
